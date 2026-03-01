const express = require('express');
const router = express.Router();
const upload = require('../middleware/multer');
const {
    createUser, getUsers
} = require('../controllers/userController');

router.post('/', upload.single('profilePicture'), createUser);
router.get('/', getUsers);

module.exports = router;
