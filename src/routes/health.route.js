const express = require('express');
const router = express.Router();

// Railway & Cloud Health Check Endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    message: 'SS Trading AI Server is healthy!',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

module.exports = router;

