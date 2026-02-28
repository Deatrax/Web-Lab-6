const express = require('express');
const router = express.Router();
const upload = require('../middleware/multer');
const {
    addOutfit, generateOutfit, getAllOutfits, getOutfitById,
    modifyOutfitById
} = require('../controllers/outfitController');
const { getWardrobeAnalytics } = require('../controllers/analyticsController');


router.post('/', upload.array('outfitImages', 5), addOutfit)
router.post('/generate', upload.array('outfitImages', 5), generateOutfit);
router.get('/', getAllOutfits);
router.get('/analytics', getWardrobeAnalytics);
router.get('/:id', getOutfitById);
router.patch('/:id', modifyOutfitById)

module.exports = router;
