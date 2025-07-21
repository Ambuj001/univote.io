const express = require('express');
const egcSaver = express.Router();

const { saveEgc, getElectionTopicById, getCriteriaByElectionId } = require('../controllers/egcSaver');

egcSaver.post('/api/Save-Election-Criteria', saveEgc);
egcSaver.get('/api/election-criteria/:electionId', getElectionTopicById);
egcSaver.get('/api/election-criteria/:electionId/criteria', getCriteriaByElectionId);

module.exports = egcSaver;
