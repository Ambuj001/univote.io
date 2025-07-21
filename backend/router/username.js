const express = require('express');
const showUsernameRouter = express.Router();
const { getUsername } = require('../authenticate/jwtCheck');

showUsernameRouter.get('/api/Username', getUsername);

module.exports = showUsernameRouter;
