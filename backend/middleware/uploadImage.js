const multer = require('multer');

const allowedImageTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
];

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 12 * 1024 * 1024,
        files: 3,
    },
    fileFilter: (req, file, callback) => {
        if (!allowedImageTypes.includes(file.mimetype)) {
            return callback(
                new Error(
                    'Only JPEG, PNG, and WebP images are allowed.'
                )
            );
        }

        callback(null, true);
    },
});

module.exports = upload;