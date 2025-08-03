const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
require('dotenv').config();



// Date formatting utility
const formatDate = iso => {
  const date = new Date(iso);
  return date.toISOString().split('T')[0]; 
};

// Get cohorts from contacts
router.get('/', async (req, res) => {
  try {
    const properties = [
      'firstname', 'lastname', 'email', 'cohort', 'specialisation'
    ];
   
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${HUBSPOT_TOKEN}` }
    });
    const data = await response.json();
    
    // Group contacts by cohort
    const cohortMap = {};
    data.results.forEach(contact => {
      const cohortValue = contact.properties.cohort;
      if (cohortValue) { 
        if (!cohortMap[cohortValue]) cohortMap[cohortValue] = [];
        cohortMap[cohortValue].push({
          id: contact.id,
          name: [contact.properties.firstname, contact.properties.lastname].join(' '),
          email: contact.properties.email,
          joined: formatDate(contact.properties.createdate),
          specialisation: contact.properties.specialisation,
          // Any other fields i want
        });
      }
    });

    // Transform into array for React's expected format
    const cohorts = Object.entries(cohortMap).map(([cohortName, students]) => ({
      id: cohortName, 
      name: cohortName,
      students,
      // any other fields I want
    }));

    res.json({ cohorts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
});

module.exports = router;