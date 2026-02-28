const Clothes = require('../models/clothesModel');
const cloudinary = require('../config/cloudinary');

exports.getAllClothes = async (req, res) => {
    try {
        const clothes = await Clothes.find();
        res.status(200).json(clothes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.addClothes = async (req, res) => {
    try {
        const { name, category, color, season, occasion } = req.body;
        let images = [];

        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const result = await cloudinary.uploader.upload(file.path);
                images.push({
                    url: result.secure_url,
                    public_id: result.public_id,
                });
            }
        }

        const newClothes = new Clothes({
            name,
            category,
            color,
            season,
            occasion,
            images,
        });

        await newClothes.save();

        res.status(201).json(newClothes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getClothes = async (req, res) => {
    try {
        const clothes = await Clothes.find().sort({ createdAt: -1 });
        res.status(200).json(clothes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteClothes = async (req, res) => {
    try {
        const { id } = req.params;
        const clothesItem = await Clothes.findById(id);

        if (!clothesItem) {
            return res.status(404).json({ message: 'Clothing item not found' });
        }

        // Delete images from Cloudinary
        if (clothesItem.images && clothesItem.images.length > 0) {
            for (const image of clothesItem.images) {
                if (image.public_id) {
                    await cloudinary.uploader.destroy(image.public_id);
                }
            }
        }

        await Clothes.findByIdAndDelete(id);
        res.status(200).json({ message: 'Clothing item deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
