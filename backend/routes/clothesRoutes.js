const express = require('express');
const router = express.Router();
const upload = require('../middleware/multer');
const {
    addClothes
} = require('../controllers/clothesController');

router.post('/', upload.array('images', 5), addClothes);

module.exports = router;
