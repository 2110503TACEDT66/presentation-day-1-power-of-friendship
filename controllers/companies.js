const Company = require("../models/Company");

//@desc   Get all companies
//@route  GET /api/v1/companies
//@access Public
exports.getCompanies = async (req, res, next) => {
    let query;

    //Copy req.query
    const reqQuery = {...req.query};

    //Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit'];

    //Loop over remove fields and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);
    console.log(reqQuery);

    //Create query string
    let queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    query = Company.find(JSON.parse(queryStr)).populate('appointments');

    //Select Fields
    if (req.query.select) {
        const fields = req.query.select.split(',').join(' ');
        query = query.select(fields);
    }

    //Sort
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    } else {
        query = query.sort('name');
    }
    
    //Pagination
    const page = parseInt(req.query.page,10) || 1;
    const limit = parseInt(req.query.limit,10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    
    try {
        const total = await Company.countDocuments();

        query = query.skip(startIndex).limit(limit);

        //Execute query
        const companies = await query;

        //Pagination result
        const pagination = {};

        if (endIndex < total) {
            pagination.next = {
                page: page + 1,
                limit
            }
        }

        if(startIndex > 0) {
            pagination.prev = {
                page: page - 1,
                limit
            }
        }

        res.status(200).json({
            success: true, 
            count: companies.length, 
            data: companies
        });
    } catch (err) {
        res.status(400).json({success: false});
    }
}

//@desc   Get single company
//@route  GET /api/v1/companies/:id
//@access Public
exports.getCompany = async (req, res, next) => {
    try {
        const company = await Company.findById(req.params.id);

        if (!company) {
            return res.status(400).json({succes: false});
        }
        res.status(200).json({
            success: true,
            data: company});
    } catch (err) {
        res.status(400).json({success: false});
    }
}

//@desc   Create a company
//@route  POST /api/v1/companies
//@access Private
exports.createCompany =  async (req, res, next) => {
    const company = await Company.create(req.body);
    res.status(201).json({
        succes: true,
        data:company
    });
}

//@desc   Update single company
//@route  PUT /api/v1/companies/:id
//@access Private
exports.updateCompany = async (req, res, next) => {
    try {
        const company = await Company.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!company) {
            return res.status(400).json({success: false});
        }

        res.status(200).json({
            success: true,
            data: company
        });
    } catch (err) {
        res.status(400).json({success: false});
    }
}

//@desc   Delete single company
//@route  DELETE /api/v1/companies/:id
//@access Private
exports.deleteCompany = async (req, res, next) => {
    try {
        const company = await Company.findById(req.params.id);

        if (!company) {
            return res.status(400).json({success: false});
        }

        await company.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        res.status(400).json({success: false});
    }
}

const axios = require('axios');


//return current address from ip address
async function getYourCurrentAddressFromIP() {
    try {
        //Use ipapi's api for find latitude and longtitude from IP address
        const response = await axios.get('https://ipapi.co/json');
        
        if ((response.data.city) && (response.data.region) && (response.data.country_name)) {
            const userAddress =  (response.data.city + ", " + response.data.region);
            return userAddress;
        } else {
            throw new Error(`region or region_code or country_code not found in IP geolocation data`);
        }
    } catch (error) {
        throw new Error('Error retrieving address from IP geolocation');
    }
}

async function getDistanceAndDuration(companyAddress, userAddress) {

    //Use Distance Matrix API for calculate distance and duration between two points
    const response = await axios.get('https://maps.googleapis.com/maps/api/distancematrix/json', {
        params: {
            destinations: companyAddress,
            origins: userAddress,
            units: 'imperial',
            key: 'AIzaSyD_7CKN7QIjeCTb6LzTnWh7eF4yrku3CPQ'
        }
    });

    if(response.data.status === 'OK'){
        return  {
                    distance: response.data.rows[0].elements[0].distance.text,
                    duration: response.data.rows[0].elements[0].duration.text,
                }
    } else{
        throw new Error(`Error data not found`)
    }


}

// Controller function to calculate distance and duration between your location and a company's address
exports.calculateDistanceAndDuration = async (req, res) => {
    try {
        //company's name from postman
        const companyName =  req.body.company;

        //find the company by companyName
        const company = await Company.findOne({name: companyName});

        //check company is exist
        if(!company){
            return res.status(400).json({succes: false,message: `this company doesn't exist`});
        }

        //user's address from function
        const userAddress = await getYourCurrentAddressFromIP();

        //Company's address from query
        const companyAddress = company.address;

        //calculate the distance between company and you
        const distanceAndDuration = await getDistanceAndDuration(companyAddress, userAddress);

        // Send the distance in the response
        res.status(200).json({
            success: true,
            distance : distanceAndDuration.distance,
            duration : distanceAndDuration.duration
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Error calculating distance'
        });
    }
};
