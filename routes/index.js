const express = require('express');
const router = express.Router();

router.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

module.exports = router;
