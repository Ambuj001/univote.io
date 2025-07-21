const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const path = require('path');

const { check, validationResult } = require('express-validator');
const Voters = require('../models/voter'); 
const { sendOtp, verifyOtp, resendOtp } = require('../utils/emailOtp');
const { sendJwtToken } = require('../authenticate/jwtCheck');

exports.signUp = [
  check('email')
  .normalizeEmail()
  .isEmail()
  .withMessage('Valid email is required'),

  check('password')
  .trim(),

  check('confirmPassword')
  .trim()
  .notEmpty()
  .custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Passwords do not match');
    }
    return true;
  }),

  async (req, res) => {
    try {
      const { email, password } = req.body;
      const username = email.split('@')[0];
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array(),
          formData: { username, email }
        });
      }

      const voterExists = await Voters.findOne({ email });

      if (voterExists) {
        return res.status(409).json({
          errors:[{ param: 'email', msg: 'Email Already Exists' }]
        })
      }

      const usernameExists = await Voters.findOne({ username });
      if (usernameExists) {
        return res.status(409).json({
          errors: [{ param: 'username', msg: 'Username Already Exists' }]
        });
      }

      const otpSent = await sendOtp(email);

      if (otpSent.sent === false){
        return res.status(400).json({
          errors: [{ msg: otpSent.message, param: 'email' }]
        });
      }
      else {
        req.session.formData = { username, email, password };
        
        return res.status(200).json({
          errors:[{ msg: otpSent.message, param: 'email' }]
        })
      }
    } catch (error) {
        console.error('SignUp error:', error);
        res.status(500).json({ 
          errors: [{ param: 'form', msg: 'Server Error.' }]
        }); 
      }
  }     
]

exports.saveUserToDb = async (req,res) => {
  const { otp } = req.body;
  const { username, email, password } = req.session.formData;

  const otpVerified = await verifyOtp(email, otp);

  if (otpVerified.verified === false){
    return res.status(400).json({
      errors: [{ msg: otpVerified.message, param: 'email' }]
    });
  } else {
    const hashedPassword = await bcrypt.hash(password, 12);
    const voter = new Voters({
      username,
      email,
      password: hashedPassword
    });

    await voter.save()
      .then(() => {
        console.log('Voter saved successfully', voter);
      })
      .catch((error) => {
        console.error('Error saving voter:', error);
        if (error.code === 11000 && error.keyPattern?.email) {
          return res.status(400).json({
            errors: [{ param: 'email', msg: 'Email already exists' }]
          });
        }
      
        // Fallback for other DB errors
        return res.status(500).json({
          errors: [{ param: 'form', msg: 'Something went wrong. Please try again.' }]
        });
      });

    sendJwtToken(res, { email, username });

    res.status(201).json({
      message: 'User Registered Succesfully.' 
    });
  }
}

exports.resendOtp = async (req,res) => {

try{
  const { email } = req.session.formData;

  if (!email) {
    return res.status(400).json({ sent: false, message: 'Email is required' });
  }

  const response = await resendOtp(email);
  if (response.sent === false) {
    return res.status(400).json({ 
      errors: [{ param: 'form', msg: response.message }]
    })
  }
  return res.status(200).json({
    message: response.message
  });
} catch (error) {
    console.error('Resend OTP Error:', error);
    return res.status(500).json({
      errors: [{ param: 'form', msg: 'Server error while resending OTP' }]
    });
  }
}
  
