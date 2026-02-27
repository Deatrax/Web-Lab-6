const express = require('express');
const router = express.Router();
const upload = require('../middleware/multer');
const {
    addClothes,
    getClothes,
    deleteClothes
} = require('../controllers/clothesController');

router.post('/', upload.array('images', 5), addClothes);
router.get('/', getClothes);
router.delete('/:id', deleteClothes);

module.exports = router;
