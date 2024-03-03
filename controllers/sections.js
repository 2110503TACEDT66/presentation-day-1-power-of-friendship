const Section = require("../models/Section");

//@desc   Get all sections
//@route  GET /api/v1/sections
//@access Public
exports.getSections = async(req, res, next) => {
    let query;

    if (req.params.companyId) {
        console.log(req.params.companyId);
        query = Section.find({company: req.params.companyId}).populate({
            path: 'company',
            select: 'name address tel'
        });
    } else {
        query = Section.find().populate({
            path: 'company',
            select: 'name address tel'
        });
    }
    
    try {
        const sections = await query;

        res.status(200).json({
            success: true,
            count: sections.length,
            data: sections
        });
    } catch (err) {
        console.log(err.stack);

        return res.status(500).json({
            success: false,
            message: 'Cannot find Section'
        });
    }
}

//@desc  Get single section
//@route GET /api/v1/sections/:id
//access Public
exports.getSection = async (req, res, next) => {
    try {
        const section = await Section.findById(req.params.id).populate({
            path: 'company',
            select: 'name description tel'
        });
        
        if (!section) {
            return res.status(404).json({
                success: false, 
                message: `No section with the id of ${req.params.id}`
            });
        }

        res.status(200).json({
            success: true, 
            data: section
        });
    } catch (err) {
        console.log(err.stack);

        return res.status(500).json({
            success: false, 
            message: 'Cannot find Section'
        });
    }
}

//@desc   Create a section
//@route  POST /api/v1/sections
//@access Private
exports.createSection =  async (req, res, next) => {
    const section = await Section.create(req.body);
    res.status(201).json({
        succes: true,
        data: section
    });
}

//@desc   Update single section
//@route  PUT /api/v1/sections/:id
//@access Private
exports.updateSection = async (req, res, next) => {
    try {
        const section = await Section.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!section) {
            return res.status(400).json({success: false});
        }

        res.status(200).json({
            success: true,
            data: section
        });
    } catch (err) {
        res.status(400).json({success: false});
    }
}

//@desc   Delete single section
//@route  DELETE /api/v1/sections/:id
//@access Private
exports.deleteSection = async (req, res, next) => {
    try {
        const section = await Section.findById(req.params.id);

        if (!section) {
            return res.status(400).json({success: false});
        }

        await section.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        res.status(400).json({success: false});
    }
}