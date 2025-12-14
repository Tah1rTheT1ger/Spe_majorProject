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
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.use('/api/bills', billingRoutes);

const PORT = process.env.PORT || 4400;
connectDB(process.env.MONGO_URI).then(() => {
  app.listen(PORT, () => {
    console.log(`Billing service listening on ${PORT}`);
  });
});
