
require('dotenv').config();

const fs = require('fs');
const path = require('path');

const {
    uploadImage,
    deleteImage,
} = require('../utils/cloudinaryStorage');

const testUpload = async () => {
    let publicId = '';

    try {
        const imagePath = path.join(
            __dirname,
            'test-image.jpg'
        );

        if (!fs.existsSync(imagePath)) {
            throw new Error(
                'Place a test-image.jpg file inside the tests folder.'
            );
        }

        const file = {
            buffer: fs.readFileSync(imagePath),
            originalname: 'test-image.jpg',
            mimetype: 'image/jpeg',
        };

        console.log('Uploading image...');

        const result = await uploadImage(
            file,
            'roamagro/tests'
        );

        publicId = result.publicId;

        console.log('Upload successful.');
        console.log('Image URL:', result.url);
        console.log('Public ID:', publicId);

        console.log('Deleting test image...');

        const deletion = await deleteImage(publicId);

        if (deletion?.result !== 'ok') {
            throw new Error(
                `Image deletion was not confirmed: ${deletion?.result || 'unknown'}`
            );
        }

        console.log('Image deleted successfully.');
    } catch (error) {
        console.error(
            'Cloudinary upload test failed:',
            error?.message || 'Unknown error'
        );

        if (publicId) {
            console.error(
                'Check Cloudinary for the test image:',
                publicId
            );
        }

        process.exitCode = 1;
    }
};

testUpload();