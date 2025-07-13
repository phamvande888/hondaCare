const fs = require("fs");
const path = require("path");

const deleteFiles = (filenames) => {
  filenames.forEach((filename) => {
    const filePath = path.join(__dirname, "../uploads", filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  });
};

module.exports = {
  deleteFiles,
};
