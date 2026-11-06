const cloudinary = require('../config/cloudinary');

const uploadImage = (
    file,
    folder,
    options = {}
) => {
    if (!file?.buffer) {
        return Promise.reject(
            new Error('No image file was provided.')
        );
    }

    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: 'image',
                ...options,
            },
            (error, result) => {
                if (error) {
                    return reject(error);
                }

                resolve({
                    url: result.secure_url,
                    publicId: result.public_id,
                });
            }
        );

        stream.end(file.buffer);
    });
};

const deleteImage = async publicId => {
    if (!publicId) {
        return null;
    }

    return cloudinary.uploader.destroy(publicId, {
        resource_type: 'image',
    });
};

module.exports = {
    uploadImage,
    deleteImage,
};