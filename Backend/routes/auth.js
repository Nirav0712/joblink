const express = require('express');
const User = require('../models/User');
const { authenticate, generateToken } = require('../middleware/auth');
const { validateUserRegistration, validateUserLogin } = require('../middleware/validation');

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', validateUserRegistration, async (req, res) => {
  try {
    const { name, email, password, userType } = req.body;

    console.log("📥 Incoming register request:", req.body); // 👈 log request body

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      console.log("⚠️ User already exists with email:", email);
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email address'
      });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      userType
    });

    await user.save();
    console.log("✅ New user saved to DB:", user); // 👈 log saved doc

    // Generate JWT token
    const token = generateToken(user._id);

    // Return user data without password
    const userData = user.getPublicProfile();

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: userData,
        token
      }
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', validateUserLogin, async (req, res) => {
  try {
    const { email, password, userType } = req.body;
    console.log("🔑 Login attempt:", email, "UserType:", userType); // 👈 log login attempt

    // Find user by email and include password for comparison
    const user = await User.findByEmail(email).select('+password');
    if (!user) {
      console.log("❌ Login failed, user not found:", email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      console.log("⚠️ Login failed, inactive account:", email);
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact support.'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      console.log("❌ Invalid password for:", email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Validate user type if provided
    if (userType && user.userType !== userType) {
      console.log("❌ User type mismatch for:", email, "Expected:", userType, "Actual:", user.userType);
      return res.status(401).json({
        success: false,
        message: `Invalid login. This account is registered as a ${user.userType}, not a ${userType}.`
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = generateToken(user._id);

    // Return user data without password
    const userData = user.getPublicProfile();

    console.log("✅ Login successful:", email);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userData,
        token
      }
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', authenticate, async (req, res) => {
  try {
    const userData = req.user.getPublicProfile();
    console.log("👤 /me called for user:", req.user.email);

    res.json({
      success: true,
      data: {
        user: userData
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user data'
    });
  }
});

// @route   PUT /api/auth/update-password
// @desc    Update user password
// @access  Private
router.put('/update-password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters long'
      });
    }

    // Fetch user with password field for comparison
    const userWithPassword = await User.findById(req.user._id).select('+password');
    
    // Verify current password
    const isCurrentPasswordValid = await userWithPassword.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    userWithPassword.password = newPassword;
    await userWithPassword.save();

    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating password'
    });
  }
});

// Other routes unchanged (logout, refresh, forgot-password, reset-password)

module.exports = router;
