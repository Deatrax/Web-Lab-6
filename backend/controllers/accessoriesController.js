const Accessories = require("../models/accessoriesModel");
const cloudinary = require("../config/cloudinary");

console.log("Accessories Model loaded:", !!Accessories);

// Get all accessories
exports.getAllAccessories = async (req, res) => {
  console.log("Fetching all accessories...");
  try {
    const accessories = await Accessories.find();
    console.log("Accessories found:", accessories.length);
    res.status(200).json(accessories);
  } catch (error) {
    console.error("CRITICAL ERROR in getAllAccessories:", error);
    res.status(500).json({ message: "Error getting accessories", error: error.message });
  }
};

// Get a single accessory by its ID
exports.getAccessory = async (req, res) => {
  try {
    const accessory = await Accessories.findById(req.params.id);
    if (!accessory) {
      return res.status(404).json({ message: "Accessory not found" });
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

    // Handle compatibleWith if it's a string (from FormData)
    let compatibleWithArray = [];
    if (typeof compatibleWith === 'string') {
        compatibleWithArray = compatibleWith.split(',').map(item => item.trim()).filter(item => item !== '');
    } else if (Array.isArray(compatibleWith)) {
        compatibleWithArray = compatibleWith;
    }

    const newAccessory = new Accessories({
      name,
      color,
      type,
      image: {
        url: imageUrl,
        public_id: cloudinary_id
      },
      compatibleWith: compatibleWithArray,
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

    let imageUrl = accessory.image.url;
    let cloudinary_id = accessory.image.public_id;

    // If a new file is uploaded, delete old upload new
    if (req.file) {
      if (accessory.image.public_id) {
          await cloudinary.uploader.destroy(accessory.image.public_id);
      }
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "accessories",
      });
      imageUrl = result.secure_url;
      cloudinary_id = result.public_id;
    }

    const { compatibleWith, ...otherBody } = req.body;
    
    let compatibleWithArray = accessory.compatibleWith;
    if (compatibleWith !== undefined) {
        if (typeof compatibleWith === 'string') {
            compatibleWithArray = compatibleWith.split(',').map(item => item.trim()).filter(item => item !== '');
        } else if (Array.isArray(compatibleWith)) {
            compatibleWithArray = compatibleWith;
        }
    }

    const updateData = {
      ...otherBody,
      image: {
          url: imageUrl,
          public_id: cloudinary_id
      },
      compatibleWith: compatibleWithArray
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

    if (accessory.image.public_id) {
        await cloudinary.uploader.destroy(accessory.image.public_id);
    }

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
