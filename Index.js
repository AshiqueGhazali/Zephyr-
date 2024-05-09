// Load env variables
const dotenv = require('dotenv');
dotenv.config({ path: '.env' });

// Import modules
const express = require('express');
const mongoose = require('mongoose');
const path = require("path");
const nocache = require('nocache');
const session = require('express-session');
const morgan = require('morgan');

const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL || "mongodb://127.0.0.1:27017/zephyr_eCommerce");

// Use Morgan for logging,
// app.use(morgan('dev'));

// Use no-cache middleware to prevent browser from caching
app.use(nocache());

// Configure sessions
app.use(session({
    secret: process.env.AUTH_SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
}));

// Set view engine and static paths
app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use("/assets", express.static(path.join(__dirname, 'public/assets')));
app.use('/css', express.static(path.join(__dirname, 'public/css')));
app.use('/js', express.static(path.join(__dirname, 'public/js')));

// Body parser middleware to parse JSON and url-encoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes
const userRout = require("./routes/userRout.js");
const adminRout = require("./routes/adminRout.js");

// Use routes
app.use("/", userRout);
app.use('/admin', adminRout);

app.set('views','./view/user')

// Use centralized error handling middleware
const errorMiddleware = require('./middleware/errorHandlingMiddleware.js');
app.use(errorMiddleware);

// 404
app.all('*', (req, res) => {
  res.status(404).render('error', { status: 404, error: '' });
});

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server Running on http://localhost:${port}`);
});
