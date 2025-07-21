const express = require("express");
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const Otp = require('../models/Otp');

require('dotenv').config();

exports.sendOtp = async (email) => {

  const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS // Use App Password (not your Gmail password)
  },
  tls: process.env.NODE_ENV !== 'production' ? { rejectUnauthorized: false } : undefined
  });

  // Generate a random OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
  const hashedOtp = await bcrypt.hash(otp, 12); // Hash the OTP before saving it to the database  

  const mail = {
    from: 'univote.tech@gmail.com',
    to: email,
    subject: 'Your OTP Code',
    text: `Your OTP is ${otp}. It is valid for 10 minutes.`
  };
  
  try {

    await transporter.sendMail(mail);
    await Otp.create({ email, otp: hashedOtp });
    return{
      sent: true,
      message: 'OTP Sent Successfully'
    };

  } catch (error) {
    console.error('Error sending OTP:', error);
    return{
      sent: false,
      message: 'Failed To Send Otp'
    };
  }
}

exports.verifyOtp = async ( email, otp) => {

  try {
    const savedOtp = await Otp.findOne({ email });
    if (!savedOtp) {
      return ({ 
        verified: false,
        message: 'Invalid Otp Or Otp Expired' });
    }

    const now = Date.now();
    const otpAge = now - savedOtp.createdAt.getTime();

    if (otpAge > 10 * 60 * 1000) {
      await Otp.deleteOne({ email }); // Clean up
      return ({ 
        verified: false,
        message: 'OTP expired' });
    }

    const isMatch = await bcrypt.compare(otp, savedOtp.otp);
    if (!isMatch) {
      return ({ 
        verified: false,
        message: 'Invalid OTP' });
    }
    await Otp.deleteOne({ _id: savedOtp._id }); // Delete OTP after verification
 
    return ({
      verified: true,
      message: 'OTP verified successfully' }); 
  }
  catch (error) {
    console.error('Error verifying OTP:', error);
    return({ 
      verified: false,
      message: 'Failed to verify OTP' });
  }
}

exports.resendOtp = async (email) => {
  
 try {
    // Delete previous OTPs for the email (optional but recommended)
    await Otp.deleteMany({ email });

    // Call the original sendOtp function
    const result = await exports.sendOtp(email); // assuming sendOtp is exported as sendOtp.sendOtp

    return result;

  } catch (error) {
    console.error('Error resending OTP:', error);
    return {
      sent: false,
      message: 'Failed to resend OTP',
    };
  }
}

