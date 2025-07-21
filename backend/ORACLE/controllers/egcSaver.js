const ElectionCriteria = require('../../models/election_criteria');

exports.saveEgc = async (req, res) => {
  try {
    const { election_id, criteria, topic } = req.body;
    const newCriteria = new ElectionCriteria({
      election_id,
      criteria,
      topic,
    });
    await newCriteria.save();
    res.status(201).json({ status: "1", message: 'Criteria saved successfully' });
  } catch (error) {
    res.status(500).json({ status: "0", error: 'Failed to save criteria' });
  }
};

exports.getElectionTopicById = async (req, res) => {
  try {
    const { electionId } = req.params;
    // Find by election_id field, only return topic
    const doc = await ElectionCriteria.findOne(
      { election_id: electionId },
      { topic: 1, _id: 0 }
    );
    if (!doc) {
      return res.status(404).json({ error: 'Election topic not found' });
    }
    res.json({ topic: doc.topic });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};


// GET /api/election-criteria/:electionId/criteria
exports.getCriteriaByElectionId = async (req, res) => {
  try {
    const { electionId } = req.params;
    const doc = await ElectionCriteria.findOne({ election_id: electionId });
    if (!doc) {
      return res.status(404).json({ error: 'Criteria not found' });
    }

    // Convert to plain object with flattenMaps so criteria is a normal object
    const plainDoc = doc.toObject({ flattenMaps: true });
    const filteredCriteria = Object.entries(plainDoc.criteria || {})
      .filter(([_, value]) => value === true)
      .map(([key]) => key);

    res.json({ criteria: filteredCriteria });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
