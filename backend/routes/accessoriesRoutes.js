const express = require('express');
const router = express.Router();
const upload = require('../middleware/multer');
const {
    getAllAccessories,
    getAccessory,
    addAccessory,
    updateAccessory,
    deleteAccessory,
    suggestDonatingAccessory
} = require('../controllers/accessoriesController');

router.get('/', getAllAccessories);
router.get('/:id', getAccessory);
router.post('/', upload.single('image'), addAccessory);
router.put('/:id', upload.single('image'), updateAccessory);
router.delete('/:id', deleteAccessory);
router.get('/:id/suggest-donation', suggestDonatingAccessory);

module.exports = router;
