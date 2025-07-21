const express = require('express');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const Voter = require('../models/voter'); // Assuming you have a Voter model defined

const sendJwtToken = async (res, payload) => {
    const isProduction = process.env.NODE_ENV === 'production';
    const Secret_Key = process.env.SECRET_KEY;

    if (!Secret_Key) {
        throw new Error('SECRET_KEY is not defined in environment variables');
    }

    const token = jwt.sign(payload, Secret_Key, { expiresIn: '7d' });

    res.cookie('token', token, { 
      httpOnly: true, 
      secure: isProduction, 
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 
    });
}

const authenticate = async (req, res, next) => {
    const token = req.cookies.token;
    const Secret_Key = process.env.SECRET_KEY;

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized access. No token provided.' }); 
    }
    if (!Secret_Key) {
        throw new Error('SECRET_KEY is not defined in environment variables');
    }
    try {
        const decoded = jwt.verify(token, Secret_Key);
        req.user = decoded;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired. Please log in again.' });
        }
        return res.status(403).json({ message: 'Invalid token.' });
    }
};

const logoutUser = async (req,res) => {
    const isProduction = process.env.NODE_ENV === 'production';
    res.clearCookie('token',{
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
    });
    res.status(200).json({ message: 'Logout Successfully' })
};

const getUsername = async (req, res) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: 'Sign In Required' });
    }
    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        const email = decoded.email;
        const user = await Voter.findOne({ email });
         if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        res.status(200).json({ username: user.username, linkedAccounts: user.linkedAccounts });

    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired. Please log in again.' });
        }
        return res.status(403).json({ message: 'Invalid token.' });
    }
};

module.exports = { authenticate, sendJwtToken, logoutUser, getUsername };

