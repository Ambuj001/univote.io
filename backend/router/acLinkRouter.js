const express = require('express');
const router = express.Router();
const { authenticate } = require('../authenticate/jwtCheck');
const { sendCode,verifycode } = require('../controller/acLinkController');

router.post('/api/accounts/send-otp', authenticate, sendCode);
router.post('/api/accounts/verify-otp', authenticate, verifycode);

module.exports = router;