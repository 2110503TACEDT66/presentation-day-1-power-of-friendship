const express = require('express');
const {register, login, getMe, logout, portfolio} = require('../controllers/auth');
const router = express.Router();
const {protect} = require('../middleware/auth');
const {upload} = require('../middleware/upload');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe)
router.get('/logout', logout);
router.put('/portfolio', protect, upload, portfolio);

module.exports = router;