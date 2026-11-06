jest.mock('../../models/MarketplaceItem');

jest.mock('../../middleware/asyncHandler', () => (handler) => handler);

jest.mock('../../utils/cloudinaryStorage', () => ({
    uploadImage: jest.fn(),
    deleteImage: jest.fn(),
}));

const MarketplaceItem = require('../../models/MarketplaceItem');
const {
    uploadImage,
    deleteImage,
} = require('../../utils/cloudinaryStorage');
const {
    createMarketplaceItem,
    getMarketplaceItems,
    getMarketplaceItem,
    updateMarketplaceItem,
    deleteMarketplaceItem,
} = require('../../controllers/marketplaceController');

describe('Marketplace Controller', () => {
    let req;
    let res;

    const sellerId = 'seller123';
    const otherSellerId = 'seller456';
    const itemId = 'item123';

    const image1 = 'https://res.cloudinary.com/test/image/upload/maize1.jpg';
    const image2 = 'https://res.cloudinary.com/test/image/upload/maize2.jpg';
    const image3 = 'https://res.cloudinary.com/test/image/upload/maize3.jpg';

    const publicId1 = 'roamagro/marketplace/maize1';
    const publicId2 = 'roamagro/marketplace/maize2';
    const publicId3 = 'roamagro/marketplace/maize3';

    const makeFile = (name = 'maize.jpg') => ({
        fieldname: 'images',
        originalname: name,
        mimetype: 'image/jpeg',
        buffer: Buffer.from('test-image'),
        size: 10,
    });

    const makeItem = (overrides = {}) => ({
        _id: itemId,
        title: 'Fresh Maize',
        description: 'Quality maize for sale',
        category: 'Crops',
        price: 50000,
        unit: 'bag',
        location: 'Abuja',
        available: true,
        images: [],
        imagePublicIds: [],
        user: {
            toString: () => sellerId,
        },
        coordinates: {
            latitude: 9.0765,
            longitude: 7.3986,
        },
        createdAt: new Date('2026-01-01T10:00:00Z'),
        save: jest.fn().mockResolvedValue(true),
        deleteOne: jest.fn().mockResolvedValue(true),
        toObject: jest.fn(function () {
            return {
                ...this,
                user: this.user,
            };
        }),
        ...overrides,
    });

    const makeQuery = (result) => ({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        then: (resolve, reject) =>
            Promise.resolve(result).then(resolve, reject),
    });

    const makeResponse = () => {
        const response = {
            status: jest.fn(),
            json: jest.fn(),
        };

        response.status.mockReturnValue(response);
        response.json.mockReturnValue(response);

        return response;
    };

    const expectError = async (controller, message, statusCode) => {
        await expect(controller(req, res)).rejects.toMatchObject({
            message,
            statusCode,
        });

        expect(res.json).not.toHaveBeenCalled();
    };

    const mockUploadedImages = (...images) => {
        images.forEach((image) => {
            uploadImage.mockResolvedValueOnce(image);
        });
    };

    const mockSuccessfulUpdate = (item, populatedItem = item) => {
        MarketplaceItem.findById
            .mockResolvedValueOnce(item)
            .mockReturnValueOnce(makeQuery(populatedItem));
    };

    beforeEach(() => {
        jest.clearAllMocks();

        req = {
            body: {
                title: 'Fresh Maize',
                description: 'Quality maize for sale',
                category: 'Crops',
                price: 50000,
                unit: 'bag',
                location: 'Abuja',
            },
            params: {
                id: itemId,
            },
            query: {},
            user: {
                _id: sellerId,
            },
        };

        res = makeResponse();

        uploadImage.mockResolvedValue({
            url: image1,
            publicId: publicId1,
        });

        deleteImage.mockResolvedValue({
            result: 'ok',
        });
    });

    describe('createMarketplaceItem', () => {
        test('creates a listing for the authenticated user and returns the populated listing', async () => {
            const item = makeItem();

            const populatedItem = {
                ...item,
                user: {
                    _id: sellerId,
                    name: 'Seller',
                },
            };

            MarketplaceItem.create.mockResolvedValue(item);
            MarketplaceItem.findById.mockReturnValue(
                makeQuery(populatedItem)
            );

            await createMarketplaceItem(req, res);

            expect(MarketplaceItem.create).toHaveBeenCalledWith({
                ...req.body,
                images: [],
                imagePublicIds: [],
                user: sellerId,
            });

            expect(MarketplaceItem.findById).toHaveBeenCalledWith(
                itemId
            );

            expect(uploadImage).not.toHaveBeenCalled();

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Marketplace listing created successfully.',
                data: populatedItem,
            });
        });

        test('uses the authenticated user ID instead of a user ID supplied in the body', async () => {
            req.body.user = otherSellerId;

            const item = makeItem();

            MarketplaceItem.create.mockResolvedValue(item);
            MarketplaceItem.findById.mockReturnValue(makeQuery(item));

            await createMarketplaceItem(req, res);

            expect(MarketplaceItem.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    user: sellerId,
                    images: [],
                    imagePublicIds: [],
                })
            );
        });

        test('uploads one image to Cloudinary when creating a listing', async () => {
            const file = makeFile();

            req.files = [file];

            const item = makeItem({
                images: [image1],
                imagePublicIds: [publicId1],
            });

            MarketplaceItem.create.mockResolvedValue(item);
            MarketplaceItem.findById.mockReturnValue(makeQuery(item));

            await createMarketplaceItem(req, res);

            expect(uploadImage).toHaveBeenCalledTimes(1);
            expect(uploadImage).toHaveBeenCalledWith(
                file,
                'roamagro/marketplace'
            );

            expect(MarketplaceItem.create).toHaveBeenCalledWith({
                ...req.body,
                images: [image1],
                imagePublicIds: [publicId1],
                user: sellerId,
            });

            expect(res.status).toHaveBeenCalledWith(201);
        });

        test('uploads multiple images and preserves their order', async () => {
            const files = [
                makeFile('maize1.jpg'),
                makeFile('maize2.jpg'),
                makeFile('maize3.jpg'),
            ];

            req.files = files;

            mockUploadedImages(
                { url: image1, publicId: publicId1 },
                { url: image2, publicId: publicId2 },
                { url: image3, publicId: publicId3 }
            );

            const item = makeItem({
                images: [image1, image2, image3],
                imagePublicIds: [publicId1, publicId2, publicId3],
            });

            MarketplaceItem.create.mockResolvedValue(item);
            MarketplaceItem.findById.mockReturnValue(makeQuery(item));

            await createMarketplaceItem(req, res);

            expect(uploadImage).toHaveBeenCalledTimes(3);

            files.forEach((file, index) => {
                expect(uploadImage).toHaveBeenNthCalledWith(
                    index + 1,
                    file,
                    'roamagro/marketplace'
                );
            });

            expect(MarketplaceItem.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    images: [image1, image2, image3],
                    imagePublicIds: [
                        publicId1,
                        publicId2,
                        publicId3,
                    ],
                })
            );
        });

        test('supports existing image URLs supplied as a JSON array', async () => {
            req.body.images = JSON.stringify([image1, image2]);

            const item = makeItem({
                images: [image1, image2],
                imagePublicIds: ['', ''],
            });

            MarketplaceItem.create.mockResolvedValue(item);
            MarketplaceItem.findById.mockReturnValue(makeQuery(item));

            await createMarketplaceItem(req, res);

            expect(MarketplaceItem.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    images: [image1, image2],
                    imagePublicIds: ['', ''],
                })
            );

            expect(uploadImage).not.toHaveBeenCalled();
        });

        test('rejects more than three uploaded images', async () => {
            req.files = [
                makeFile('1.jpg'),
                makeFile('2.jpg'),
                makeFile('3.jpg'),
                makeFile('4.jpg'),
            ];

            await expectError(
                createMarketplaceItem,
                'A marketplace listing can have a maximum of 3 images.',
                400
            );

            expect(uploadImage).not.toHaveBeenCalled();
            expect(MarketplaceItem.create).not.toHaveBeenCalled();
        });

        test('rejects more than three total images', async () => {
            req.body.images = [image1, image2];
            req.files = [
                makeFile('3.jpg'),
                makeFile('4.jpg'),
            ];

            await expectError(
                createMarketplaceItem,
                'A marketplace listing can have a maximum of 3 images.',
                400
            );

            expect(uploadImage).not.toHaveBeenCalled();
        });

        test('rejects malformed image JSON', async () => {
            req.body.images = '[invalid-json';

            await expectError(
                createMarketplaceItem,
                'Listing images contain invalid data.',
                400
            );

            expect(MarketplaceItem.create).not.toHaveBeenCalled();
        });

        test('rejects duplicate image URLs', async () => {
            req.body.images = [image1, image1];

            await expectError(
                createMarketplaceItem,
                'Duplicate listing images are not allowed.',
                400
            );

            expect(MarketplaceItem.create).not.toHaveBeenCalled();
        });

        test('rejects invalid image array values', async () => {
            req.body.images = [image1, 123];

            await expectError(
                createMarketplaceItem,
                'A listing can contain up to 3 valid images.',
                400
            );
        });

        test('cleans up previous uploads when a later upload fails', async () => {
            req.files = [
                makeFile('first.jpg'),
                makeFile('second.jpg'),
            ];

            uploadImage
                .mockReset()
                .mockResolvedValueOnce({
                    url: image1,
                    publicId: publicId1,
                })
                .mockRejectedValueOnce(
                    new Error('Second upload failed')
                );

            await expect(
                createMarketplaceItem(req, res)
            ).rejects.toThrow('Second upload failed');

            expect(deleteImage).toHaveBeenCalledWith(publicId1);
            expect(MarketplaceItem.create).not.toHaveBeenCalled();
        });

        test('cleans up uploaded images when listing creation fails', async () => {
            req.files = [makeFile()];

            MarketplaceItem.create.mockRejectedValue(
                new Error('Database creation failed')
            );

            await expect(
                createMarketplaceItem(req, res)
            ).rejects.toThrow('Database creation failed');

            expect(deleteImage).toHaveBeenCalledWith(publicId1);
            expect(res.json).not.toHaveBeenCalled();
        });

        test('preserves the database error when image cleanup fails', async () => {
            req.files = [makeFile()];

            MarketplaceItem.create.mockRejectedValue(
                new Error('Database creation failed')
            );

            deleteImage.mockRejectedValue(
                new Error('Cloudinary cleanup failed')
            );

            await expect(
                createMarketplaceItem(req, res)
            ).rejects.toThrow('Database creation failed');

            expect(deleteImage).toHaveBeenCalledWith(publicId1);
        });

        test('parses coordinates supplied as JSON', async () => {
            req.body.coordinates = JSON.stringify({
                latitude: '9.0765',
                longitude: '7.3986',
            });

            const item = makeItem();

            MarketplaceItem.create.mockResolvedValue(item);
            MarketplaceItem.findById.mockReturnValue(makeQuery(item));

            await createMarketplaceItem(req, res);

            expect(MarketplaceItem.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    coordinates: {
                        latitude: 9.0765,
                        longitude: 7.3986,
                    },
                })
            );
        });

        test('rejects invalid coordinates', async () => {
            req.body.coordinates = {
                latitude: 100,
                longitude: 7.3986,
            };

            await expectError(
                createMarketplaceItem,
                'Listing coordinates are invalid.',
                400
            );

            expect(MarketplaceItem.create).not.toHaveBeenCalled();
        });
    });

    describe('getMarketplaceItems', () => {
        test('returns paginated listings with default query settings', async () => {
            const items = [makeItem()];
            const query = makeQuery(items);

            MarketplaceItem.find.mockReturnValue(query);
            MarketplaceItem.countDocuments.mockResolvedValue(1);

            await getMarketplaceItems(req, res);

            expect(MarketplaceItem.find).toHaveBeenCalledWith({});
            expect(query.sort).toHaveBeenCalledWith({
                createdAt: -1,
                _id: -1,
            });
            expect(query.skip).toHaveBeenCalledWith(0);
            expect(query.limit).toHaveBeenCalledWith(20);

            expect(MarketplaceItem.countDocuments).toHaveBeenCalledWith(
                {}
            );

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                count: 1,
                total: 1,
                page: 1,
                limit: 20,
                totalPages: 1,
                hasMore: false,
                sortedByDistance: false,
                data: items,
            });
        });

        test('applies the search term to all supported listing fields', async () => {
            req.query.search = ' maize ';

            MarketplaceItem.find.mockReturnValue(makeQuery([]));
            MarketplaceItem.countDocuments.mockResolvedValue(0);

            await getMarketplaceItems(req, res);

            const filter = MarketplaceItem.find.mock.calls[0][0];

            expect(filter.$or).toEqual([
                {
                    title: {
                        $regex: 'maize',
                        $options: 'i',
                    },
                },
                {
                    description: {
                        $regex: 'maize',
                        $options: 'i',
                    },
                },
                {
                    location: {
                        $regex: 'maize',
                        $options: 'i',
                    },
                },
                {
                    category: {
                        $regex: 'maize',
                        $options: 'i',
                    },
                },
                {
                    unit: {
                        $regex: 'maize',
                        $options: 'i',
                    },
                },
            ]);
        });

        test('filters listings by category', async () => {
            req.query.category = 'Livestock';

            MarketplaceItem.find.mockReturnValue(makeQuery([]));
            MarketplaceItem.countDocuments.mockResolvedValue(0);

            await getMarketplaceItems(req, res);

            expect(MarketplaceItem.find).toHaveBeenCalledWith({
                category: 'Livestock',
            });
        });

        test('does not add a category filter when category is All', async () => {
            req.query.category = 'All';

            MarketplaceItem.find.mockReturnValue(makeQuery([]));
            MarketplaceItem.countDocuments.mockResolvedValue(0);

            await getMarketplaceItems(req, res);

            expect(MarketplaceItem.find).toHaveBeenCalledWith({});
        });

        test('filters available listings', async () => {
            req.query.availability = 'Available';

            MarketplaceItem.find.mockReturnValue(makeQuery([]));
            MarketplaceItem.countDocuments.mockResolvedValue(0);

            await getMarketplaceItems(req, res);

            expect(MarketplaceItem.find).toHaveBeenCalledWith({
                available: true,
            });
        });

        test('filters sold listings', async () => {
            req.query.availability = 'Sold';

            MarketplaceItem.find.mockReturnValue(makeQuery([]));
            MarketplaceItem.countDocuments.mockResolvedValue(0);

            await getMarketplaceItems(req, res);

            expect(MarketplaceItem.find).toHaveBeenCalledWith({
                available: false,
            });
        });

        test('filters listings belonging to the authenticated user when mine is true', async () => {
            req.query.mine = 'true';

            MarketplaceItem.find.mockReturnValue(makeQuery([]));
            MarketplaceItem.countDocuments.mockResolvedValue(0);

            await getMarketplaceItems(req, res);

            expect(MarketplaceItem.find).toHaveBeenCalledWith({
                user: sellerId,
            });
        });

        test('combines category, availability and ownership filters', async () => {
            req.query.category = 'Crops';
            req.query.availability = 'Available';
            req.query.mine = 'true';

            MarketplaceItem.find.mockReturnValue(makeQuery([]));
            MarketplaceItem.countDocuments.mockResolvedValue(0);

            await getMarketplaceItems(req, res);

            expect(MarketplaceItem.find).toHaveBeenCalledWith({
                category: 'Crops',
                available: true,
                user: sellerId,
            });
        });

        test('normalizes invalid page and limit values and caps the limit at 50', async () => {
            req.query.page = '-2';
            req.query.limit = '100';

            const query = makeQuery([]);

            MarketplaceItem.find.mockReturnValue(query);
            MarketplaceItem.countDocuments.mockResolvedValue(0);

            await getMarketplaceItems(req, res);

            expect(query.skip).toHaveBeenCalledWith(0);
            expect(query.limit).toHaveBeenCalledWith(50);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    page: 1,
                    limit: 50,
                    totalPages: 0,
                    hasMore: false,
                })
            );
        });

        test('calculates the correct offset for later pages', async () => {
            req.query.page = '3';
            req.query.limit = '10';

            const query = makeQuery([]);

            MarketplaceItem.find.mockReturnValue(query);
            MarketplaceItem.countDocuments.mockResolvedValue(25);

            await getMarketplaceItems(req, res);

            expect(query.skip).toHaveBeenCalledWith(20);
            expect(query.limit).toHaveBeenCalledWith(10);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    page: 3,
                    limit: 10,
                    total: 25,
                    totalPages: 3,
                    hasMore: false,
                })
            );
        });

        test('reports hasMore when additional pages remain', async () => {
            req.query.page = '1';
            req.query.limit = '10';

            MarketplaceItem.find.mockReturnValue(makeQuery([]));
            MarketplaceItem.countDocuments.mockResolvedValue(25);

            await getMarketplaceItems(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    totalPages: 3,
                    hasMore: true,
                })
            );
        });

        test('returns zero total pages when there are no listings', async () => {
            MarketplaceItem.find.mockReturnValue(makeQuery([]));
            MarketplaceItem.countDocuments.mockResolvedValue(0);

            await getMarketplaceItems(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    count: 0,
                    total: 0,
                    totalPages: 0,
                    hasMore: false,
                })
            );
        });

        test('sorts listings by distance when valid user coordinates are supplied', async () => {
            req.query.userLatitude = '9.0765';
            req.query.userLongitude = '7.3986';

            const nearby = makeItem({
                _id: 'nearby',
                coordinates: {
                    latitude: 9.08,
                    longitude: 7.4,
                },
            });

            const farAway = makeItem({
                _id: 'faraway',
                coordinates: {
                    latitude: 10,
                    longitude: 8,
                },
            });

            const noCoordinates = makeItem({
                _id: 'unknown',
                coordinates: undefined,
            });

            MarketplaceItem.find.mockReturnValue(
                makeQuery([farAway, noCoordinates, nearby])
            );

            await getMarketplaceItems(req, res);

            const payload = res.json.mock.calls[0][0];

            expect(payload.sortedByDistance).toBe(true);
            expect(payload.total).toBe(3);
            expect(payload.data.map((item) => item._id)).toEqual([
                'nearby',
                'faraway',
                'unknown',
            ]);

            expect(payload.data[0].distanceKm).toEqual(
                expect.any(Number)
            );
            expect(payload.data[1].distanceKm).toEqual(
                expect.any(Number)
            );
            expect(payload.data[2].distanceKm).toBeNull();

            expect(MarketplaceItem.countDocuments).not.toHaveBeenCalled();
        });

        test('ignores invalid user coordinates and uses normal pagination', async () => {
            req.query.userLatitude = '100';
            req.query.userLongitude = '7.3986';

            MarketplaceItem.find.mockReturnValue(makeQuery([]));
            MarketplaceItem.countDocuments.mockResolvedValue(0);

            await getMarketplaceItems(req, res);

            expect(MarketplaceItem.countDocuments).toHaveBeenCalled();

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    sortedByDistance: false,
                })
            );
        });

        test('does not use distance sorting when only one user coordinate is provided', async () => {
            req.query.userLatitude = '9.0765';

            MarketplaceItem.find.mockReturnValue(makeQuery([]));
            MarketplaceItem.countDocuments.mockResolvedValue(0);

            await getMarketplaceItems(req, res);

            expect(MarketplaceItem.countDocuments).toHaveBeenCalled();

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    sortedByDistance: false,
                })
            );
        });

        test('does not calculate distance for listings with invalid coordinates', async () => {
            req.query.userLatitude = '9.0765';
            req.query.userLongitude = '7.3986';

            const invalidCoordinates = makeItem({
                coordinates: {
                    latitude: 100,
                    longitude: 7.3986,
                },
            });

            MarketplaceItem.find.mockReturnValue(
                makeQuery([invalidCoordinates])
            );

            await getMarketplaceItems(req, res);

            const payload = res.json.mock.calls[0][0];

            expect(payload.data[0].distanceKm).toBeNull();
        });

        test('populates seller information when returning listings', async () => {
            const query = makeQuery([]);

            MarketplaceItem.find.mockReturnValue(query);
            MarketplaceItem.countDocuments.mockResolvedValue(0);

            await getMarketplaceItems(req, res);

            expect(query.populate).toHaveBeenCalledWith(
                'user',
                'name phone location state profilePhoto role bio'
            );
        });
    });

    describe('getMarketplaceItem', () => {
        test('returns a listing by ID with seller information populated', async () => {
            const item = makeItem();
            const query = makeQuery(item);

            MarketplaceItem.findById.mockReturnValue(query);

            await getMarketplaceItem(req, res);

            expect(MarketplaceItem.findById).toHaveBeenCalledWith(
                itemId
            );

            expect(query.populate).toHaveBeenCalledWith(
                'user',
                'name phone location state profilePhoto role bio'
            );

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: item,
            });
        });

        test('returns 404 when the listing does not exist', async () => {
            MarketplaceItem.findById.mockReturnValue(makeQuery(null));

            await getMarketplaceItem(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Marketplace listing not found.',
            });
        });
    });

    describe('updateMarketplaceItem', () => {
        test('updates an item owned by the authenticated user', async () => {
            const item = makeItem();

            const updatedItem = {
                ...item,
                title: 'Updated Maize',
            };

            mockSuccessfulUpdate(item, updatedItem);

            req.body = {
                title: 'Updated Maize',
            };

            await updateMarketplaceItem(req, res);

            expect(item.title).toBe('Updated Maize');
            expect(item.save).toHaveBeenCalledTimes(1);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Marketplace listing updated successfully.',
                data: updatedItem,
            });
        });

        test('returns 404 when the listing does not exist', async () => {
            MarketplaceItem.findById.mockResolvedValue(null);

            await updateMarketplaceItem(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Marketplace listing not found.',
            });
        });

        test('prevents a user from updating another seller listing', async () => {
            const item = makeItem({
                user: {
                    toString: () => otherSellerId,
                },
            });

            MarketplaceItem.findById.mockResolvedValue(item);

            await updateMarketplaceItem(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'You can only update your own listing.',
            });

            expect(item.save).not.toHaveBeenCalled();
            expect(uploadImage).not.toHaveBeenCalled();
        });

        test('compares owner IDs as strings', async () => {
            const item = makeItem({
                user: {
                    toString: () => sellerId,
                },
            });

            mockSuccessfulUpdate(item);

            await updateMarketplaceItem(req, res);

            expect(item.save).toHaveBeenCalledTimes(1);
            expect(res.status).toHaveBeenCalledWith(200);
        });

        test('retains existing images when updating listing details', async () => {
            const item = makeItem({
                images: [image1, image2],
                imagePublicIds: [publicId1, publicId2],
            });

            mockSuccessfulUpdate(item);

            req.body = {
                title: 'Updated Maize',
            };

            await updateMarketplaceItem(req, res);

            expect(item.images).toEqual([image1, image2]);
            expect(item.imagePublicIds).toEqual([
                publicId1,
                publicId2,
            ]);

            expect(deleteImage).not.toHaveBeenCalled();
            expect(uploadImage).not.toHaveBeenCalled();
            expect(item.save).toHaveBeenCalledTimes(1);
        });

        test('retains selected images and removes unselected images', async () => {
            const item = makeItem({
                images: [image1, image2, image3],
                imagePublicIds: [
                    publicId1,
                    publicId2,
                    publicId3,
                ],
            });

            mockSuccessfulUpdate(item);

            req.body = {
                existingImages: JSON.stringify([
                    image1,
                    image3,
                ]),
            };

            await updateMarketplaceItem(req, res);

            expect(item.images).toEqual([image1, image3]);
            expect(item.imagePublicIds).toEqual([
                publicId1,
                publicId3,
            ]);

            expect(deleteImage).toHaveBeenCalledTimes(1);
            expect(deleteImage).toHaveBeenCalledWith(publicId2);

            expect(res.status).toHaveBeenCalledWith(200);
        });

        test('removes all existing images when an empty array is supplied', async () => {
            const item = makeItem({
                images: [image1, image2],
                imagePublicIds: [publicId1, publicId2],
            });

            mockSuccessfulUpdate(item);

            req.body = {
                existingImages: '[]',
            };

            await updateMarketplaceItem(req, res);

            expect(item.images).toEqual([]);
            expect(item.imagePublicIds).toEqual([]);

            expect(deleteImage).toHaveBeenCalledTimes(2);
            expect(deleteImage).toHaveBeenCalledWith(publicId1);
            expect(deleteImage).toHaveBeenCalledWith(publicId2);
        });

        test('adds a new Cloudinary image while retaining existing images', async () => {
            const item = makeItem({
                images: [image1],
                imagePublicIds: [publicId1],
            });

            const file = makeFile('new.jpg');

            req.files = [file];
            req.body = {
                existingImages: [image1],
            };

            uploadImage.mockResolvedValue({
                url: image2,
                publicId: publicId2,
            });

            mockSuccessfulUpdate(item);

            await updateMarketplaceItem(req, res);

            expect(uploadImage).toHaveBeenCalledWith(
                file,
                'roamagro/marketplace'
            );

            expect(item.images).toEqual([image1, image2]);
            expect(item.imagePublicIds).toEqual([
                publicId1,
                publicId2,
            ]);

            expect(deleteImage).not.toHaveBeenCalled();
            expect(item.save).toHaveBeenCalledTimes(1);
        });

        test('replaces an existing image with a newly uploaded image', async () => {
            const item = makeItem({
                images: [image1],
                imagePublicIds: [publicId1],
            });

            req.body = {
                existingImages: [],
            };

            req.files = [makeFile('replacement.jpg')];

            uploadImage.mockResolvedValue({
                url: image2,
                publicId: publicId2,
            });

            mockSuccessfulUpdate(item);

            await updateMarketplaceItem(req, res);

            expect(item.images).toEqual([image2]);
            expect(item.imagePublicIds).toEqual([publicId2]);

            expect(deleteImage).toHaveBeenCalledWith(publicId1);
            expect(deleteImage).not.toHaveBeenCalledWith(publicId2);

            expect(res.status).toHaveBeenCalledWith(200);
        });

        test('rejects retaining an image that does not belong to the listing', async () => {
            const item = makeItem({
                images: [image1],
                imagePublicIds: [publicId1],
            });

            MarketplaceItem.findById.mockResolvedValue(item);

            req.body = {
                existingImages: [image2],
            };

            await expectError(
                updateMarketplaceItem,
                'One or more retained images do not belong to this listing.',
                400
            );

            expect(item.save).not.toHaveBeenCalled();
            expect(uploadImage).not.toHaveBeenCalled();
        });

        test('rejects exceeding the image limit during an update', async () => {
            const item = makeItem({
                images: [image1, image2],
                imagePublicIds: [publicId1, publicId2],
            });

            MarketplaceItem.findById.mockResolvedValue(item);

            req.body = {
                existingImages: [image1, image2],
            };

            req.files = [
                makeFile('third.jpg'),
                makeFile('fourth.jpg'),
            ];

            await expectError(
                updateMarketplaceItem,
                'A marketplace listing can have a maximum of 3 images.',
                400
            );

            expect(uploadImage).not.toHaveBeenCalled();
            expect(item.save).not.toHaveBeenCalled();
        });

        test('rejects duplicate retained images', async () => {
            const item = makeItem({
                images: [image1, image2],
                imagePublicIds: [publicId1, publicId2],
            });

            MarketplaceItem.findById.mockResolvedValue(item);

            req.body = {
                existingImages: [image1, image1],
            };

            await expectError(
                updateMarketplaceItem,
                'Duplicate listing images are not allowed.',
                400
            );

            expect(item.save).not.toHaveBeenCalled();
        });

        test('cleans up new uploads when saving the listing fails', async () => {
            const item = makeItem({
                images: [image1],
                imagePublicIds: [publicId1],
                save: jest.fn().mockRejectedValue(
                    new Error('Database save failed')
                ),
            });

            MarketplaceItem.findById.mockResolvedValue(item);

            req.body = {
                existingImages: [image1],
            };

            req.files = [makeFile('new.jpg')];

            uploadImage.mockResolvedValue({
                url: image2,
                publicId: publicId2,
            });

            await expect(
                updateMarketplaceItem(req, res)
            ).rejects.toThrow('Database save failed');

            expect(deleteImage).toHaveBeenCalledWith(publicId2);
            expect(deleteImage).not.toHaveBeenCalledWith(publicId1);
            expect(res.json).not.toHaveBeenCalled();
        });

        test('does not delete removed images when saving fails', async () => {
            const item = makeItem({
                images: [image1],
                imagePublicIds: [publicId1],
                save: jest.fn().mockRejectedValue(
                    new Error('Database save failed')
                ),
            });

            MarketplaceItem.findById.mockResolvedValue(item);

            req.body = {
                existingImages: [],
            };

            await expect(
                updateMarketplaceItem(req, res)
            ).rejects.toThrow('Database save failed');

            expect(deleteImage).not.toHaveBeenCalled();
        });

        test('continues successfully if Cloudinary deletion fails after saving', async () => {
            const item = makeItem({
                images: [image1],
                imagePublicIds: [publicId1],
            });

            mockSuccessfulUpdate(item);

            req.body = {
                existingImages: [],
            };

            deleteImage.mockRejectedValue(
                new Error('Cloudinary deletion failed')
            );

            await updateMarketplaceItem(req, res);

            expect(item.save).toHaveBeenCalledTimes(1);
            expect(deleteImage).toHaveBeenCalledWith(publicId1);
            expect(res.status).toHaveBeenCalledWith(200);
        });

        test('does not delete images without a Cloudinary public ID', async () => {
            const item = makeItem({
                images: [image1],
                imagePublicIds: [''],
            });

            mockSuccessfulUpdate(item);

            req.body = {
                existingImages: [],
            };

            await updateMarketplaceItem(req, res);

            expect(item.images).toEqual([]);
            expect(deleteImage).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
        });

        test('rejects invalid coordinate updates before uploading images', async () => {
            const item = makeItem();

            MarketplaceItem.findById.mockResolvedValue(item);

            req.body = {
                coordinates: '{"latitude":',
            };

            req.files = [makeFile()];

            await expectError(
                updateMarketplaceItem,
                'Listing coordinates contain invalid data.',
                400
            );

            expect(uploadImage).not.toHaveBeenCalled();
            expect(item.save).not.toHaveBeenCalled();
        });
    });

    describe('deleteMarketplaceItem', () => {
        test('deletes a listing owned by the authenticated user', async () => {
            const item = makeItem();

            MarketplaceItem.findById.mockResolvedValue(item);

            await deleteMarketplaceItem(req, res);

            expect(item.deleteOne).toHaveBeenCalledTimes(1);
            expect(deleteImage).not.toHaveBeenCalled();

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Marketplace listing deleted successfully.',
            });
        });

        test('deletes Cloudinary images after deleting a listing', async () => {
            const item = makeItem({
                images: [image1, image2],
                imagePublicIds: [publicId1, publicId2],
            });

            MarketplaceItem.findById.mockResolvedValue(item);

            await deleteMarketplaceItem(req, res);

            expect(item.deleteOne).toHaveBeenCalledTimes(1);

            expect(deleteImage).toHaveBeenCalledTimes(2);
            expect(deleteImage).toHaveBeenCalledWith(publicId1);
            expect(deleteImage).toHaveBeenCalledWith(publicId2);

            expect(res.status).toHaveBeenCalledWith(200);
        });

        test('does not delete duplicate Cloudinary public IDs twice', async () => {
            const item = makeItem({
                images: [image1, image2],
                imagePublicIds: [publicId1, publicId1],
            });

            MarketplaceItem.findById.mockResolvedValue(item);

            await deleteMarketplaceItem(req, res);

            expect(deleteImage).toHaveBeenCalledTimes(1);
            expect(deleteImage).toHaveBeenCalledWith(publicId1);
        });

        test('ignores empty public IDs when deleting a listing', async () => {
            const item = makeItem({
                images: [image1, image2],
                imagePublicIds: ['', publicId2],
            });

            MarketplaceItem.findById.mockResolvedValue(item);

            await deleteMarketplaceItem(req, res);

            expect(deleteImage).toHaveBeenCalledTimes(1);
            expect(deleteImage).toHaveBeenCalledWith(publicId2);
        });

        test('does not delete Cloudinary images if database deletion fails', async () => {
            const item = makeItem({
                images: [image1],
                imagePublicIds: [publicId1],
                deleteOne: jest.fn().mockRejectedValue(
                    new Error('Database deletion failed')
                ),
            });

            MarketplaceItem.findById.mockResolvedValue(item);

            await expect(
                deleteMarketplaceItem(req, res)
            ).rejects.toThrow('Database deletion failed');

            expect(deleteImage).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
        });

        test('returns success even when Cloudinary deletion fails', async () => {
            const item = makeItem({
                images: [image1],
                imagePublicIds: [publicId1],
            });

            MarketplaceItem.findById.mockResolvedValue(item);

            deleteImage.mockRejectedValue(
                new Error('Cloudinary deletion failed')
            );

            await deleteMarketplaceItem(req, res);

            expect(item.deleteOne).toHaveBeenCalledTimes(1);
            expect(deleteImage).toHaveBeenCalledWith(publicId1);
            expect(res.status).toHaveBeenCalledWith(200);
        });

        test('returns 404 when the listing does not exist', async () => {
            MarketplaceItem.findById.mockResolvedValue(null);

            await deleteMarketplaceItem(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Marketplace listing not found.',
            });

            expect(deleteImage).not.toHaveBeenCalled();
        });

        test('prevents a user from deleting another seller listing', async () => {
            const item = makeItem({
                user: {
                    toString: () => otherSellerId,
                },
                images: [image1],
                imagePublicIds: [publicId1],
            });

            MarketplaceItem.findById.mockResolvedValue(item);

            await deleteMarketplaceItem(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'You can only delete your own listing.',
            });

            expect(item.deleteOne).not.toHaveBeenCalled();
            expect(deleteImage).not.toHaveBeenCalled();
        });
    });
});