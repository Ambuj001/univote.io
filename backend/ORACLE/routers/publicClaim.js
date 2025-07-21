const express = require('express');
const publicClaimRouter = express.Router();
const { authenticate } = require('../../authenticate/jwtCheck');

const { checkPublicClaim } = require('../controllers/publicClaimHandler');

publicClaimRouter.post('/api/CheckPublicClaim', authenticate, checkPublicClaim);

module.exports = publicClaimRouter;
