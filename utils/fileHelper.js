const fs = require("fs");
const path = require("path");

const deleteFiles = async (filenames) => {
  const files = Array.isArray(filenames) ? filenames : [filenames];

  await Promise.all(
    files.map(async (filename) => {
      const filePath = path.join(__dirname, "../uploads", filename);
      try {
        await fs.promises.unlink(filePath);
        console.log(`🗑️ Deleted file: ${filename}`);
      } catch (err) {
        if (err.code !== "ENOENT") {
          console.error(`❌ Error deleting file ${filename}:`, err);
        }
      }
    })
  );
};

module.exports = { deleteFiles };
