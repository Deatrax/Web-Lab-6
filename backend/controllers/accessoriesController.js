const Accessories = require("../models/accessoriesModel");
const User = require("../models/userModel");
const cloudinary = require("../config/cloudinary");

// Get all accessories
exports.getAllAccessories = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const accessories = await Accessories.find({ user: user.id });
    res.status(200).json(accessories);
  } catch (error) {
    res.status(500).json({ message: "Error getting accessories: " + error.message });
  }
};

// Get a single accessory by its ID
exports.getAccessory = async (req, res) => {
  try {
    const accessory = await Accessories.findById(req.params.id);
    if (!accessory) {
      return res.status(404).json({ message: "Accessory not found" });
    }
    // Ensure the accessory belongs to the user
    if (accessory.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "User not authorized" });
    }
    res.status(200).json(accessory);
  } catch (error) {
    res.status(500).json({ message: "Error getting accessory: " + error.message });
  }
};

// Add a new accessory
exports.addAccessory = async (req, res) => {
  try {
    const { name, color, type, compatibleWith } = req.body;

    if (!name || !color) {
      return res.status(400).json({ message: "Please provide all required fields (name, color)." });
    }

    let imageUrl = '';
    let cloudinary_id = '';

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "accessories",
      });
      imageUrl = result.secure_url;
      cloudinary_id = result.public_id;
    }

    const newAccessory = new Accessories({
      // user: req.user.id, // Removed for testing without auth
      name,
      color,
      type,
      // season, // Removed as not in model
      // occasion, // Removed as not in model
      // category, // Removed as not in model
      image: {
        url: imageUrl,
        public_id: cloudinary_id
      },
      compatibleWith: compatibleWith || [],
      wearCount: 0,
      lastWorn: null,
    });

    const savedAccessory = await newAccessory.save();
    res.status(201).json(savedAccessory);
  } catch (error) {
    res.status(400).json({ message: "Error creating accessory: " + error.message });
  }
};

// Update an existing accessory
exports.updateAccessory = async (req, res) => {
  try {
    let accessory = await Accessories.findById(req.params.id);
    if (!accessory) {
      return res.status(404).json({ message: "Accessory not found" });
    }

    if (accessory.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "User not authorized" });
    }

    let imageUrl = accessory.imageUrl;
    let cloudinary_id = accessory.cloudinary_id;

    // If a new file is uploaded, delete old upload new
    if (req.file) {
      await cloudinary.uploader.destroy(accessory.cloudinary_id);
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "accessories",
      });
      imageUrl = result.secure_url;
      cloudinary_id = result.public_id;
    }

    const updateData = {
      ...req.body,
      imageUrl,
      cloudinary_id
    };

    const updatedAccessory = await Accessories.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    res.status(200).json(updatedAccessory);
  } catch (error) {
    res.status(400).json({ message: "Error updating accessory: " + error.message });
  }
};

// Delete an accessory
exports.deleteAccessory = async (req, res) => {
  try {
    const accessory = await Accessories.findById(req.params.id);
    if (!accessory) {
      return res.status(404).json({ message: "Accessory not found" });
    }

    if (accessory.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "User not authorized" });
    }

    await cloudinary.uploader.destroy(accessory.cloudinary_id);

    await Accessories.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Accessory deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting accessory: " + error.message });
  }
};

exports.suggestDonatingAccessory = async (req, res) => {
  try {
    const accessory = await Accessories.findById(req.params.id);
    if (!accessory) {
      return res.status(404).json({ message: "Accessory not found" });
    }

    if (accessory.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "User not authorized" });
    }

    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const lastWornDate = accessory.lastWorn ? new Date(accessory.lastWorn) : null;

    if (accessory.wearCount <= 2 || (lastWornDate && lastWornDate <= oneYearAgo)) {
      res.status(200).json({
        message: "This item is suggested for donation due to low usage.",
        donated: false,
        suggestion: true
      });
    } else {
      res.status(200).json({
        message: "Accessory does not meet donation criteria.",
        suggestion: false
      });
    }
  } catch (error) {
    res.status(500).json({ message: "Error analyzing accessory: " + error.message });
  }
};