const mongoose = require('mongoose');

const conditionalLogicSchema = new mongoose.Schema({
  dependsOnField: String,
  condition: String, // 'equals', 'not_equals', 'contains', etc.
  value: mongoose.Schema.Types.Mixed
});

const formFieldSchema = new mongoose.Schema({
  airtableFieldId: String,
  airtableFieldName: String,
  airtableFieldType: String,
  questionLabel: String,
  isRequired: {
    type: Boolean,
    default: false
  },
  order: Number,
  conditionalLogic: conditionalLogicSchema,
  options: [String] // For single/multi select fields
});

const formSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  airtableBaseId: {
    type: String,
    required: true
  },
  airtableTableId: {
    type: String,
    required: true
  },
  airtableBaseName: String,
  airtableTableName: String,
  fields: [formFieldSchema],
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

formSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Form', formSchema);
