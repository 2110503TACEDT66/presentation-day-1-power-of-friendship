 const mongoose = require('mongoose');

 const AppointmentSchema = new mongoose.Schema({
    appDate: {
        type: Date,
        required: true
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    company: {
        type: mongoose.Schema.ObjectId,
        ref: 'Company',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
 });
 
 module.exports = mongoose.model('Appointment', AppointmentSchema)