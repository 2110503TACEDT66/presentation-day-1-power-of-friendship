const Appointment = require('../models/Appointment');
const Company = require('../models/Company');

//@desc   Get all appointments
//@route  GET /api/v1/appointments
//@access Private
exports.getAppointments = async(req, res, next) => {
    let query;

    //General users can see only their appointment!
    if (req.user.role !== 'admin') {
        query = Appointment.find({user: req.user.id}).populate({
            path: 'company',
            select: 'name address tel'
        });
    } else {
        if (req.params.companyId) {
            console.log(req.params.companyId);
            query = Appointment.find({company: req.params.companyId}).populate({
                path: 'company',
                select: 'name address tel'
            });
        } else {
            query = Appointment.find().populate({
                path: 'company',
                select: 'name address tel'
            });
        }
    }
    
    try {
        const appointments = await query;

        res.status(200).json({
            success: true,
            count: appointments.length,
            data: appointments
        });
    } catch (err) {
        console.log(err.stack);

        return res.status(500).json({
            success: false,
            message: 'Cannot find Appointment'
        });
    }
}

//@desc  Get single appointment
//@route GET /api/v1/appointments/:id
//access Public
exports.getAppointment = async (req, res, next) => {
    try {
        const appointment = await Appointment.findById(req.params.id).populate({
            path: 'company',
            select: 'name description tel'
        });
        
        if (!appointment) {
            return res.status(404).json({
                success: false, 
                message: `No appointment with the id of ${req.params.id}`
            });
        }

        res.status(200).json({
            success: true, 
            data: appointment
        });
    } catch (err) {
        console.log(err.stack);

        return res.status(500).json({
            success: false, 
            message: 'Cannot find Appointment'
        });
    }
}

//@desc  Add single appointment
//@route POST /api/v1/hospital/:hospitalId/appointments/
//access Private
exports.addAppointment= async (req, res, next) => {
    try {
        
        req.body.company = req.params.companyId;

        const company = await Company.findById(req.params.companyId);

        if (!company) {
            return res.status(404).json({
                success: false, 
                message: `No company with the id of ${req.params.companyId}`
            });
        }

        console.log(req.body);

    // Add user ID to req.body and ensure that the user can only make appointments for themselves.
        if(req.user.role === 'user'){
            req.body.user = req.user.id;
        }
        
        //Check for existed appointment
        const existedAppointments = await Appointment.find({user: req.user.id});

        //If the user is not a admin, they can only create 3 appointment.
        if (existedAppointments.length >= 3 && req.user.role !== 'admin') {
            return res.status(400).json({
                success: false,
                message: `The user with ID ${req.user.id} has already made 3 appointments`
            });
        }

        //If he chooses a date other than the specified date
        if (req.body.appDate < '2022-05-10T00:00:00.000Z' || '2022-05-13T23:59:59.999Z' < req.body.appDate) {
            return res.status(400).json({
                success: false,
                message: `The user with ID ${req.user.id} has not chooses the specifies date`
            });
        }

        //Check AppointmentTime is still available
        const checkAppointmentTime = await Appointment.find({company: req.params.companyId, appDate: req.body.appDate});

        if(checkAppointmentTime.length > 0){
                return res.status(400).json({
                    success: false,
                    message: `The appointment time for ${req.body.appDate} at this company is already booked. Please choose a different time.`
                });
        }

        const appointment = await Appointment.create(req.body);

        res.status(200).json({
            success: true, 
            data: appointment
        });
    } catch(err) {
        console.log(err.stack);

        return res.status(500).json({
            success: false, 
            message: 'Cannot create appointment'
        });
    }
}

//@desc  Update appointment
//@route PUT /api/v1/appointments/:id
//access Private
exports.updateAppointment = async (req, res, next) => {
    try {
        const appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({
                success: false, 
                message: `No appointment with id ${req.params.id}`
            });
        }

        if (appointment.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({
                success: false, 
                message: `User ${req.user.id} is not authorized to update this appointment`
            });
        }

        appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, {
            new: true, 
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: appointment
        });
    } catch(err) {
        console.log(err.stack);

        return res.status(500).json({
            success: false, 
            message: 'Cannot update Appointment'
        });
    }
}

//@desc  Delete appointment
//@route DELETE /api/v1/appointments/:id
//access Private
exports.deleteAppointment = async (req, res, next) => {
    try{
        const appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({
                success: false, 
                message: `No appointment with id ${req.params.id}`
            });
        }

        if (appointment.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({
                success: false,
                message: `User ${req.user.id} is not authorized to delete this appointment`
            });
        }

        await appointment.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        console.log(err.stack);

        return res.status(500).json({
            success: false, 
            message: 'Cannot delete Appointment'
        });
    }
}