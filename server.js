const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const {xss} = require('express-xss-sanitizer');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');


dotenv.config({ path: './config/config.env' });

const companies = require('./routes/companies');
const auth = require('./routes/auth');
const appointments = require('./routes/appointments');

connectDB();
const app = express();

const swaggerOptions = {
    swaggerDefinition:{
        openapi: '3.0.0',
        info: {
            title: 'Library API',
            version: '1.0.0',
            description: 'A simple Express VacQ API',
        },
        servers:[
            {
                url: 'http://localhost:5000/api/v1'
            }
        ]
    },
    apis:['./routes/*.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs',swaggerUI.serve, swaggerUI.setup(swaggerDocs));

app.use(express.json());
app.use(cookieParser());
app.use(mongoSanitize());
app.use(helmet());
app.use(xss());
app.use(hpp());
app.use(cors());

const limiter = rateLimit({
    windowsMs : 10*60*1000,
    max: 500
})
app.use(limiter);

app.use('/api/v1/companies',companies);
app.use('/api/v1/auth',auth);
app.use('/api/v1/appointments', appointments)

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, console.log('Server running in ', process.env.NODE_ENV, ' mode on port ', PORT));

process.on('unhandledRejection', (err,promise) =>{
    console.log(`Error: ${err.message}`);
    server.close(()=>process.exit(1));
})
