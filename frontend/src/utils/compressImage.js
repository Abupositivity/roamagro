
const MAX_IMAGE_DIMENSION = 1200;
const MAX_IMAGE_FILE_SIZE = 12 * 1024 * 1024;
const JPEG_QUALITY = 0.75;

const compressImage = (file) =>
    new Promise((resolve, reject) => {
        if (!file || !file.type?.startsWith("image/")) {
            reject(new Error("Please select an image file."));
            return;
        }

        if (file.size > MAX_IMAGE_FILE_SIZE) {
            reject(
                new Error(
                    "Image is too large. Please choose an image smaller than 12 MB."
                )
            );
            return;
        }

        const objectUrl = URL.createObjectURL(file);
        const image = new Image();

        const cleanup = () => {
            URL.revokeObjectURL(objectUrl);
            image.onload = null;
            image.onerror = null;
        };

        image.onload = () => {
            try {
                const originalWidth = image.naturalWidth;
                const originalHeight = image.naturalHeight;

                if (!originalWidth || !originalHeight) {
                    throw new Error("Unable to process image.");
                }

                const scale = Math.min(
                    1,
                    MAX_IMAGE_DIMENSION /
                        Math.max(originalWidth, originalHeight)
                );

                const canvas = document.createElement("canvas");

                canvas.width = Math.max(
                    1,
                    Math.round(originalWidth * scale)
                );
                canvas.height = Math.max(
                    1,
                    Math.round(originalHeight * scale)
                );

                const context = canvas.getContext("2d");

                if (!context) {
                    throw new Error("Unable to process image.");
                }

                // Use a white background when converting transparent images to JPEG.
                context.fillStyle = "#FFFFFF";
                context.fillRect(0, 0, canvas.width, canvas.height);

                context.drawImage(
                    image,
                    0,
                    0,
                    canvas.width,
                    canvas.height
                );

                const compressedImage = canvas.toDataURL(
                    "image/jpeg",
                    JPEG_QUALITY
                );

                canvas.width = 0;
                canvas.height = 0;

                cleanup();
                resolve(compressedImage);
            } catch (error) {
                cleanup();
                reject(
                    error instanceof Error
                        ? error
                        : new Error("Unable to process image.")
                );
            }
        };

        image.onerror = () => {
            cleanup();
            reject(new Error("Unable to process image."));
        };

        image.src = objectUrl;
    });

export default compressImage;