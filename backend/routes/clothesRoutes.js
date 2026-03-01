const express = require('express');
const router = express.Router();
const upload = require('../middleware/multer');
const {
    getAllClothes,
    addClothes,
    getClothes,
    deleteClothes,
    suggestDonatingClothes
} = require('../controllers/clothesController');

router.get('/', getAllClothes);
router.post('/', upload.array('images', 5), addClothes);
router.get('/', getClothes);
router.delete('/:id', deleteClothes);
router.get('/:id/suggest-donation', suggestDonatingClothes);

module.exports = router;
