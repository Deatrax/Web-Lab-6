const express = require('express');
const router = express.Router();
const {
    addWeather, getLatestWeather, getAllWeather
} = require('../controllers/weatherController');

router.post('/', addWeather);
router.get('/', getAllWeather);
router.get('/latest', getLatestWeather);

module.exports = router;
