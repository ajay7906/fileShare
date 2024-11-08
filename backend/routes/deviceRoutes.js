const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/deviceControllers');
const auth = require('../middleware/auth');

// router.get('/', auth, deviceController.getAllDevices);
// router.get('/online', auth, deviceController.getOnlineDevices);
// router.post('/status', auth, deviceController.updateDeviceStatus);


router.get('/', deviceController.getOnlineDevices);
router.post('/requests', auth, deviceController.sendRequest);
router.post('/accep', auth, deviceController.acceptRequest);
// router.post('/requests/accept', deviceController.acceptRequest);
// router.post('/requests/reject', deviceController.rejectRequest);






module.exports = router;