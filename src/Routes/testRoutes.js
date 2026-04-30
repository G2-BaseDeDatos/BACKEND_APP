const express = require('express');
const router = express.Router();
const testController = require('../Controllers/testController');

router.get('/', testController.getWelcome);
router.get('/health', testController.getHealth);

module.exports = router;
