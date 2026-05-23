const express = require('express');
const crypto = require('crypto');
const User = require('../models/User');
const Staff = require('../models/StaffModel');
const router = express.Router();

// Generate reset token
const generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Forgot Password - Send reset link
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Check if user exists in either User or Staff collection
    let user = await User.findOne({ email });
    let userType = 'user';

    if (!user) {
      user = await Staff.findOne({ email });
      userType = 'staff';
    }

    if (!user) {
      return res.status(404).json({ message: 'No account found with this email' });
    }

    // Generate reset token
    const resetToken = generateResetToken();
    const resetTokenExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save reset token to user
    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();

    // In a real application, you would send an email here
    // For demo purposes, we'll return the token (in production, remove this)
    const resetUrl = `http://localhost:3001/reset-password?token=${resetToken}&type=${userType}`;

    console.log('Password reset link:', resetUrl); // Log for development

    res.status(200).json({ 
      message: 'Password reset link sent to your email',
      // For development only - remove in production
      resetToken: resetToken,
      resetUrl: resetUrl
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reset Password - Verify token and update password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword, userType } = req.body;

    if (!token || !newPassword || !userType) {
      return res.status(400).json({ message: 'Token, new password, and user type are required' });
    }

    // Find user by reset token
    let user;
    if (userType === 'user') {
      user = await User.findOne({ 
        resetToken: token,
        resetTokenExpiry: { $gt: Date.now() }
      });
    } else {
      user = await Staff.findOne({ 
        resetToken: token,
        resetTokenExpiry: { $gt: Date.now() }
      });
    }

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Update password
    user.password = newPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.status(200).json({ message: 'Password reset successfully' });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Change Password - Authenticated user changes password
router.post('/change-password', async (req, res) => {
  try {
    const { currentPassword, newPassword, userType, email } = req.body;

    if (!currentPassword || !newPassword || !userType || !email) {
      return res.status(400).json({ message: 'Current password, new password, user type, and email are required' });
    }

    // Find user by email
    let user;
    if (userType === 'user') {
      user = await User.findOne({ email });
    } else {
      user = await Staff.findOne({ email });
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: 'Password changed successfully' });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update Profile - Authenticated user updates profile
router.put('/update-profile', async (req, res) => {
  try {
    const { name, email, phone, address, userType, currentEmail } = req.body;

    if (!userType || !currentEmail) {
      return res.status(400).json({ message: 'User type and current email are required' });
    }

    // Find user by current email
    let user;
    if (userType === 'user') {
      user = await User.findOne({ email: currentEmail });
    } else {
      user = await Staff.findOne({ email: currentEmail });
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (address) user.address = address;

    await user.save();

    // Return updated user without password
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({ 
      message: 'Profile updated successfully',
      user: userResponse
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get Profile - Authenticated user gets profile
router.get('/profile', async (req, res) => {
  try {
    const { userType, email } = req.query;

    if (!userType || !email) {
      return res.status(400).json({ message: 'User type and email are required' });
    }

    let user;
    if (userType === 'user') {
      user = await User.findOne({ email });
    } else {
      user = await Staff.findOne({ email });
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return user without password
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({ user: userResponse });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
