// In your backend service (Node.js example)
const { google } = require('googleapis');

async function createSharedCalendar() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'credentials.json',
    scopes: ['https://www.googleapis.com/auth/calendar']
  });

  const calendar = google.calendar({ version: 'v3', auth });
  
  const calendarResource = {
    summary: 'TMA Trainee Management',
    description: 'Shared calendar for all trainee activities and meetings',
    timeZone: 'Africa/Johannesburg' // Adjust to your timezone
  };

  try {
    const createdCalendar = await calendar.calendars.insert({
      requestBody: calendarResource
    });
    
    console.log('Shared calendar created:', createdCalendar.data.id);
    return createdCalendar.data.id;
  } catch (error) {
    console.error('Error creating calendar:', error);
    throw error;
  }
}