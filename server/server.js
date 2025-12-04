const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

const verifyRoutes = require('./routes/verify');
const reportRoutes = require('./routes/report');

dotenv.config();

const app = express();
// Render will inject PORT; default to 5000 for local dev
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// Ensure uploads directory exists (for local and cloud)
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
// For now allow all origins; later you can restrict to the deployed frontend URL
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static uploads for serving uploaded images
app.use('/uploads', express.static(uploadsDir));

// Basic health check route
app.get('/', (req, res) => {
    res.json({ message: 'SunTrace AI backend is running' });
});

// API routes
app.use('/api', verifyRoutes);
app.use('/api', reportRoutes);

// MongoDB connection
if (!MONGO_URI) {
    console.error('MONGO_URI is not defined in the environment variables');
} else {
    mongoose
        .connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        .then(() => {
            console.log('Connected to MongoDB');
        })
        .catch((err) => {
            console.error('Error connecting to MongoDB:', err.message);
        });
}

// Start server
app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
});
