const jwt = require('jsonwebtoken');
const User = require('../models/User');

//jifekjfekljfkijole
const createToken = (user, secret, expiresIn) => {
  return jwt.sign({ id: user._id, role: user.role, email: user.email }, secret, { expiresIn });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    let existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'User already exists' });

    const user = new User({ name, email, password, role });
    await user.save();
    const token = createToken(user, process.env.JWT_SECRET, process.env.JWT_EXPIRES_IN || '7d');
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = createToken(user, process.env.JWT_SECRET, process.env.JWT_EXPIRES_IN || '7d');
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getDoctors = async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor' }).select('-password');
    res.json(doctors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
