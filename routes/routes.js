const router = require("express").Router();
const multer = require("multer");
const { healthStatus, analyzeResume } = require("../controllers/controllers");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
      return;
    }
    cb(new Error("Only PDF files are allowed"));
  },
});

router.get("/health", healthStatus);
router.post("/analyze", upload.single("resumePdf"), analyzeResume);

module.exports = router;
