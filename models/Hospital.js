const mongoose = require('mongoose');

const HospitalsSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        unique: true,
        trime: true,
        maxlength: [50, 'Name can not be more than 50 characters']
    },

    address: {
        type: String,
        required: [true, 'Please add an address']
    },

    district:{
        type: String,
        required: [true,'Please add a district']
    },

    province:{
        type: String,
        required: [true, 'Please add a provice']
    },

    postalcode:{
        type: String,
        required: [true, 'Please add a postalcode'],
        maxlength: [5, 'Postal Code can not be more than 5 digits']
    },

    tel:{
        type: String
    },

    region:{
        type: String,
        required: [true,'Please add a region']
    }
},{
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
});

HospitalsSchema.virtual('appointments',{
    ref: 'Appointment',
    localField: '_id',
    foreignField: 'hospital',
    justOne: false
});

//Cascade
HospitalsSchema.pre('deleteOne',{document: true, query: false}, async function(next){
    console.log(`Appointments being removed from hospitals ${this._id}`);
    await this.model('Appointment').deleteMany({hospital:this._id});
    next();
})

module.exports = mongoose.model('Hospital',HospitalsSchema);