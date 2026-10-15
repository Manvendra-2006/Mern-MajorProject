const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const cacheClient = require('../config/redis');

router.get('/', (req, res) => {
  const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  const redisStatus = cacheClient.isRedisConnected() ? 'connected' : 'memory_fallback';

  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    services: {
      database: {
        name: 'MongoDB',
        status: mongoStatus,
      },
      cache: {
        name: 'Redis',
        status: redisStatus,
      },
    },
  });
});

module.exports = router;
