const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });
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
const { body, validationResult } = require('express-validator');

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

// Middleware 
app.use(express.json()); // For parsing JSON requests
app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(cookieParser());
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
app.use(cookieParser());

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

// Middleware to sanitaze input
function sanitizeInput(req, res, next) {
    for (let key in req.body) {
        if (req.body.hasOwnProperty(key) && typeof req.body[key] === 'string') {
            req.body[key] = req.body[key].trim().escape().stripLow();
        }
    }
    next();
}

// Middleware for validating task input
const validateTask = [
    body('title').isLength({ min: 1 }).withMessage('Title is required'),
    body('description').isLength({ min: 1 }).withMessage('Description is required'),
    body('assignedTo').isLength({ min: 1 }).withMessage('Username is required'),
    body('dueDate').isISO8601().withMessage('Due date must be in a valid format')
];

app.use(passport.initialize());
app.use(passport.session());

// Serve static files (login.html and others)
app.use(express.static(path.join(__dirname)));

// Middleware to check if the user is logged in and redirecting to log in or applying csrf protection
app.use((req, res, next) => {
    // Allow unrestricted access to the login route
    if (req.path === '/login') {
        return next();
    }

    // Check if the user is logged in
    if (!req.session || !req.session.user) {
        return res.redirect('/login');
    }

    // Apply CSRF protection for other routes
    csrfProtection(req, res, next);
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

app.get('/csrf-token', csrfProtection, (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
});

// Route to create task, only allowed to admins.
app.post('/tasks', csrfProtection, ensureauthorized(['admin'], sanitizeInput, validateTask), async (req, res) => {
      
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, assignedTo, dueDate } = req.body;

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
