const express = require('express');
const { authenticate, logoutUser } = require('../authenticate/jwtCheck'); // Use named import

const authenticateRouter = express.Router();  

authenticateRouter.get('/api/Authenticate', authenticate, (req, res) => {
  res.status(200).json({ message: 'User authenticated successfully' });
});

authenticateRouter.post('/api/Logout', logoutUser );

module.exports = authenticateRouter;