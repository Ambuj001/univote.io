const { sendOtp,verifyOtp } = require('../utils/emailOtp');
const Voter = require('../models/voter');

exports.sendCode = async (req, res) => {
  const { type, email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    let response;
    if (type === 'iitp') {
      if (!email.endsWith('@iitp.ac.in')) {
        return res.status(400).json({ error: 'Invalid IITP email format' });
      }
      response = await sendOtp(email, 'IITP');
    } else if (type === 'gmail') {
      response = await sendOtp(email, 'Gmail');
    } else {
      return res.status(400).json({ error: 'Invalid account type' });
    }

    if (response.sent) {
      return res.status(200).json({ message: response.message });
    } else {
      return res.status(500).json({ error: response.message });
    }
  } catch (error) {
    console.error('Error sending code:', error);
    return res.status(500).json({ error: 'Failed to send code' });
  }
}

exports.verifycode = async (req, res) => {
  const { email, otp, type } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ error: 'Email and OTP are required' });
  }

  try {
    const response = await verifyOtp(email, otp);

    if (!response.verified) {
      return res.status(400).json({ error: response.message });
    }

    const { username } = req.user;

    // Find the user first
    const user = await Voter.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update the linked account field
    if (type === 'gmail') {
      user.linkedAccounts.google = email; // Or "linked", or the Google ID if available
    } else if (type === 'iitp') {
      user.linkedAccounts.iitp = email; // Or "linked", or the IITP ID if available
    } else if (type === 'x') {
      user.linkedAccounts.x = email; // Or "linked", or the X ID if available
    } else {
      return res.status(400).json({ error: 'Invalid account type' });
    }

    await user.save();

    return res.status(200).json({ message: response.message, linkedAccounts: user.linkedAccounts });
  } catch (error) {
    console.error('Error verifying code:', error);
    return res.status(500).json({ error: 'Failed to verify code' });
  }
};
