const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const {
  createAssignment,
  getMyAssignments,
  submitAssignment,
  gradeAssignment,
  getAllAssignments,
  getAssignmentById,
  deleteAssignment,
  getAllSubmissions,
  downloadFile,
  updateAssignment, 
} = require("../controllers/assignmentController.js");

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../../uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}_${file.originalname}`;
    cb(null, uniqueSuffix);
  },
});
const upload = multer({ storage });

router.post("/", createAssignment);

router.put("/:id", updateAssignment);

router.get("/submissions", getAllSubmissions);
router.get("/my", getMyAssignments);
router.post("/:id/submit", upload.single("file"), submitAssignment);
router.post("/:id/grade", gradeAssignment);
router.get("/", getAllAssignments);
router.get("/:id", getAssignmentById);
router.delete("/:id", deleteAssignment);
router.get("/files/:filename", downloadFile);

module.exports = router;
