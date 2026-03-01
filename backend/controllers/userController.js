const User = require('../models/userModel');
const cloudinary = require('../config/cloudinary')

exports.createUser = async (req, res) => {
    try {
        const { name, location, stylePreferences } = req.body;
        
        let profilePicture = {};
        
        // Upload profile picture to Cloudinary if file is provided
        if (req.file) {
            const uploadedImage = await cloudinary.uploader.upload(req.file.path);
            profilePicture = {
                url: uploadedImage.url,
                public_id: uploadedImage.public_id
            };
        }
        
        const user = new User({
            name,
            location,
            stylePreferences,
            profilePicture
        });
        
        await user.save();
        res.status(201).json(user);
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

exports.getUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

