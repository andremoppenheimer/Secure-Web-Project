const express = require('express');
const session = require('express-session');
const passport = require('passport');
const flash = require('express-flash');
const path = require('path');
const bcrypt = require('bcrypt');
const initializePassport = require('./passport-config');
const mongoose = require('mongoose');
const User = require('./models/User'); // Path to the user model

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
        secret: 'your_secret_key', // A secret key for signing the session ID cookie
        resave: false,             // Don't save session if unmodified
        saveUninitialized: false,  // Don't create session until something is stored
        cookie: { secure: false }  // For development, set to false. For production, use true with HTTPS.
    })
);
app.use(passport.initialize());
app.use(passport.session());

// Serve static files (login.html and others)
app.use(express.static(path.join(__dirname)));

// Routes
app.get('/', (req, res) => {
    if (req.isAuthenticated()) {
        return res.send(`Hello, ${req.user.email}`); // Personalized message after login
    }
    res.send('Welcome to Secure Web Project!');
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


app.post('/register', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).send('Email and password are required.');
    }

    try {
        const existingUser = await User.findOne({ email: email });
        if (existingUser) {
            return res.status(400).send('User already exists.');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            email,
            password: hashedPassword,
        });
        await newUser.save();
        res.status(201).send('User registered successfully!');
    } catch (error) {
        res.status(500).send('Error registering user.');
    }
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
