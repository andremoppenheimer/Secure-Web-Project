const express = require('express');
const session = require('express-session');
const passport = require('passport');
const flash = require('express-flash');
const path = require('path');
const bcrypt = require('bcrypt');
const initializePassport = require('./passport-config');
const mongoose = require('mongoose');
const User = require('./models/user'); // Path to the user model
const Task = require('./models/task'); // Path to the task model
const { strict } = require('assert');
const MongoStore = require('connect-mongo');

const app = express();
const PORT = process.env.PORT || 3000;

//MongoDB connection
const mongoURL = 'mongodb+srv://teste:teste@cluster0.li07k.mongodb.net/secure-web-project?retryWrites=true&w=majority'

// Database connection (MongoDB Atlas or local)
mongoose.connect(mongoURL, {
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

// Middleware setting cookies
app.use(express.json()); // For parsing JSON requests
app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(
    session({
        secret: 'your_secret_key',         // it will be updated to a secure secret when in production
        resave: false,                     // Avoid unnecessary writes
        saveUninitialized: false,          // Minimize attack surface
        store: MongoStore.create ({
            mongoUrl: mongoURL,
            collectionName: 'sessions',
            ttl: 3600,
        }),
        cookie: {
            secure: false,                   // Enforce HTTPS
            httpOnly: true,                 // Prevent client-side JS access
            sameSite: 'Strict',             // Limit cross-site access
            maxAge: 3600000                 // Session expiry (1 hour)
        } 
    })   // This ends the session() call
);

// Middleware to check authorization
function ensureauthorized(roles) {
    return (req, res, next) => {
        // Check if the user's role is included in the allowed roles
        if (!roles.includes(req.session.user.role)) {
            return res.status(403).json({ message: 'Forbidden: Insufficient privileges' });
        }
        next(); // Proceed if the role matches
    };
}


app.use(passport.initialize());
app.use(passport.session());

// Serve static files (login.html and others)
app.use(express.static(path.join(__dirname)));

// Globally checking if the user is logged in, if not, redirecting to login.
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
    req.session.user = req.user;
    res.json({
        message: 'Login successful',
        user: {
            email: req.user.email,
            role: req.user.role
        }
    });
});


// Route to create task, only allowed to admins.
app.post('/tasks', ensureauthorized(['admin']), async (req, res) => {
    const { title, description, assignedTo, dueDate } = req.body;

    // Ensure all required fields are provided
    if (!title || !description || !assignedTo || !dueDate) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        // Find the user by username (not by _id)
        const user = await User.findOne({ username: assignedTo });
        
        if (!user) {
            return res.status(400).json({ message: 'User not found.' });
        }

        // Create the new task and assign it to the user's MongoDB _id
        const task = new Task({
            title,
            description,
            assignedTo: user._id, // Assign the task using the user's _id
            dueDate
        });

        // Save the task
        await task.save();
        res.status(201).json({ message: 'Task created successfully!', task });
    } catch (error) {
        res.status(500).json({ message: 'Error creating task.', error: error.message });
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
