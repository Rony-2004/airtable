const express = require('express');
const Form = require('../models/Form');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Create a new form
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      title,
      description,
      airtableBaseId,
      airtableTableId,
      airtableBaseName,
      airtableTableName,
      fields
    } = req.body;

    const form = new Form({
      title,
      description,
      userId: req.user._id,
      airtableBaseId,
      airtableTableId,
      airtableBaseName,
      airtableTableName,
      fields
    });

    await form.save();
    res.status(201).json(form);
  } catch (error) {
    console.error('Error creating form:', error);
    res.status(500).json({ message: 'Failed to create form' });
  }
});

// Get all forms for authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const forms = await Form.find({ userId: req.user._id })
      .sort({ createdAt: -1 });
    res.json(forms);
  } catch (error) {
    console.error('Error fetching forms:', error);
    res.status(500).json({ message: 'Failed to fetch forms' });
  }
});

// Get a specific form by ID
router.get('/:id', async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }
    res.json(form);
  } catch (error) {
    console.error('Error fetching form:', error);
    res.status(500).json({ message: 'Failed to fetch form' });
  }
});

// Update a form
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const form = await Form.findOne({ 
      _id: req.params.id, 
      userId: req.user._id 
    });
    
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    Object.assign(form, req.body);
    await form.save();
    
    res.json(form);
  } catch (error) {
    console.error('Error updating form:', error);
    res.status(500).json({ message: 'Failed to update form' });
  }
});

// Delete a form
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const form = await Form.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user._id 
    });
    
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    res.json({ message: 'Form deleted successfully' });
  } catch (error) {
    console.error('Error deleting form:', error);
    res.status(500).json({ message: 'Failed to delete form' });
  }
});

module.exports = router;
