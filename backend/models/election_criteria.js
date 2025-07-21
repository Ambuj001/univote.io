const mongoose = require('mongoose');

const electionCriteriaSchema = new mongoose.Schema({
  election_id: {
    type: String,
    required: true,
    unique: true
  },
  criteria: {
    type: Map,  // allows dynamic key-value pairs
    of: mongoose.Schema.Types.Mixed,  // supports string, number, object, etc.
    default: {}
  },
   topic: {  
    type: String,
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Election Criteria', electionCriteriaSchema);
