const { compareSync } = require('bcryptjs');
const Appointment = require('../models/Appointment');
const Company = require('../models/Company');

exports.getAppointments = async(req,res,next)=>{
    let query;
    //General users can see only their appointment!
    if(req.user.role !== 'admin'){
        query = Appointment.find({user:req.user.id}).populate({
            path:'company',
            select: 'name address tel'
        });
    }else{
        if(req.params.companyId){
            console.log(req.params.companyId);
            query=Appointment.find({hospital: req.params.companyId}).populate({
                path:'company',
                select: 'name address tel'
            });
        }else{
            query=Appointment.find().populate({
                path:'company',
                select: 'name address tel'
            });
        }
    }
    try{
        const appointments = await query;
        res.status(200).json({
            success: true,
            count: appointments.length,
            data: appointments
        })
    }catch(err){
        console.log(err.stack);
        return res.status(500).json({
            success:false,
            message:"Cannot find Appointment"
        });
    }
}

exports.getAppointment = async (req, res, next)=>{
    try{
        const appointment = await Appointment.findById(req.params.id).populate({
            path: 'company',
            select: 'name description tel'
        });
        if(!appointment){
            return res.status(404).json({success:false, message: `No appointment with the id of ${req.params.id}`});
        }
        res.status(200).json({success: true, data: appointment});
    }catch(err){
        console.log(err.stack);
        return res.status(500).json({success:false, message: 'Cannot find Appointment'});
    }
}

exports.addAppointment= async (req, res, next)=>{
    try{
        req.body.company = req.params.companyId;

        const company = await Company.findById(req.params.companyId);

        if(!company){
            return res.status(404).json({success:false, message: `No company with the id of ${req.params.companyId}`});
        }

        console.log(req.body);
        req.body.user=req.user.id;
        
        const existedAppointments = await Appointment.find({user:req.user.id});

        if(existedAppointments.length >= 3 && req.uesr.role !== 'admin'){
            return res.status(400).json({success:false,message:`The user with ID ${req.user.id} has already made 3 appointments`})
        }

        const appointment = await Appointment.create(req.body);
        res.status(200).json({success:true, data: appointment});

    }catch(err){
        console.log(err.stack);
        return res.status(500).json({success:false, message: 'Cannot create appointment'});
    }
}

exports.updateAppointment = async (req,res,next)=>{
    try{
        const appointment = await Appointment.findById(req.params.id);

        if(!appointment){
            return res.status(404).json({success:false, message: `No appt with id ${req.params.id}`});
        }

        if(appointment.user.toString() !== req.user.id && req.user.role !== 'admin'){
            return res.status(401).json({success:false,message:`User ${req.user.id} is not authorized to update this appointment`})
        }
        appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, {new:true, runValidators: true});

        res.status(200).json({success:true,data: appointment});
    }catch(err){
        console.log(err.stack);
        return res.status(500).json({success:false, message:"Cannot update Appointment"});
    }
}

exports.deleteAppointment = async (req,res,next)=>{
    try{
        const appointment = await Appointment.findById(req.params.id);

        if(!appointment){
            return res.status(404).json({success:false, message: `No appt with id ${req.params.id}`});
        }

        if(appointment.user.toString() !== req.user.id && req.user.role !== 'admin'){
            return res.status(401).json({success:false,message:`User ${req.user.id} is not authorized to delete this appointment`})
        }

        await appointment.deleteOne();

        res.status(200).json({success:true,data: {}});
    }catch(err){
        console.log(err.stack);
        return res.status(500).json({success:false, message:"Cannot delete Appointment"});
    }
}