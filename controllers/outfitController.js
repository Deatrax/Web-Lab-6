const Outfit = require('../models/outfitModel');
const Clothes = require('../models/clothesModel');
const Accessories = require('../models/accessoriesModel');
const Laundry = require('../models/laundryModel');
const cloudinary = require('../config/cloudinary');

exports.addOutfit = async (req, res) => {
    try {
        const { name, clothingItems, accessories, weatherCondition } = req.body;

        let outfitImages = {};

        // Upload images to Cloudinary if files are provided
        if (req.files && req.files.length > 0) {
            const uploadedImage = await cloudinary.uploader.upload(req.files[0].path);
            outfitImages = {
                url: uploadedImage.url,
                public_id: uploadedImage.public_id
            };
        }

        const outfit = new Outfit({
            name,
            clothingItems,
            accessories,
            weatherCondition,
            outfitImages
        });

        await outfit.save();
        res.status(201).json(outfit);
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

exports.generateOutfit = async (req, res) => {
    try {
        const { userId } = req.body;

        // 1. Get user and their location
        const User = require('../models/userModel');
        const Weather = require('../models/weatherModel');
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // 2. Get current weather for user location
        const latestWeather = await Weather.findOne({ location: user.location }).sort({ date: -1 });
        if (!latestWeather) return res.status(404).json({ message: 'Weather data not found for user location' });

        // Determine season based on weather (simplified logic for the sake of the lab)
        let currentSeason = 'all';
        if (latestWeather.conditions === 'hot' || latestWeather.conditions === 'sunny') currentSeason = 'summer';
        else if (latestWeather.conditions === 'cold') currentSeason = 'winter';
        else if (latestWeather.conditions === 'rainy') currentSeason = 'rainy';

        // 3. Find items in laundry to exclude
        const activeLaundry = await Laundry.find({ status: { $ne: 'done' } });
        const laundryItemIds = activeLaundry.reduce((acc, l) => acc.concat(l.items), []);

        // 4. Find available clothes
        const clothesQuery = {
            status: { $ne: 'donated' },
            _id: { $nin: laundryItemIds }
        };

        // Filter by season if we mapped one
        if (currentSeason !== 'all') {
            clothesQuery.season = currentSeason;
        }

        const availableClothes = await Clothes.find(clothesQuery);

        // Basic outfit selection: 1 top, 1 bottom
        const tops = availableClothes.filter(c => c.category === 'top');
        const bottoms = availableClothes.filter(c => c.category === 'bottom');

        if (tops.length === 0 || bottoms.length === 0) {
            return res.status(400).json({ message: 'Not enough clothes to generate an outfit' });
        }

        const selectedTop = tops[Math.floor(Math.random() * tops.length)];
        const selectedBottom = bottoms[Math.floor(Math.random() * bottoms.length)];
        const selectedClothes = [selectedTop._id, selectedBottom._id];

        // 5. Select compatible accessories
        const availableAccessories = await Accessories.find({ status: { $ne: 'donated' } });
        let selectedAccessories = [];

        // Find accessory compatible with "top" or "bottom"
        const compatibleAccs = availableAccessories.filter(a =>
            a.compatibleWith.includes('top') || a.compatibleWith.includes('bottom')
        );

        if (compatibleAccs.length > 0) {
            selectedAccessories.push(compatibleAccs[Math.floor(Math.random() * compatibleAccs.length)]._id);
        }

        // 6. Generate and save outfit
        const outfitName = `Generated Outfit - ${new Date().toLocaleDateString()}`;

        const outfit = new Outfit({
            name: outfitName,
            clothingItems: selectedClothes,
            accessories: selectedAccessories,
            weatherCondition: latestWeather.conditions,
            wearCount: 1 // Initially worn once upon generation
        });

        await outfit.save();

        // 7. Update wear counts
        await Clothes.updateMany(
            { _id: { $in: selectedClothes } },
            { $inc: { wearCount: 1 }, $set: { lastWorn: new Date() } }
        );

        if (selectedAccessories.length > 0) {
            await Accessories.updateMany(
                { _id: { $in: selectedAccessories } },
                { $inc: { wearCount: 1 }, $set: { lastWorn: new Date() } }
            );
        }

        res.status(201).json(outfit);
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

exports.getAllOutfits = async (req, res) => {
    try {
        const outfits = await Outfit.find()
            .populate('clothingItems')
            .populate('accessories');

        res.status(200).json(outfits);
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

exports.getOutfitById = async (req, res) => {
    try {
        const { id } = req.params;

        const outfit = await Outfit.findById(id)
            .populate('clothingItems')
            .populate('accessories');

        if (!outfit) {
            return res.status(404).json({ message: 'Outfit not found' });
        }

        res.status(200).json(outfit);
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

exports.modifyOutfitById = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, clothingItems, accessories, weatherCondition } = req.body;

        const outfit = await Outfit.findById(id);

        if (!outfit) {
            return res.status(404).json({ message: 'Outfit not found' });
        }

        // Update fields if provided
        if (name) outfit.name = name;
        if (clothingItems) outfit.clothingItems = clothingItems;
        if (accessories) outfit.accessories = accessories;
        if (weatherCondition) outfit.weatherCondition = weatherCondition;

        await outfit.save();
        res.status(200).json(outfit);
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};