const express = require('express');
const axios = require('axios');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get current user info from Airtable
router.get('/user', authenticateToken, async (req, res) => {
  try {
    console.log('Fetching Airtable user info...');
    const response = await axios.get('https://api.airtable.com/v0/meta/whoami', {
      headers: {
        'Authorization': `Bearer ${req.user.accessToken}`
      }
    });

    console.log('Airtable user info:', response.data);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching user info:', error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to fetch user info', error: error.response?.data || error.message });
  }
});

// Get user's Airtable bases
router.get('/bases', authenticateToken, async (req, res) => {
  try {
    const response = await axios.get('https://api.airtable.com/v0/meta/bases', {
      headers: {
        'Authorization': `Bearer ${req.user.accessToken}`
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching bases:', error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to fetch bases', error: error.response?.data || error.message });
  }
});

// Get tables from a specific base
router.get('/bases/:baseId/tables', authenticateToken, async (req, res) => {
  try {
    const { baseId } = req.params;
    
    const response = await axios.get(`https://api.airtable.com/v0/meta/bases/${baseId}/tables`, {
      headers: {
        'Authorization': `Bearer ${req.user.accessToken}`
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching tables:', error);
    res.status(500).json({ message: 'Failed to fetch tables' });
  }
});

// Get fields from a specific table
router.get('/bases/:baseId/tables/:tableId/fields', authenticateToken, async (req, res) => {
  try {
    const { baseId, tableId } = req.params;
    
    const response = await axios.get(`https://api.airtable.com/v0/meta/bases/${baseId}/tables`, {
      headers: {
        'Authorization': `Bearer ${req.user.accessToken}`
      }
    });

    const table = response.data.tables.find(t => t.id === tableId);
    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }

    // Filter fields to only supported types
    const supportedFieldTypes = [
      'singleLineText',
      'multilineText',
      'singleSelect',
      'multipleSelects',
      'multipleAttachments'
    ];

    const supportedFields = table.fields.filter(field => 
      supportedFieldTypes.includes(field.type)
    );

    res.json({ fields: supportedFields });
  } catch (error) {
    console.error('Error fetching fields:', error);
    res.status(500).json({ message: 'Failed to fetch fields' });
  }
});

// Create a record in Airtable
router.post('/bases/:baseId/tables/:tableId/records', authenticateToken, async (req, res) => {
  try {
    const { baseId, tableId } = req.params;
    const { fields } = req.body;

    console.log('Creating record in Airtable...');
    console.log('Base ID:', baseId);
    console.log('Table ID:', tableId);
    console.log('Fields:', fields);
    console.log('User:', req.user.email);

    const response = await axios.post(
      `https://api.airtable.com/v0/${baseId}/${tableId}`,
      {
        fields: fields
      },
      {
        headers: {
          'Authorization': `Bearer ${req.user.accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Airtable record created successfully:', response.data);
    res.json(response.data);
  } catch (error) {
    console.error('Error creating record:', error.response?.data || error);
    res.status(500).json({ 
      message: 'Failed to create record',
      error: error.response?.data || error.message
    });
  }
});

// Get records from a specific table
router.get('/bases/:baseId/tables/:tableId/records', authenticateToken, async (req, res) => {
  try {
    const { baseId, tableId } = req.params;
    
    const response = await axios.get(`https://api.airtable.com/v0/${baseId}/${tableId}`, {
      headers: {
        'Authorization': `Bearer ${req.user.accessToken}`
      },
      params: {
        maxRecords: 100 // Limit to avoid overwhelming the interface
      }
    });

    console.log('Airtable records fetched successfully');
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching records:', error.response?.data || error);
    res.status(500).json({ 
      message: 'Failed to fetch records',
      error: error.response?.data || error.message
    });
  }
});

module.exports = router;
