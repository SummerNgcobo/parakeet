const Event = require('../services/database/postgres/models/event');
const EventAttendance = require('../services/database/postgres/models/eventAttendance');
const User = require('../services/database/postgres/models/user');
const { Op } = require('sequelize');

const eventController = {
  async getAllEvents(req, res) {
    try {
      const events = await Event.findAll({
        include: [{
          model: EventAttendance,
          as: 'attendances',
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'email']
          }]
        }],
        order: [['date', 'ASC'], ['time', 'ASC']],
      });

      res.json(events);
    } catch (error) {
      console.error('Error in getAllEvents:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async createEvent(req, res) {
    try {
      const { title, date, time, location, type } = req.body;

      const event = await Event.create({
        title,
        date,
        time,
        location,
        type,
      });

      res.status(201).json(event);
    } catch (error) {
      console.error('Error in createEvent:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async updateAttendance(req, res) {
    try {
      const { eventId } = req.params;
      const { email, attending } = req.body;

      if (!email) return res.status(400).json({ error: 'Email is required' });

      const user = await User.findOne({ where: { email } });
      if (!user) return res.status(404).json({ error: 'User not found' });

      const event = await Event.findByPk(eventId);
      if (!event) return res.status(404).json({ error: 'Event not found' });

      const [attendance, created] = await EventAttendance.findOrCreate({
        where: { userId: user.id, eventId },
        defaults: { attending }
      });

      if (!created) {
        await attendance.update({ attending });
      }

      res.json({ message: 'Attendance updated', attendance });
    } catch (error) {
      console.error('Error in updateAttendance:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async getUserEvents(req, res) {
    try {
      const { email } = req.params;
      const { startDate, endDate } = req.query;

      const user = await User.findOne({ where: { email } });
      if (!user) return res.status(404).json({ error: 'User not found' });

      const where = { userId: user.id };

      if (startDate && endDate) {
        where['$event.date$'] = {
          [Op.between]: [new Date(startDate), new Date(endDate)],
        };
      } else if (startDate) {
        where['$event.date$'] = { [Op.gte]: new Date(startDate) };
      } else if (endDate) {
        where['$event.date$'] = { [Op.lte]: new Date(endDate) };
      }

      const attendances = await EventAttendance.findAll({
        where,
        include: [{
          model: Event,
          as: 'event',
        }],
        order: [[{ model: Event, as: 'event' }, 'date', 'ASC']],
      });

      res.json(attendances);
    } catch (error) {
      console.error('Error in getUserEvents:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async getEventById(req, res) {
    try {
      const { id } = req.params;
      const event = await Event.findByPk(id, {
        include: [{
          model: EventAttendance,
          as: 'attendances',
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'email'],
          }],
        }],
      });

      if (!event) return res.status(404).json({ error: 'Event not found' });

      res.json(event);
    } catch (error) {
      console.error('Error in getEventById:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async updateEvent(req, res) {
    try {
      const { id } = req.params;
      const { title, date, time, location, description, type } = req.body;

      const event = await Event.findByPk(id);
      if (!event) return res.status(404).json({ error: 'Event not found' });

      await event.update({
        title,
        date,
        time,
        location,
        description,
        type,
      });

      res.json(event);
    } catch (error) {
      console.error('Error in updateEvent:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async deleteEvent(req, res) {
    try {
      const { id } = req.params;

      const event = await Event.findByPk(id);
      if (!event) return res.status(404).json({ error: 'Event not found' });

      await event.destroy();

      res.json({ message: 'Event deleted successfully' });
    } catch (error) {
      console.error('Error in deleteEvent:', error);
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = eventController;
