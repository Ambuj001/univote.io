const express = require('express');
const tokenVerifyRouter = express.Router();

const { authenticate } = require('./jwtCheck');

tokenVerifyRouter.get('/api/Verify-Token', authenticate, (req, res) => {
  res.status(200).json({ message: 'Token is valid', user: req.user });
});


module.exports = tokenVerifyRouter;