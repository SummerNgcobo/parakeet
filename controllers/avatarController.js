// controllers/avatarController.js
const Avatar = require('../services/database/postgres/models/avatars');

exports.uploadAvatar = async (req, res) => {
  try {
    const { userId } = req.params;
    const buffer = req.file.buffer;

    const [avatar, created] = await Avatar.upsert({
      userId: parseInt(userId),
      image: buffer
    }, {
      returning: true
    });

    res.status(200).json({ message: created ? 'Avatar created' : 'Avatar updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload avatar', details: error.message });
  }
};

exports.getAvatar = async (req, res) => {
  try {
    const { userId } = req.params;
    const avatar = await Avatar.findOne({ where: { userId } });

    if (!avatar) return res.status(404).json({ error: 'Avatar not found' });

    res.set('Content-Type', 'image/jpeg');
    res.send(avatar.image);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get avatar', details: error.message });
  }
};
