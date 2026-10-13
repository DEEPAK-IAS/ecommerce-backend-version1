import multer from "multer";
import fs from "fs";

// multer does not create the folder when `destination` is a function,
// so make sure it exists (it is git-ignored and missing on a fresh deploy).
fs.mkdirSync("uploads", { recursive: true });

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "uploads");
  },
  filename: function(req, file, cb) {
    cb(null, `${Date.now()}_${file.originalname}`)
  }
})

const upload = multer({storage: storage})

export default upload;
