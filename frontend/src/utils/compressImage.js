const MAX_IMAGE_DIMENSION = 1200;
const MAX_FILE_SIZE = 12 * 1024 * 1024;
const JPEG_QUALITY = 0.75;

const compressImage = file => {
    return new Promise((resolve, reject) => {
        if (!file || !(file instanceof File)) {
            return reject(new Error('Please select a valid image.'));
        }

        if (!file.type.startsWith('image/')) {
            return reject(new Error('Please select a valid image file.'));
        }

        if (file.size > MAX_FILE_SIZE) {
            return reject(
                new Error('Image size must not exceed 12MB.')
            );
        }

        const imageUrl = URL.createObjectURL(file);
        const image = new Image();

        image.onload = () => {
            try {
                let { width, height } = image;

                if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
                    const scale = Math.min(
                        MAX_IMAGE_DIMENSION / width,
                        MAX_IMAGE_DIMENSION / height
                    );

                    width = Math.round(width * scale);
                    height = Math.round(height * scale);
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;

                const context = canvas.getContext('2d');

                if (!context) {
                    URL.revokeObjectURL(imageUrl);
                    return reject(
                        new Error('Unable to process the selected image.')
                    );
                }

                // Use a white background when converting transparent images to JPEG.
                context.fillStyle = '#FFFFFF';
                context.fillRect(0, 0, width, height);
                context.drawImage(image, 0, 0, width, height);

                canvas.toBlob(
                    blob => {
                        URL.revokeObjectURL(imageUrl);

                        if (!blob) {
                            return reject(
                                new Error('Unable to compress the selected image.')
                            );
                        }

                        const compressedFile = new File(
                            [blob],
                            `${file.name.replace(/\.[^/.]+$/, '')}.jpg`,
                            {
                                type: 'image/jpeg',
                                lastModified: Date.now(),
                            }
                        );

                        resolve(compressedFile);
                    },
                    'image/jpeg',
                    JPEG_QUALITY
                );
            } catch (error) {
                URL.revokeObjectURL(imageUrl);
                reject(error);
            }
        };

        image.onerror = () => {
            URL.revokeObjectURL(imageUrl);
            reject(new Error('Unable to load the selected image.'));
        };

        image.src = imageUrl;
    });
};

export default compressImage;