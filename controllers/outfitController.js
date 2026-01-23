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