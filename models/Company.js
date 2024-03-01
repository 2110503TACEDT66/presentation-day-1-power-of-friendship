const mongoose = require('mongoose');

const CompaniesSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        unique: true,
        trim: true,
        maxlength: [50, 'Name can not be more than 50 characters']
    },
    address: {
        type: String,
        required: [true, 'Please add an address']
    },
    website: {
        type: String,
        required: [true, 'Please add the website URL']
    },
    description: {
        type: String,
        required: [true, 'Please provide a description for the website']
    },
    tel:{
        type: String,
        required: [true, 'Please add a telephone number']
    },
},{
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
});

CompaniesSchema.virtual('appointments',{
    ref: 'Appointment',
    localField: '_id',
    foreignField: 'company',
    justOne: false
});

//Cascade
CompaniesSchema.pre('deleteOne',{document: true, query: false}, async function(next){
    console.log(`Appointments being removed from companies ${this._id}`);
    await this.model('Appointment').deleteMany({company:this._id});
    next();
})

module.exports = mongoose.model('Company',CompaniesSchema);