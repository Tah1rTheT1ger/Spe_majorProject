require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const connectDB = require('./config/db');
const prescriptionRoutes = require('./routes/prescriptionRoutes');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Simple Request Logger for ELK Visualization
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.use('/api/prescriptions', prescriptionRoutes);

const PORT = process.env.PORT || 4500;
connectDB(process.env.MONGO_URI).then(() => {
  app.listen(PORT, () => {
    console.log(`Prescription service listening on ${PORT}`);
  });
});
