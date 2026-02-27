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

