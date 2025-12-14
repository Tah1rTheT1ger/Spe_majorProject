require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const connectDB = require('./config/db');
const initStorage = require('./config/storage');
const scanRoutes = require('./routes/scanRoutes');

const app = express();

// Init storage folder
initStorage();

app.use(cors());
app.use(bodyParser.json());

// Simple Request Logger for ELK Visualization
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// If you want to serve raw files under /uploads directly (optional)
// const path = require('path');
// app.use('/static/scans', express.static(path.resolve(process.env.FILE_UPLOAD_DIR || './uploads/scans')));

app.use('/api/scans', scanRoutes);

const PORT = process.env.PORT || 4200;

connectDB(process.env.MONGO_URI).then(() => {
  app.listen(PORT, () => {
    console.log(`Scans service running on port ${PORT}`);
  });
});
