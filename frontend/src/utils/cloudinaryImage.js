const THUMBNAIL_WIDTHS = [480, 720, 960];

const FEED_IMAGE_WIDTHS = [480, 800, 1200];

const getCloudinaryParts = source => {
    if (
        typeof source !== 'string' ||
        !source.trim()
    ) {
        return null;
    }

    try {
        const url = new URL(source);

        if (
            url.protocol !== 'https:' ||
            url.hostname !== 'res.cloudinary.com' ||
            url.search ||
            url.hash
        ) {
            return null;
        }

        const match = url.pathname.match(
            /^(\/[^/]+\/image\/upload\/)(v\d+\/.+)$/
        );

        if (!match) {
            return null;
        }

        return {
            origin: url.origin,
            prefix: match[1],
            resource: match[2],
        };
    } catch {
        return null;
    }
};

export const isTransformableCloudinaryImage = source =>
    Boolean(getCloudinaryParts(source));

export const buildCloudinaryImageUrl = (
    source,
    transformations
) => {
    const parts = getCloudinaryParts(source);

    if (!parts || !transformations) {
        return source;
    }

    return (
        `${parts.origin}${parts.prefix}` +
        `${transformations}/${parts.resource}`
    );
};

// Marketplace thumbnails.

export const getMarketplaceThumbnail = (
    source,
    width = 480
) => {
    const height = Math.round(width * 2 / 3);

    return buildCloudinaryImageUrl(
        source,
        `f_auto,q_auto,c_fill,g_center,w_${width},h_${height}`
    );
};

export const getMarketplaceSrcSet = source => {
    if (!isTransformableCloudinaryImage(source)) {
        return undefined;
    }

    return THUMBNAIL_WIDTHS.map(
        width =>
            `${getMarketplaceThumbnail(source, width)} ${width}w`
    ).join(', ');
};

// Full image previews.

export const getImagePreview = (
    source,
    maxWidth = 1200
) => {
    return buildCloudinaryImageUrl(
        source,
        `f_auto,q_auto,c_limit,w_${maxWidth},h_${maxWidth}`
    );
};

// Profile photos and avatars.

export const getAvatarImage = (
    source,
    size = 126
) => {
    return buildCloudinaryImageUrl(
        source,
        `f_auto,q_auto,c_fill,g_auto,w_${size},h_${size}`
    );
};

// General-purpose image optimization.

export const getResponsiveImage = (
    source,
    maxWidth = 800
) => {
    return buildCloudinaryImageUrl(
        source,
        `f_auto,q_auto,c_limit,w_${maxWidth}`
    );
};

// AgriFeed responsive images.

export const getFeedImage = (
    source,
    width = 800
) => {
    return buildCloudinaryImageUrl(
        source,
        `f_auto,q_auto,c_scale,w_${width}`
    );
};

export const getFeedImageSrcSet = source => {
    if (!isTransformableCloudinaryImage(source)) {
        return undefined;
    }

    return FEED_IMAGE_WIDTHS.map(
        width =>
            `${getFeedImage(source, width)} ${width}w`
    ).join(', ');
};