const mongoose = require('mongoose');

// Define task schema
const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    assignedTo: {
        type: String,
        required: true
    },
    dueDate: {
        type: Date,
        required: true
    }
});

// Create Task model
module.exports = mongoose.model('Task', taskSchema);  // Correct export
