const mongoose = require('mongoose');

// User schema with added role field
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],  // Limiting roles to 'user' and 'admin'
        default: 'user'  // Default role is 'user'
    },
    username: {
        type: String,
        required: true,
        unique: true  // Ensures usernames are unique
    }
});

// Creating the User model
const User = mongoose.model('User', userSchema);

module.exports = User;
