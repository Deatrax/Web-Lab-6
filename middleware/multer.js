const multer = require("multer"); //middleware to handle multipart/form-data, which is primarily used for uploading files.

const storage = multer.diskStorage({ //Stores uploaded files temporarily on your server before sending to Cloudinary
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => { 
  const allowedTypes = /jpeg|jpg|png|gif/;
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

const upload = multer({ storage,                                //Initialize multer with the defined storage and file filter configurations
                      fileFilter,   
                      limits: { fileSize: 5 * 1024 * 1024 } }); //Limit file size to 5MB
module.exports = upload;