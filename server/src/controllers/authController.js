const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const generateToken = require('../utils/generateToken');

const isText = (value) => typeof value === 'string' && value.trim().length > 0;

const userResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
});

// POST /api/auth/signup
exports.signup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (![name, email, password].every(isText)) {
    throw new AppError('Name, email and password are required', 400);
  }
  if (await User.findOne({ email: email.toLowerCase().trim() })) {
    throw new AppError('A user with this email already exists', 409);
  }
  const user = await User.create({ name, email, password });
  res.status(201).json({ success: true, token: generateToken(user), user: userResponse(user) });
});

// POST /api/auth/login
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (![email, password].every(isText)) {
    throw new AppError('Email and password are required', 400);
  }
  const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    throw new AppError('Invalid email or password', 401);
  }
  res.status(200).json({ success: true, token: generateToken(user), user: userResponse(user) });
});

// GET /api/auth/profile (protected)
exports.getProfile = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, user: userResponse(req.user) });
});
