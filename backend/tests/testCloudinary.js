
require('dotenv').config();

const cloudinary = require('../config/cloudinary');

const testConnection = async () => {
    try {
        const result = await cloudinary.api.ping();

        console.log('Cloudinary connection successful.');
        console.log(result);
    } catch (error) {
        console.error('Cloudinary connection failed.');
        console.error('Full error:', error);
        console.error('Error message:', error?.message);
        console.error('HTTP code:', error?.http_code);

        process.exitCode = 1;
    }
};

testConnection();