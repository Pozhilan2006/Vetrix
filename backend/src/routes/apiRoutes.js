const express = require('express');
const router = express.Router();
const apiController = require('../controllers/apiController');

// Route: /api/wallet/balance/:address
router.get('/wallet/balance/:address', apiController.getBalance);

// Route: /api/wallet/history/:address
router.get('/wallet/history/:address', apiController.getHistory);

// Route: /api/market/prices
router.get('/market/prices', apiController.getMarketPrices);

module.exports = router;
