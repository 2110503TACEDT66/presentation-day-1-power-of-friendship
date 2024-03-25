const mongoose = require('mongoose');

const SectionSchema = new mongoose.Schema({
    company: {
        type: mongoose.Schema.ObjectId,
        ref: 'Company',
        required: [true , "Please provide company id"]
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        default: null
    },
    date: {
        type: Date,
        required: [true , "Please provide date"]
    },
    status: {
        type: String,
        enum: ['not available', 'available'],
        default: 'available'
    },
    description: {
        type: String
    }
});


module.exports = mongoose.model('Section', SectionSchema);