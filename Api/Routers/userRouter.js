const express = require('express');
const authController = require('../API/controllers/authController');

const router = express.Router();

// --- PUBLIC ROUTES ---
// Endpoints that anyone can hit to register an account or exchange credentials for a token
router.post('/signup', authController.signup);
router.post('/login', authController.login);

// --- PROTECTED ROUTES ---
// An example route showing how to guard bot administrative settings or configuration dashboards
// The protect middleware intercepts the request and handles credential checks before running the endpoint action
router.get('/me', authController.protect, (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      user: req.user
    }
  });
});

module.exports = router;