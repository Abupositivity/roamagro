const MAX_IMAGE_DIMENSION = 1200;
const MAX_FILE_SIZE = 12 * 1024 * 1024;
const JPEG_QUALITY = 0.75;

const SUPPORTED_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/heic',
    'image/heif',
    'image/avif',
    'image/bmp',
    'image/gif',
];

const MAX_IMAGE_SIZE_MB =
    MAX_FILE_SIZE / (1024 * 1024);

const formatFileSize = bytes => {
    if (!Number.isFinite(bytes) || bytes < 0) {
        return '0 MB';
    }

    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

// Detect supported image formats using MIME type,
// with an extension fallback when MIME is missing.
const getFileType = file => {
    const type = (file?.type || '').toLowerCase();

    if (SUPPORTED_TYPES.includes(type)) {
        return type;
    }

    const extension = (file?.name || '')
        .split('.')
        .pop()
        .toLowerCase();

    const extensionTypes = {
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        webp: 'image/webp',
        heic: 'image/heic',
        heif: 'image/heif',
        avif: 'image/avif',
        bmp: 'image/bmp',
        gif: 'image/gif',
    };

    // Do not let an extension override an
    // explicitly unsupported MIME type.
    return type || extensionTypes[extension] || '';
};

const validateImageFile = file => {
    if (
        !file ||
        typeof File === 'undefined' ||
        !(file instanceof File)
    ) {
        throw new Error(
            'Please select a valid image.'
        );
    }

    const fileType = getFileType(file);

    if (!SUPPORTED_TYPES.includes(fileType)) {
        throw new Error(
            'Unsupported image format. Please select a supported photo.'
        );
    }

    if (file.size === 0) {
        throw new Error(
            'The selected image is empty.'
        );
    }

    if (file.size > MAX_FILE_SIZE) {
        const fileName = file.name || 'Selected image';

        throw new Error(
            `${fileName} is ${formatFileSize(file.size)}. ` +
            `The maximum allowed image size is ` +
            `${MAX_IMAGE_SIZE_MB} MB. ` +
            'Please choose a smaller photo.'
        );
    }

    return fileType;
};

// Decode with createImageBitmap when available,
// falling back to HTMLImageElement.
const loadImage = async file => {
    if (typeof createImageBitmap === 'function') {
        try {
            const bitmap = await createImageBitmap(file);

            if (bitmap.width && bitmap.height) {
                return {
                    image: bitmap,
                    width: bitmap.width,
                    height: bitmap.height,
                    cleanup: () => bitmap.close(),
                };
            }

            bitmap.close();
        } catch {
            // Try HTMLImageElement instead.
        }
    }

    const imageUrl = URL.createObjectURL(file);

    try {
        const image = await new Promise(
            (resolve, reject) => {
                const img = new Image();

                img.onload = () => resolve(img);

                img.onerror = () => {
                    reject(
                        new Error(
                            'Unable to read this photo on your device. ' +
                            'Please select another photo or use JPG or PNG.'
                        )
                    );
                };

                img.src = imageUrl;
            }
        );

        return {
            image,
            width: image.naturalWidth,
            height: image.naturalHeight,
            cleanup: () => {
                URL.revokeObjectURL(imageUrl);
            },
        };
    } catch (error) {
        URL.revokeObjectURL(imageUrl);
        throw error;
    }
};

const canvasToBlob = canvas => {
    return new Promise((resolve, reject) => {
        canvas.toBlob(
            blob => {
                if (!blob) {
                    reject(
                        new Error(
                            'Unable to compress the selected image.'
                        )
                    );
                    return;
                }

                resolve(blob);
            },
            'image/jpeg',
            JPEG_QUALITY
        );
    });
};

const compressImage = async file => {
    const fileType = validateImageFile(file);

    // Avoid unnecessary JPEG processing.
    if (
        fileType === 'image/jpeg' &&
        file.size <= 1024 * 1024
    ) {
        return file;
    }

    const loaded = await loadImage(file);

    try {
        const { image, width, height } = loaded;

        if (
            !Number.isFinite(width) ||
            !Number.isFinite(height) ||
            width <= 0 ||
            height <= 0
        ) {
            throw new Error(
                'The selected image has invalid dimensions.'
            );
        }

        const needsResize =
            width > MAX_IMAGE_DIMENSION ||
            height > MAX_IMAGE_DIMENSION;

        if (
            !needsResize &&
            fileType === 'image/jpeg'
        ) {
            return file;
        }

        const scale = Math.min(
            1,
            MAX_IMAGE_DIMENSION / width,
            MAX_IMAGE_DIMENSION / height
        );

        const outputWidth = Math.max(
            1,
            Math.round(width * scale)
        );

        const outputHeight = Math.max(
            1,
            Math.round(height * scale)
        );

        const canvas =
            document.createElement('canvas');

        canvas.width = outputWidth;
        canvas.height = outputHeight;

        const context = canvas.getContext('2d');

        if (!context) {
            throw new Error(
                'Unable to process this image on your device.'
            );
        }

        // JPEG has no transparency.
        context.fillStyle = '#FFFFFF';

        context.fillRect(
            0,
            0,
            outputWidth,
            outputHeight
        );

        context.drawImage(
            image,
            0,
            0,
            outputWidth,
            outputHeight
        );

        const blob = await canvasToBlob(canvas);

        const originalName = file.name || 'photo';

        const baseName = originalName.replace(
            /\.[^/.]+$/,
            ''
        );

        return new File(
            [blob],
            `${baseName}.jpg`,
            {
                type: 'image/jpeg',
                lastModified: Date.now(),
            }
        );
    } catch (error) {
        if (error?.name === 'SecurityError') {
            throw new Error(
                'This image could not be processed securely.'
            );
        }

        if (
            error?.name === 'QuotaExceededError' ||
            error?.name === 'OutOfMemoryError'
        ) {
            throw new Error(
                'Your device does not have enough memory ' +
                'to process this photo. ' +
                'Please try a smaller image.'
            );
        }

        throw error;
    } finally {
        loaded.cleanup();
    }
};

export {
    MAX_IMAGE_DIMENSION,
    MAX_FILE_SIZE,
    MAX_IMAGE_SIZE_MB,
    JPEG_QUALITY,
    SUPPORTED_TYPES,
    getFileType,
    validateImageFile,
    formatFileSize,
};

export default compressImage;