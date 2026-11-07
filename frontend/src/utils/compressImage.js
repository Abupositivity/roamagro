const MAX_IMAGE_DIMENSION = 1200;
const MAX_FILE_SIZE = 12 * 1024 * 1024;
const JPEG_QUALITY = 0.75;

const SUPPORTED_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
];

const compressImage = async file => {
    if (!file || !(file instanceof File)) {
        throw new Error('Please select a valid image.');
    }

    const fileType = (file.type || '').toLowerCase();

    if (!SUPPORTED_TYPES.includes(fileType)) {
        throw new Error(
            'Unsupported image format. Please select a JPG, PNG or WebP image.'
        );
    }

    if (file.size === 0) {
        throw new Error('The selected image is empty.');
    }

    if (file.size > MAX_FILE_SIZE) {
        throw new Error('Image size must not exceed 12MB.');
    }

    const imageUrl = URL.createObjectURL(file);

    try {
        const image = await new Promise((resolve, reject) => {
            const img = new Image();

            img.onload = () => resolve(img);

            img.onerror = () => reject(
                new Error(
                    'Unable to read this image on your device. Try another JPG or PNG photo.'
                )
            );

            img.src = imageUrl;
        });

        const originalWidth = image.naturalWidth;
        const originalHeight = image.naturalHeight;

        if (!originalWidth || !originalHeight) {
            throw new Error(
                'The selected image has invalid dimensions.'
            );
        }

        const needsResize =
            originalWidth > MAX_IMAGE_DIMENSION ||
            originalHeight > MAX_IMAGE_DIMENSION;

        // Small JPEG files can be uploaded without recompression.
        if (!needsResize && fileType === 'image/jpeg') {
            return file;
        }

        const scale = Math.min(
            1,
            MAX_IMAGE_DIMENSION / originalWidth,
            MAX_IMAGE_DIMENSION / originalHeight
        );

        const width = Math.max(
            1,
            Math.round(originalWidth * scale)
        );

        const height = Math.max(
            1,
            Math.round(originalHeight * scale)
        );

        const canvas = document.createElement('canvas');

        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext('2d');

        if (!context) {
            throw new Error(
                'Unable to process this image on your device.'
            );
        }

        context.fillStyle = '#FFFFFF';
        context.fillRect(0, 0, width, height);
        context.drawImage(image, 0, 0, width, height);

        const blob = await new Promise((resolve, reject) => {
            canvas.toBlob(
                result => {
                    if (!result) {
                        reject(
                            new Error('Unable to compress the selected image.')
                        );
                        return;
                    }

                    resolve(result);
                },
                'image/jpeg',
                JPEG_QUALITY
            );
        });

        return new File(
            [blob],
            `${file.name.replace(/\.[^/.]+$/, '')}.jpg`,
            {
                type: 'image/jpeg',
                lastModified: Date.now(),
            }
        );
    } finally {
        URL.revokeObjectURL(imageUrl);
    }
};

export default compressImage;