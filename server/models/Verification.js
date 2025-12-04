const mongoose = require('mongoose');

// Verification schema for rooftop solar analysis results
const VerificationSchema = new mongoose.Schema({
  imagePath: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  solarDetected: { type: Boolean, required: true },
  panelCount: { type: Number, required: true },
  capacityKW: { type: Number, required: true },
  gpsMatch: { type: Boolean, required: true },
  fakeScore: { type: Number, required: true },
  verdict: {
    type: String,
    enum: ['Eligible', 'Needs manual review'],
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Verification', VerificationSchema);


