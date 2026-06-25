const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Simulated User database (Replace with your database model, e.g., Mongoose/Prisma)
const users = []; 

// Helper function to generate JWT Token
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback-secret-key', {
    expiresIn: process.env.JWT_EXPIRES_IN || '90d',
  });
};

// 1. REGISTER NEW USER
exports.signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ status: 'fail', message: 'Email already registered' });
    }

    // In a production app, hash the password here using bcrypt: await bcrypt.hash(password, 12)
    const newUser = {
      id: `user_${Date.now()}`,
      name,
      email,
      password, // Note: Always hash passwords in production
    };

    users.push(newUser);

    const token = signToken(newUser.id);

    // Remove password from output screen
    newUser.password = undefined;

    res.status(201).json({
      status: 'success',
      token,
      data: { user: newUser }
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// 2. LOGIN USER
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if email and password exist in request body
    if (!email || !password) {
      return res.status(400).json({ status: 'fail', message: 'Please provide email and password' });
    }

    // Find user and check if password matches
    const user = users.find(u => u.email === email);
    if (!user || user.password !== password) { // In production, use bcrypt.compare(password, user.password)
      return res.status(401).json({ status: 'fail', message: 'Incorrect email or password' });
    }

    const token = signToken(user.id);

    res.status(200).json({
      status: 'success',
      token
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// 3. PROTECT MIDDLEWARE (Route Guarding)
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Check header for authorization token
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ status: 'fail', message: 'You are not logged in. Please log in to get access.' });
    }

    // Verify token validation
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');

    // Check if user still exists
    const currentUser = users.find(u => u.id === decoded.id);
    if (!currentUser) {
      return res.status(401).json({ status: 'fail', message: 'The user belonging to this token no longer exists.' });
    }

    // Grant access to protected route by assigning user to request object
    req.user = currentUser;
    next();
  } catch (err) {
    res.status(401).json({ status: 'fail', message: 'Invalid or expired authentication session token.' });
  }
};