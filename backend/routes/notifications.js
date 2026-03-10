const express = require('express');
const router = express.Router();
const { registerToken } = require('../services/fcm');

router.post('/register-token', registerToken);

module.exports = router;
