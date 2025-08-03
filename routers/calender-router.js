const express = require('express');
const router = express.Router();
const { google } = require('googleapis');
const fs = require('fs-extra');
const path = require('path');

// Constants
const calendarId = process.env.TMA_CALENDAR_ID;
// Load OAuth2 client with tokens
const getCalendarClient = async () => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI
  );

  if (!fs.existsSync(TOKEN_PATH)) {
    throw new Error(`OAuth token file not found at ${TOKEN_PATH}`);
  }

  const tokens = await fs.readJson(TOKEN_PATH);
  oauth2Client.setCredentials(tokens);

  return google.calendar({ version: 'v3', auth: oauth2Client });
};


// Middleware
router.use((req, res, next) => {
  next();
});

// GET /meetings — Fetch upcoming meetings
router.get('/meetings', async (req, res) => {
  try {
    const calendar = await getCalendarClient();
    const timeMin = new Date().toISOString();

    const result = await calendar.events.list({
      calendarId,
      timeMin,
      singleEvents: true,
      orderBy: 'startTime',
      maxResults: 250,
    });

    const meetings = result.data.items.map(event => ({
      id: event.id,
      title: event.summary,
      description: event.description,
      start: event.start?.dateTime || event.start?.date,
      end: event.end?.dateTime || event.end?.date,
      meetingLink: event.hangoutLink || event.conferenceData?.entryPoints?.[0]?.uri || null,
      attendees: event.attendees ? event.attendees.map(a => a.email) : [],
      organizer: event.organizer?.email || '',
      meetingType: event.extendedProperties?.shared?.meetingType || 'general',
      room: event.extendedProperties?.shared?.room || '',
    }));

    res.json(meetings);
  } catch (error) {
    console.error('Error fetching meetings:', error);
    res.status(500).json({ error: 'Failed to fetch meetings' });
  }
});

router.post('/meetings', async (req, res) => {
  

  try {
    const calendar = await getCalendarClient();
    const {
      title,
      description,
      start,
      end,
      attendees = [],
      meetingType = 'general',
      room,
      sendInvites = true,
    } = req.body;

    if (!title || !start || !end) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (isNaN(Date.parse(start)) || isNaN(Date.parse(end))) {
      return res.status(400).json({ error: 'Invalid date format' });
    }

    if (new Date(end) <= new Date(start)) {
      return res.status(400).json({ error: 'End time must be after start time' });
    }

    const validAttendees = Array.isArray(attendees)
  ? attendees
      .map(attendee => {
        // Handle both string and object formats
        const email = typeof attendee === 'string' ? attendee : attendee.email;
        return typeof email === 'string' && email.includes('@') ? { email } : null;
      })
      .filter(Boolean) 
  : [];
     
    const event = {
      summary: title,
      description,
      start: {
        dateTime: new Date(start).toISOString(),
        timeZone: 'Africa/Johannesburg',
      },
      end: {
        dateTime: new Date(end).toISOString(),
        timeZone: 'Africa/Johannesburg',
      },
      attendees: validAttendees,
      extendedProperties: {
        shared: {
          meetingType,
          room,
          createdBy: req.user?.email || 'Anonymous', 
        },
      },
      conferenceData: {
        createRequest: {
          requestId: `${Date.now()}`,
        },
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 1440 },
          { method: 'popup', minutes: 30 },
        ],
      },
    };

    const createdEvent = await calendar.events.insert({
      calendarId,
      requestBody: event,
      conferenceDataVersion: 1,
      sendUpdates: sendInvites ? 'all' : 'none',
    });
   
    const responseData = {
      id: createdEvent.data.id,
      title: createdEvent.data.summary,
      start: createdEvent.data.start.dateTime,
      end: createdEvent.data.end.dateTime,
      meetingLink: createdEvent.data.hangoutLink,
      attendees: createdEvent.data.attendees?.map(a => a.email) || [],
    };
   
    res.status(201).json(responseData);
  } catch (error) {
    console.error('Error creating meeting:', error);
    res.status(500).json({
      error: 'Failed to create meeting',
      details: error.response?.data?.error || error.message,
    });
  }
});


// POST /availability — Check attendee availability
router.post('/availability', async (req, res) => {
  try {
    const calendar = await getCalendarClient();
    const { date, startTime, endTime } = req.body;

    if (!date || !startTime || !endTime) {
      return res.status(400).json({ error: 'Missing required time fields' });
    }

    const attendeesEmails = req.body.attendees || [];
    const timeMin = new Date(`${date}T${startTime}`).toISOString();
    const timeMax = new Date(`${date}T${endTime}`).toISOString();

    const availabilityResults = await Promise.all(
      attendeesEmails.map(async (attendeeEmail) => {
        try {
          const result = await calendar.freebusy.query({
            requestBody: {
              timeMin,
              timeMax,
              items: [{ id: attendeeEmail }],
            },
          });

          const busySlots = result.data.calendars?.[attendeeEmail]?.busy || [];
          return { attendeeEmail, busySlots };
        } catch (err) {
          console.error(`Error checking availability for ${attendeeEmail}:`, err);
          return { attendeeEmail, busySlots: [] };
        }
      })
    );

    const busySlots = availabilityResults
      .filter(({ busySlots }) => busySlots.length > 0)
      .flatMap(({ busySlots, attendeeEmail }) =>
        busySlots.map(slot => ({ ...slot, attendeeEmail }))
      )
      .filter(slot => {
        const slotStart = new Date(slot.start);
        const slotEnd = new Date(slot.end);
        const requestedStart = new Date(timeMin);
        const requestedEnd = new Date(timeMax);
        return slotStart < requestedEnd && slotEnd > requestedStart;
      });

    res.json({ busySlots });
  } catch (error) {
    console.error('Error checking availability:', error);
    res.status(500).json({
      error: 'Failed to check availability',
      details: error.response?.data?.error || error.message,
    });
  }
});

module.exports = router;
