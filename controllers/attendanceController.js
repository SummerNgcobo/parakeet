const Attendance = require('../services/database/postgres/models/attendance');
const User = require('../services/database/postgres/models/user');
const { Op } = require('sequelize');

const attendanceController = {
  async clockIn(req, res) {
    try {
      const { email, location } = req.body;

      // Find user by email strictly
      const user = await User.findOne({ where: { email } });
      if (!user) return res.status(404).json({ error: "User with this email not found." });

      const userId = user.id;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Check if user already clocked in today (without clocking out)
      const existing = await Attendance.findOne({
        where: {
          userId,
          clockIn: { [Op.gte]: today },
          clockOut: null
        }
      });

      if (existing) {
        return res.status(400).json({ error: "You have already clocked in today." });
      }

      const attendance = await Attendance.create({
        userId,
        clockIn: new Date(),
        location
      });

      res.status(201).json(attendance);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async clockOut(req, res) {
    try {
      const { email } = req.body;

      const user = await User.findOne({ where: { email } });
      if (!user) return res.status(404).json({ error: "User with this email not found." });

      const userId = user.id;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const attendance = await Attendance.findOne({
        where: {
          userId,
          clockIn: { [Op.gte]: today },
          clockOut: null
        }
      });

      if (!attendance) {
        return res.status(404).json({ error: "No active clock-in found for today." });
      }

      const now = new Date();

      await attendance.update({ clockOut: now });

      res.json(attendance);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getUserAttendance(req, res) {
    try {
      const { email } = req.params;
      const { startDate, endDate } = req.query;

      const user = await User.findOne({ where: { email } });
      if (!user) return res.status(404).json({ error: "User with this email not found." });

      const userId = user.id;

      const where = { userId };

      if (startDate && endDate) {
        where.clockIn = {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        };
      } else if (startDate) {
        where.clockIn = { [Op.gte]: new Date(startDate) };
      } else if (endDate) {
        where.clockIn = { [Op.lte]: new Date(endDate) };
      }

      const attendance = await Attendance.findAll({
        where,
        order: [['clockIn', 'DESC']]
      });

      res.json(attendance);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getAllAttendance(req, res) {
    try {
      const { startDate, endDate, userId } = req.query;

      const where = {};

      if (startDate && endDate) {
        where.clockIn = {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        };
      } else if (startDate) {
        where.clockIn = { [Op.gte]: new Date(startDate) };
      } else if (endDate) {
        where.clockIn = { [Op.lte]: new Date(endDate) };
      }

      if (userId) {
        where.userId = userId;
      }

      const attendance = await Attendance.findAll({
        where,
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }],
        order: [['clockIn', 'DESC']]
      });

      res.json(attendance);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = attendanceController;
