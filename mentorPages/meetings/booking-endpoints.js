// Express.js example routes
const express = require('express');
const router = express.Router();
const { google } = require('googleapis');
const calendar = google.calendar('v3');

// Middleware to authenticate and set up Google Calendar client
router.use(async (req, res, next) => {
    const auth = new google.auth.GoogleAuth({
        credentials: JSON.parse(process.env.GOOGLE_CALENDAR_CREDENTIALS),
        scopes: ['https://www.googleapis.com/auth/calendar']
    });
    req.calendar = calendar;
    req.calendarAuth = await auth.getClient();
    next();
});

// Get all meetings (admin sees all, regular users see only their meetings)
router.get('/meetings', async (req, res) => {
    try {
        const timeMin = new Date().toISOString();
        const calendarId = process.env.TMA_CALENDAR_ID;
        
        const result = await req.calendar.events.list({
            auth: req.calendarAuth,
            calendarId,
            timeMin,
            singleEvents: true,
            orderBy: 'startTime',
        });
        
        const meetings = result.data.items.map(event => ({
            id: event.id,
            title: event.summary,
            description: event.description,
            start: event.start.dateTime,
            end: event.end.dateTime,
            meetingLink: event.hangoutLink,
            attendees: event.attendees || [],
            organizer: event.organizer,
            meetingType: event.extendedProperties?.shared?.meetingType || 'general'
        }));
        
        res.json(meetings);
    } catch (error) {
        console.error('Error fetching meetings:', error);
        res.status(500).json({ error: 'Failed to fetch meetings' });
    }
});

// Check availability
router.post('/availability', async (req, res) => {
    try {
        const { date, startTime, endTime, attendees } = req.body;
        
        const timeMin = new Date(`${date}T${startTime}`).toISOString();
        const timeMax = new Date(`${date}T${endTime}`).toISOString();
        
        const availability = await req.calendar.freebusy.query({
            auth: req.calendarAuth,
            requestBody: {
                timeMin,
                timeMax,
                items: attendees.map(email => ({ id: email }))
            }
        });
        
        const busySlots = [];
        Object.entries(availability.data.calendars).forEach(([email, data]) => {
            if (data.busy && data.busy.length > 0) {
                data.busy.forEach(slot => {
                    busySlots.push({
                        attendeeEmail: email,
                        start: slot.start,
                        end: slot.end
                    });
                });
            }
        });
        
        res.json({ busySlots });
    } catch (error) {
        console.error('Error checking availability:', error);
        res.status(500).json({ error: 'Failed to check availability' });
    }
});

// Create a new meeting
router.post('/meetings', async (req, res) => {
    try {
        const { 
            title, 
            description, 
            start, 
            end, 
            attendees, 
            meetingType,
            room,
            sendInvites
        } = req.body;
        
        const event = {
            summary: title,
            description,
            start: { dateTime: start, timeZone: 'Africa/Johannesburg' },
            end: { dateTime: end, timeZone: 'Africa/Johannesburg' },
            attendees: attendees.map(email => ({ email })),
            conferenceData: {
                createRequest: { requestId: Math.random().toString(36).substring(7) }
            },
            extendedProperties: {
                shared: {
                    meetingType,
                    room,
                    organizer: req.user.id
                }
            }
        };
        
        const createdEvent = await req.calendar.events.insert({
            auth: req.calendarAuth,
            calendarId: process.env.TMA_CALENDAR_ID,
            requestBody: event,
            sendUpdates: sendInvites ? 'all' : 'none'
        });
        
        res.status(201).json(createdEvent.data);
    } catch (error) {
        console.error('Error creating meeting:', error);
        res.status(500).json({ error: 'Failed to create meeting' });
    }
});

module.exports = router;