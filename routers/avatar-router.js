// routes/avatarRoutes.js
const express = require('express');
const multer = require('multer');
const router = express.Router();
const avatarController = require('../controllers/avatarController');

const upload = multer(); // multer memory storage

router.post('/avatars/:userId', upload.single('avatar'), avatarController.uploadAvatar);
router.get('/avatars/:userId', avatarController.getAvatar);

module.exports = router;
