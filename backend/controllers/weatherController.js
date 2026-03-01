const Weather = require('../models/weatherModel');

exports.addWeather = async (req, res) => {
    try {
        const {location, conditions, date} = req.body
        const weather = new Weather({
            location, conditions, date
        });

        await weather.save();
        res.status(201).json(weather);
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getLatestWeather = async (req, res) => {
    try {
        const { location } = req.query;
        const query = location ? { location } : {};
        const latestWeather = await Weather.findOne(query).sort({ date: -1 });
        
        if (!latestWeather) {
            return res.status(404).json({ message: 'No weather data found' });
        }
        
        res.status(200).json(latestWeather);
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

exports.getAllWeather = async (req, res) => {
    try {
        const allWeather = await Weather.find().sort({ date: -1 });
        res.status(200).json(allWeather);
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};
