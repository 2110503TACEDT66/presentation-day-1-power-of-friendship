const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema({
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
        required: [true, 'Please add the website URL'],
        match: [
            /^(https?:\/\/)?(www\.)?([a-zA-Z0-9-]+\.){1,}[a-zA-Z]{2,}(\/\S*)?$/,
            'Please add a valid website URL'
        ]
    },
    description: {
        type: String,
        required: [true, 'Please provide a description for the website']
    },
    tel: {
        type: String,
        required: [true, 'Please add a telephone number'],
        maxlength: [12, 'Telephone number must not exceed 12 characters'],
        match: [/^[\d-]+$/, 'Telephone number must contain only digits and hyphens']
    },
    picture: {
        type:String,
        required: [true, 'Please provide a link of picture']
    }
    
}, {
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
});

//Reverse populate with virtuals
CompanySchema.virtual('appointments', {
    ref: 'Appointment',
    localField: '_id',
    foreignField: 'company',
    justOne: false
});

//Cascade delete appointments when a company is deleted
CompanySchema.pre('deleteOne', {document: true, query: false}, async function(next) {
    console.log(`Appointments being removed from companies ${this._id}`);
    await this.model('Appointment').deleteMany({company: this._id});
    await this.model('Section').deleteMany({company: this._id});
    next();
})

module.exports = mongoose.model('Company', CompanySchema);