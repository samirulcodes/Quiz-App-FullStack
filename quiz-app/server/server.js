const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const path = require('path'); // Required to serve the static files
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const quizRoutes = require('./routes/quiz');

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/api/auth', authRoutes);

// Serve static files from the 'client' directory
app.use(express.static(path.join(__dirname, '../client')));

// Catch-all route to serve the index.html file
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/index.html'));
});


// Add the new route
app.use('/api/quiz', quizRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
