const Laundry = require('../models/laundryModel');

exports.addLaundry = async (req, res) => {
      try {
            const { items, scheduledDate, status } = req.body;
            const newLaundry = new Laundry({
                  items,
                  scheduledDate,
                  status
            });
            await newLaundry.save();
            res.status(201).json(newLaundry);
      } catch (error) {
            res.status(500).json({ message: error.message });
      }
};


exports.updateLaundry = async (req, res) => {
      try {
            const { id } = req.params;
            const updatedLaundry = await Laundry.findByIdAndUpdate(id, req.body, { new: true });

            if (!updatedLaundry) {
                  return res.status(404).json({ message: 'Laundry record not found' });
            }

            res.status(200).json(updatedLaundry);
      } catch (error) {
            res.status(500).json({ message: error.message });
      }
};
