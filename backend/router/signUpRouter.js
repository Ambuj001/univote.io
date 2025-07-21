const express = require('express'); 
const signUpRouter = express.Router();

const { signUp, saveUserToDb, resendOtp } = require('../controller/signUpController');

signUpRouter.post('/api/SendOtp', signUp);
signUpRouter.post('/api/verifyOtp', saveUserToDb);
signUpRouter.post('/api/ResendOtp', resendOtp);

module.exports = signUpRouter;