const express = require('express');         // create the server
const session = require('express-session'); // manage users sessions
const cookieParser = require('cookie-parser'); // parses cookies 
const csrf = require('csurf'); // middleware for CSRF protection
const csrfProtection = csrf({ cookie: true }); // store CSRF token in cookies
const passport = require('passport'); // authentication middleware 
const flash = require('express-flash');  // provides flash messages
const path = require('path');
const initializePassport = require('./passport-config'); //initialize passport
const mongoose = require('mongoose');  // interact with mongo db atlas
const User = require('./models/user'); // Path to the user model
const Task = require('./models/task'); // Path to the task model
const { strict } = require('assert'); // debugging
const MongoStore = require('connect-mongo'); //store session data
const { body, validationResult } = require('express-validator'); // validate user inputs
const helmet = require("helmet") // set secure http headers
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
app.use(helmet()); // for securing headers
app.use(express.json()); // For parsing JSON requests
app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(cookieParser());
app.use(
    session({
        secret: 'your_secret_key',         // it will be updated to a secure secret when in production
        resave: false,                     // Avoid unnecessary writes
        saveUninitialized: false,          // Minimize attack surface
        store: MongoStore.create({
            mongoUrl: mongoURL,
            collectionName: 'sessions',
            ttl: 3600,
        }),
        cookie: {
            secure: false,                   // Enforce HTTPS. It will be updated to true when in production
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

// Route to Search for tasks assigned to a specific user
app.get('/search', async (req, res) => {
    const username = req.query.username;  // Get username from query params

    if (!username) {
        return res.status(400).json({ message: 'Username is required' });
    }

    try {
        // Find the user by username
        const user = await User.findOne({ username: username });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Find all tasks assigned to this user
        const tasks = await Task.find({ assignedTo: user._id })  // Assuming `assignedTo` is a userId reference
            .select('title description dueDate');  // Only select relevant fields

        if (tasks.length === 0) {
            return res.status(404).json({ message: 'No tasks found for this user' });
        }

        // Return tasks for the user
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Route to Search all tasks assigned to all users
app.get('/searchall', ensureauthorized(['admin']), async (req, res) => {
    try {
        // Find all tasks and populate user information
        const tasks = await Task.find()
            .populate('assignedTo', 'username')  // Assuming `assignedTo` is a user reference
            .select('title description assignedTo dueDate');

        if (tasks.length === 0) {
            return res.status(404).json({ message: 'No tasks found' });
        }

        // Group tasks by user
        const groupedTasks = tasks.reduce((acc, task) => {
            const user = task.assignedTo?.username || 'Unassigned';
            if (!acc[user]) {
                acc[user] = [];
            }
            acc[user].push(task);
            return acc;
        }, {});

        // Return grouped tasks
        res.json(groupedTasks);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Route to delete a task by title, only allowed to admins.
app.delete('/delete', csrfProtection, ensureauthorized(['admin']), async (req, res) => {
    const { title } = req.body; // Get the title from the request body

    try {
        // Find the task by title
        console.log(`Title = :${title}`);
        const task = await Task.findOneAndDelete({ title });
        if (!task) {
            return res.status(404).json({ message: `Task with title '${title}' not found.` });
        }
        console.log(`Task with title '${title}' deleted successfully.`);
        res.status(200).json({ message: `Task with title '${title}' deleted successfully.` });
    } catch (error) {
        res.status(500).json({ message: `Error deleting task with title '${title}'.`, error: error.message });
    }
});

// Route to update a task by title, only allowed to admins
app.put('/edit', csrfProtection, ensureauthorized(['admin']), async (req, res) => {
    const { title, newTitle, description, assignedTo, dueDate } = req.body; // Extract task details from the request body

    try {
        // Find the task by title and update its fields
        const updatedTask = await Task.findOneAndUpdate(
            { title }, // Locate the task using the title
            {
                title: newTitle || title, // Update the title if a new one is provided
                description,
                assignedTo,
                dueDate
            },
            { new: true } // Return the updated document
        );

        if (!updatedTask) {
            return res.status(404).json({ message: `Task with title '${title}' not found.` });
        }

        // Respond with the updated task details
        res.status(200).json({ message: 'Task updated successfully.', task: updatedTask });
    } catch (error) {
        console.error('Error updating task:', error); // Log the error for debugging
        res.status(500).json({ message: 'Error updating task.', error: error.message });
    }
});


// Logout route
app.post('/logout', csrfProtection, (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Failed to logout.');
        }
        res.redirect('/login'); // Redirect to login page after logging out
    });
});

// Start the server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
