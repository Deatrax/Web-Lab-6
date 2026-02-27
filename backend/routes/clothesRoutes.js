const express = require('express');
const router = express.Router();
const upload = require('../middleware/multer');
const {
    getAllClothes,
    addClothes
} = require('../controllers/clothesController');

router.get('/', getAllClothes);
router.post('/', upload.array('images', 5), addClothes);

module.exports = router;
