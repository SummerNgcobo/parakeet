const LeaveRequest = require('../services/database/postgres/models/leaveRequest');
const User = require('../services/database/postgres/models/user');
const { sendEmail } = require('../services/mailer/emailService');

const leaveController = {
  async createLeaveRequest(req, res) {
    try {
      const { email, leaveType, startDate, endDate, reason } = req.body;

      // Validate dates
      if (new Date(startDate) > new Date(endDate)) {
        return res.status(400).json({ error: "End date must be after start date" });
      }

      // Find user by email
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(404).json({ error: "User with provided email not found" });
      }

      const leaveRequest = await LeaveRequest.create({
        userId: user.id,
        leaveType,
        startDate,
        endDate,
        reason
      });

      // Notify admins
      const admins = await User.findAll({ where: { role: 'admin' } });

      for (const admin of admins) {
        await sendEmail({
          to: admin.email,
          subject: `New Leave Request from ${user.firstName} ${user.lastName}`,
          text: `A new leave request has been submitted.\n\nType: ${leaveType}\nDates: ${startDate} to ${endDate}\nReason: ${reason}`
        });
      }

      res.status(201).json(leaveRequest);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getUserLeaveRequests(req, res) {
    try {
      const { email } = req.params;

      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(404).json({ error: "User with provided email not found" });
      }

      const requests = await LeaveRequest.findAll({
        where: { userId: user.id },
        order: [['createdAt', 'DESC']]
      });

      res.json(requests);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async updateLeaveRequest(req, res) {
    try {
      const { id } = req.params;
      const { email } = req.body;

      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(404).json({ error: "User with provided email not found" });
      }

      const [updated] = await LeaveRequest.update(req.body, {
        where: { id, userId: user.id }
      });

      if (!updated) {
        return res.status(404).json({ error: "Leave request not found or not owned by user" });
      }

      const updatedRequest = await LeaveRequest.findByPk(id);
      res.json(updatedRequest);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getAllLeaveRequests(req, res) {
    try {
      const requests = await LeaveRequest.findAll({
        include: [{ model: User, attributes: ['id', 'firstName', 'lastName', 'email'] }],
        order: [['createdAt', 'DESC']]
      });

      res.json(requests);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async processLeaveRequest(req, res) {
    try {
      const { id } = req.params;
      const { status, adminComment } = req.body;

      const [updated] = await LeaveRequest.update(
        { status, adminComment },
        { where: { id } }
      );

      if (!updated) {
        return res.status(404).json({ error: "Leave request not found" });
      }

      const updatedRequest = await LeaveRequest.findByPk(id, {
        include: [User]
      });

      // Notify user of decision
      await sendEmail({
        to: updatedRequest.user.email,
        subject: `Your Leave Request has been ${status}`,
        text: `Your leave request from ${updatedRequest.startDate} to ${updatedRequest.endDate} has been ${status}.\n\nAdmin Comment: ${adminComment || 'None'}`
      });

      res.json(updatedRequest);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = leaveController;
