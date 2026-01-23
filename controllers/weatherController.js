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
