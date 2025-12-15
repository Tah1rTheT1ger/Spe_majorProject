require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const connectDB = require('./config/db');
const billingRoutes = require('./routes/billingRoutes');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Simple Request Logger for ELK Visualization
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} ${res.statusCode} ${Date.now() - start}ms`);
  });
  next();
});

app.use('/api/bills', billingRoutes);

const PORT = process.env.PORT || 4400;
connectDB(process.env.MONGO_URI).then(() => {
  app.listen(PORT, () => {
    console.log(`Billing service listening on ${PORT}`);
  });
});
