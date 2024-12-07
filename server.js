const express = require('express');
const session = require('express-session');
const passport = require('passport');
const flash = require('express-flash');
const path = require('path');
const bcrypt = require('bcrypt');
const initializePassport = require('./passport-config');
const mongoose = require('mongoose');
const User = require('./models/User'); // Path to the user model
const { strict } = require('assert');

const app = express();
const PORT = process.env.PORT || 3000;

// Database connection (MongoDB Atlas or local)
mongoose.connect('mongodb+srv://teste:teste@cluster0.li07k.mongodb.net/secure-web-project?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.log('Error connecting to MongoDB: ', err));

// Passport configuration
initializePassport(
    passport,
    email => User.findOne({ email: email }),
    id => User.findById(id)
);

// Middleware
app.use(express.json()); // For parsing JSON requests
app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(
    session({
        secret: 'your_secret_key',         // it will be updated to a secure secret when in production
        resave: false,                     // Avoid unnecessary writes
        saveUninitialized: false,          // Minimize attack surface
        cookie: {
            secure: true,                   // Enforce HTTPS
            httpOnly: true,                 // Prevent client-side JS access
            sameSite: 'Strict',             // Limit cross-site access
            maxAge: 3600000                 // Session expiry (1 hour)
        } 
    })   // This ends the session() call
);

app.use(passport.initialize());
app.use(passport.session());

// Serve static files (login.html and others)
app.use(express.static(path.join(__dirname)));

app.use((req, res, next) => {
    // Allow access to the login route without a session
    if (req.path === '/login') {
        return next();
    }

    // Redirect to login if no session exists
    if (!req.session || !req.session.user) {
        return res.redirect('/login');
    }

    next();
});


app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html')); // Serve the login page
});

app.post('/login', passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: true
}), (req, res) => {
    // Successful login, send user info
    res.json({
        message: 'Login successful',
        user: {
            email: req.user.email,
            role: req.user.role
        }
    });
});


// Logout route
app.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) return next(err);
        res.redirect('/login');
    });
});

// Start the server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
