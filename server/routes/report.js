const express = require('express');
const PDFDocument = require('pdfkit');

const Verification = require('../models/Verification');

const router = express.Router();

// GET /api/report/:id
// Generates a PDF report for a single verification record
router.get('/report/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const verification = await Verification.findById(id).lean();

    if (!verification) {
      return res
        .status(404)
        .json({ success: false, message: 'Verification not found' });
    }

    // Prepare response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="SunTraceAI_Report_${id}.pdf"`
    );

    const doc = new PDFDocument({ margin: 50 });

    // Pipe the PDF into the HTTP response
    doc.pipe(res);

    // Title
    doc
      .fontSize(20)
      .font('Helvetica-Bold')
      .text('SunTrace AI – Verification Report', { align: 'center' })
      .moveDown(1.5);

    doc
      .fontSize(10)
      .font('Helvetica')
      .text(`Report ID: ${verification._id}`, { align: 'left' })
      .moveDown(0.5);

    // Basic info
    const createdAt = verification.createdAt
      ? new Date(verification.createdAt)
      : null;

    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('Verification Details', { underline: true })
      .moveDown(0.8);

    const lines = [
      `Date: ${createdAt && !Number.isNaN(createdAt.getTime()) ? createdAt.toLocaleString() : 'N/A'}`,
      `Latitude: ${verification.latitude}`,
      `Longitude: ${verification.longitude}`,
      `Solar detected: ${verification.solarDetected ? 'Yes' : 'No'}`,
      `Panel count: ${verification.panelCount}`,
      `Estimated capacity (kW): ${verification.capacityKW}`,
      `GPS match: ${verification.gpsMatch ? 'Yes' : 'No'}`,
      `Fake risk score: ${(verification.fakeScore * 100).toFixed(1)}%`,
      `Final verdict: ${verification.verdict}`,
    ];

    doc.fontSize(11).font('Helvetica');
    lines.forEach((line) => {
      doc.text(`• ${line}`).moveDown(0.3);
    });

    // Footer
    doc.moveDown(2);
    doc
      .fontSize(10)
      .fillColor('gray')
      .text('Powered by SunTrace AI for Sustainable India', {
        align: 'center',
      });

    // Finalize PDF and end the stream
    doc.end();
  } catch (err) {
    console.error('Error generating verification report:', err);
    // If headers are already sent, we cannot send JSON; just end the response
    if (res.headersSent) {
      return res.end();
    }
    return res
      .status(500)
      .json({ success: false, message: 'Failed to generate report' });
  }
});

module.exports = router;


