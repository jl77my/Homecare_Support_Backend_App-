const express = require('express');
const router = express.Router();
const recordController = require('../controllers/recordController');

// POST /api/records
router.post('/create_record', recordController.createRecord);

module.exports = router;