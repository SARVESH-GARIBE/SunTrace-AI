const express = require('express');
const multer = require('multer');
const path = require('path');

const Verification = require('../models/Verification');

const router = express.Router();

// Multer storage configuration
// - Stores files in /server/uploads
// - Keeps original filenames
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

// File filter to accept only images
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG and PNG images are allowed'));
  }
};

const upload = multer({
  storage,
  fileFilter,
});

// Mock AI analysis function (no real ML yet)
function runMockAnalysis(latitude, longitude) {
  const solarDetected = true;
  const panelCount = Math.floor(Math.random() * 11) + 8; // 8–18
  const capacityKW = panelCount * 0.55;
  const gpsMatch = latitude !== 0 && longitude !== 0;
  const fakeScore = 0.05 + Math.random() * (0.25 - 0.05); // 0.05–0.25

  let verdict = 'Needs manual review';
  if (solarDetected && gpsMatch && fakeScore < 0.4) {
    verdict = 'Eligible';
  }

  return {
    solarDetected,
    panelCount,
    capacityKW,
    gpsMatch,
    fakeScore,
    verdict,
  };
}

// POST /api/verify
// - Accepts form-data: image (file), latitude, longitude
// - Saves image, runs mock AI, stores result in MongoDB, returns JSON
router.post('/verify', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: 'Image file is required' });
    }

    const { latitude, longitude } = req.body;

    const latNum = parseFloat(latitude);
    const lonNum = parseFloat(longitude);

    if (Number.isNaN(latNum) || Number.isNaN(lonNum)) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid latitude or longitude' });
    }

    const aiResult = runMockAnalysis(latNum, lonNum);

    const verification = new Verification({
      imagePath: req.file.path,
      latitude: latNum,
      longitude: lonNum,
      solarDetected: aiResult.solarDetected,
      panelCount: aiResult.panelCount,
      capacityKW: aiResult.capacityKW,
      gpsMatch: aiResult.gpsMatch,
      fakeScore: aiResult.fakeScore,
      verdict: aiResult.verdict,
    });

    const saved = await verification.save();

    return res.status(201).json({ success: true, data: saved });
  } catch (err) {
    console.error('Error in POST /api/verify:', err);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
});

// GET /api/history
// - Returns all Verification documents sorted by createdAt (newest first)
router.get('/history', async (req, res) => {
  try {
    const history = await Verification.find().sort({ createdAt: -1 });
    return res.json({ success: true, data: history });
  } catch (err) {
    console.error('Error in GET /api/history:', err);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;


