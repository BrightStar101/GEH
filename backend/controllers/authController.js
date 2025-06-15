/**
 * authController.js
 *
 * Global Entry Hub (GEH)
 * Authentication Controller
 *
 * Purpose:
 * Handles user registration, login, and secure JWT issuance.
 * Integrates input validation, password hashing, and user lookup logic.
 */

const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const config = require('../config/config');
const logger = require('../utils/loggerUtils');
const getSanitizedAdminList = require('../config/allowedAdmins');
const AuditLog = require('../models/AuditLog');
const userModel = require('../models/userModel');

/**
 * Registers a new user into the system.
 * @param {Object} req - Express request object (expects email + password)
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
async function registerUser(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(409).json({ message: 'User already exists.' });
    }

    const isAdmin = (email==='ryan@globalentryhub.com' || email==='grant@globalentryhub.com' || email==='julia@globalentryhub.com')

    const newUser = await User.create({
      email: email.toLowerCase(),
      password: password,
      planTier: 'free',
      createdAt: new Date(),
      role: isAdmin ? 'admin' : 'user'
    });

    await new AuditLog({
      userId: newUser._id,
      action: 'Register'
    }).save();

    const token = generateJWT({
      id: newUser._id,
      email: newUser.email,
      role: newUser.role,
      planTier: newUser.planTier
    });

    res.status(201).json({
      message: 'Registration successful.',
      token,
      user: {
        id: newUser._id,
        email: newUser.email,
        planTier: newUser.planTier,
      },
    });
  } catch (error) {
    logger.logError('AuthController: Registration failed.', error);
    res.status(500).json({ message: 'Internal server error during registration.' });
  }
}

/**
 * Logs in an existing user.
 * @param {Object} req - Express request object (expects email + password)
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
async function loginUser(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "Email doesn't exist." });
    }

    const isMatch = await user.isPasswordValid(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Password doesn't match" });
    }

    const token = generateJWT({
      id: user._id,
      email: user.email,
      role: user.role,
      planTier: user.planTier
    });

    await new AuditLog({
      userId: user._id,
      action: 'Login'
    }).save();

    res.status(200).json({
      message: 'Login successful.',
      token,
      user: {
        id: user._id,
        email: user.email,
      },
    });
  } catch (error) {
    logger.logError('AuthController: Login failed.', error);
    res.status(500).json({ message: 'Internal server error during login.' });
  }
}

/**
 * Verifies if the logged-in user is an authorized admin.
 * @param {Object} req - Express request object (expects valid JWT and req.user.email)
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
async function verifyAdminAccess(req, res) {
  try {
    const allowedAdmins = getSanitizedAdminList();
    const email = req.user?.email;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Missing user email from token.' });
    }

    const isAuthorized = allowedAdmins.includes(email.toLowerCase());

    return res.status(200).json({
      success: true,
      isAuthorized,
    });
  } catch (error) {
    logger.logError('AuthController: Admin verification failed.', error);
    return res.status(500).json({
      success: false,
      message: 'Internal error during admin verification.',
    });
  }
}

/**
 * Get profile of the user that is currently logged in.
 * @param {Object} req - Express request object (expects valid JWT and req.user.email)
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
async function getProfile(req, res) {
  try {
    const user = await userModel.findById(req.user.id)
    return res.status(200).json({
      user
    });
  } catch (error) {
    logger.logError('AuthController: Get profile failed.', error);
    return res.status(500).json({
      success: false,
      message: 'Internal error during getting profile.',
    });
  }
}

/**
 * Generates a signed JWT for a given user ID.
 * @param {Object} userData
 * @returns {string} JWT token
 */
function generateJWT(userData) {
  return jwt.sign(userData, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
}

module.exports = {
  registerUser,
  loginUser,
  verifyAdminAccess,
  getProfile
};
