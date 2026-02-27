const express = require('express');
const router = express.Router();
const {
    getAllLaundry,
    addLaundry,
    updateLaundry,
    deleteLaundry
} = require('../controllers/laundryController');

router.get('/', getAllLaundry);
router.post('/', addLaundry);
router.put('/:id', updateLaundry);
router.delete('/:id', deleteLaundry);

module.exports = router;
