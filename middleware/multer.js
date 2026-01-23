const multer = require("multer"); 

 // write necessary code for storage and file filter



const upload = multer({ storage,                                
                      fileFilter,   
                      limits: { fileSize: 5 * 1024 * 1024 } }); 
module.exports = upload;