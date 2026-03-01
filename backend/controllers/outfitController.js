const Outfit = require('../models/outfitModel');
const Clothes = require('../models/clothesModel');
const Accessories = require('../models/accessoriesModel');
const Laundry = require('../models/laundryModel');
const cloudinary = require('../config/cloudinary');
const mongoose = require('mongoose');

exports.addOutfit = async (req, res) => {
    try {
        const { name, clothingItems, accessories, weatherCondition } = req.body;

        // Upload images to Cloudinary if files are provided
        let outfitImages = {};
        if (req.files && req.files.length > 0) {
            // Match schema: outfitImages is a single object, but we take the first file if multiple are uploaded
            const uploadedImage = await cloudinary.uploader.upload(req.files[0].path);
            outfitImages = {
                url: uploadedImage.secure_url,
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
        const { userId, occasion } = req.body;

        const User = require('../models/userModel');
        const Weather = require('../models/weatherModel');
        
        let targetLocation = null;
        if (userId) {
            const user = await User.findById(userId);
            if (user) targetLocation = user.location;
        }

        // 2. Get current weather (Try location -> Try latest -> Default to sunny)
        let latestWeather;
        if (targetLocation) {
            latestWeather = await Weather.findOne({ location: targetLocation }).sort({ date: -1 });
        }
        
        if (!latestWeather) {
            latestWeather = await Weather.findOne().sort({ date: -1 });
        }
        
        // Final fallback for demo purposes
        if (!latestWeather) {
            latestWeather = { conditions: 'sunny', location: 'System Default' };
        }

        // Determine season based on weather
        let currentSeason = 'all';
        const cond = latestWeather.conditions.toLowerCase();
        if (cond === 'hot' || cond === 'sunny') currentSeason = 'Summer';
        else if (cond === 'cold') currentSeason = 'Winter';
        else if (cond === 'rainy') currentSeason = 'Rainy';

        // 3. Find items in laundry to exclude
        const activeLaundry = await Laundry.find({ status: { $ne: 'done' } });
        const laundryItemIds = activeLaundry.reduce((acc, l) => acc.concat(l.items), []);

        // 4. Find available clothes
        const clothesQuery = {
            status: 'active',
            _id: { $nin: laundryItemIds }
        };

        if (currentSeason !== 'all') {
            clothesQuery.season = currentSeason;
        }
        
        if (occasion) {
            clothesQuery.occasion = occasion;
        }

        const availableClothes = await Clothes.find(clothesQuery);

        // Selection: 1 top, 1 bottom
        const tops = availableClothes.filter(c => c.category && c.category.toLowerCase().includes('top'));
        const bottoms = availableClothes.filter(c => c.category && c.category.toLowerCase().includes('bottom'));

        if (tops.length === 0 || bottoms.length === 0) {
            // Fallback: search without season if no items found
            const fallbackClothes = await Clothes.find({ status: 'active', _id: { $nin: laundryItemIds } });
            const fTops = fallbackClothes.filter(c => c.category && c.category.toLowerCase().includes('top'));
            const fBottoms = fallbackClothes.filter(c => c.category && c.category.toLowerCase().includes('bottom'));
            
            if (fTops.length === 0 || fBottoms.length === 0) {
                return res.status(400).json({ message: 'Your wardrobe is too empty! Add some tops and bottoms first.' });
            }
            
            // If we reached here, use the fallback items
            var selectedTop = fTops[Math.floor(Math.random() * fTops.length)];
            var selectedBottom = fBottoms[Math.floor(Math.random() * fBottoms.length)];
        } else {
            var selectedTop = tops[Math.floor(Math.random() * tops.length)];
            var selectedBottom = bottoms[Math.floor(Math.random() * bottoms.length)];
        }

        const selectedClothes = [selectedTop._id, selectedBottom._id];

        // 5. Select accessories
        const availableAccessories = await Accessories.find({ status: 'active' });
        let selectedAccessories = [];

        const compatibleAccs = availableAccessories.filter(a =>
            a.compatibleWith.includes('top') || a.compatibleWith.includes('bottom')
        );

        if (compatibleAccs.length > 0) {
            selectedAccessories.push(compatibleAccs[Math.floor(Math.random() * compatibleAccs.length)]._id);
        }

        // 6. Save outfit
        const outfitName = `${occasion || 'Daily'} Look - ${new Date().toLocaleDateString()}`;

        const outfit = new Outfit({
            name: outfitName,
            clothingItems: selectedClothes,
            accessories: selectedAccessories,
            weatherCondition: latestWeather.conditions,
            wearCount: 1
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

exports.deleteOutfitById = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid Outfit ID format' });
        }

        const outfit = await Outfit.findById(id);

        if (!outfit) {
            return res.status(404).json({ message: 'Outfit not found' });
        }

        // Safely delete images from Cloudinary
        const imagesToDelete = Array.isArray(outfit.outfitImages) 
            ? outfit.outfitImages 
            : (outfit.outfitImages ? [outfit.outfitImages] : []);

        for (const img of imagesToDelete) {
            if (img && img.public_id) {
                try {
                    await cloudinary.uploader.destroy(img.public_id);
                } catch (cloudErr) {
                    console.error("Cloudinary delete error (non-fatal):", cloudErr);
                }
            }
        }

        await Outfit.findByIdAndDelete(id);
        res.status(200).json({ message: 'Outfit deleted successfully' });
    } catch (err) {
        console.error("Error in deleteOutfitById:", err);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};
