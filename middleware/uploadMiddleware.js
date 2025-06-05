const multer = require("multer");
const path = require("path");

// save file to disk
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // directory to save uploaded files
  },
  filename: function (req, file, cb) {
    // create a unique filename using current timestamp and original file extension
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// only allow image files
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"));
  }
};

const upload = multer({ storage, fileFilter });
module.exports = upload;
