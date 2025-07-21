const express = require('express');
const signInRouter = express.Router();
const { signIn, googleSignIn }= require('../controller/signInController');
 
signInRouter.post('/api/SignIn', signIn);
signInRouter.post('/api/SignIn/Google', googleSignIn);

module.exports = signInRouter;