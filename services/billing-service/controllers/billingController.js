const Bill = require('../models/Bill');
const { v4: uuidv4 } = require('uuid');

/**
 * Helper to compute totals
 */
function computeTotals(bill) {
  const subtotal = (bill.items || []).reduce((s, it) => s + (it.cost || 0) * (it.qty || 1), 0);
  const taxRate = 0; // placeholder; replace with config or line-item taxes
  const tax = subtotal * taxRate;
  const total = subtotal + tax;
  bill.subtotal = subtotal;
  bill.tax = tax;
  bill.total = total;
}

/**
 * Create bill
 * body: { patientId, items: [{description,cost,qty}], createdBy }
 */
exports.createBill = async (req, res) => {
  try {
    const { patientId, items = [] } = req.body;
    if (!patientId) return res.status(400).json({ message: 'patientId required' });

    const bill = new Bill({
      patientId,
      items,
      createdBy: req.user?.id
    });
    computeTotals(bill);
    await bill.save();
    res.status(201).json(bill);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getBill = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);
    if (!bill) return res.status(404).json({ message: 'Bill not found' });
    res.json(bill);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.listBills = async (req, res) => {
  try {
    const { patientId, status } = req.query;
    const q = {};
    if (patientId) q.patientId = patientId;
    if (status) q.status = status;
    const list = await Bill.find(q).sort({ createdAt: -1 }).limit(500);
    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error bu can be modified' });
  }
};

exports.addItem = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);
    if (!bill) return res.status(404).json({ message: 'Bill not found' });
    bill.items.push(req.body.item);
    computeTotals(bill);
    // update status if previously paid -> revert to pending
    if (bill.status === 'paid') bill.status = 'pending';
    await bill.save();
    res.json(bill);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Simulate payment
 * body: { amount, method }
 */
exports.payBill = async (req, res) => {
  try {
    const { amount, method = 'online' } = req.body;
    const bill = await Bill.findById(req.params.id);
    if (!bill) return res.status(404).json({ message: 'Bill not found' });

    // compute current due
    const paidSoFar = (bill.payments || []).reduce((s, p) => s + (p.amount || 0), 0);
    const due = bill.total - paidSoFar;
    if (amount <= 0 || amount > due + 0.0001) {
      return res.status(400).json({ message: 'Invalid amount', due });
    }

    const payment = {
      amount,
      method,
      paidAt: new Date(),
      ref: uuidv4()
    };

    bill.payments.push(payment);

    const newPaidTotal = paidSoFar + amount;
    if (Math.abs(newPaidTotal - bill.total) < 0.01) {
      bill.status = 'paid';
    } else {
      bill.status = 'partial';
    }

    await bill.save();
    res.json({ bill, payment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.cancelBill = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);
    if (!bill) return res.status(404).json({ message: 'Bill not found' });
    bill.status = 'cancelled';
    await bill.save();
    res.json(bill);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
