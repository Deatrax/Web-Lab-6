const Laundry = require('../models/laundryModel');

exports.getAllLaundry = async (req, res) => {
      try {
            const laundries = await Laundry.find().populate('items');
            res.status(200).json(laundries);
      } catch (error) {
            res.status(500).json({ message: error.message });
      }
};

exports.addLaundry = async (req, res) => {
      try {
            const { items, scheduledDate, status } = req.body;
            const newLaundry = new Laundry({
                  items,
                  scheduledDate,
                  status
            });
            await newLaundry.save();
            const populatedLaundry = await Laundry.findById(newLaundry._id).populate('items');
            res.status(201).json(populatedLaundry);
      } catch (error) {
            res.status(500).json({ message: error.message });
      }
};


exports.updateLaundry = async (req, res) => {
      try {
            const { id } = req.params;
            const updatedLaundry = await Laundry.findByIdAndUpdate(id, req.body, { new: true }).populate('items');

            if (!updatedLaundry) {
                  return res.status(404).json({ message: 'Laundry record not found' });
            }

            res.status(200).json(updatedLaundry);
      } catch (error) {
            res.status(500).json({ message: error.message });
      }
};

exports.deleteLaundry = async (req, res) => {
      try {
            const { id } = req.params;
            const deletedLaundry = await Laundry.findByIdAndDelete(id);

            if (!deletedLaundry) {
                  return res.status(404).json({ message: 'Laundry record not found' });
            }

            res.status(200).json({ message: 'Laundry record deleted successfully' });
      } catch (error) {
            res.status(500).json({ message: error.message });
      }
};
