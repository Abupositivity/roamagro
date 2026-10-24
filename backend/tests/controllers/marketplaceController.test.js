
const MarketplaceItem = require('../../models/MarketplaceItem');
const {
    createMarketplaceItem,
    getMarketplaceItems,
    getMarketplaceItem,
    updateMarketplaceItem,
    deleteMarketplaceItem,
} = require('../../controllers/marketplaceController');

jest.mock('../../models/MarketplaceItem');

jest.mock('../../middleware/asyncHandler', () => (handler) => handler);

describe('Marketplace Controller', () => {
    let req;
    let res;

    const sellerId = 'seller123';
    const otherSellerId = 'seller456';
    const itemId = 'item123';

    const makeItem = (overrides = {}) => ({
        _id: itemId,
        title: 'Fresh Maize',
        description: 'Quality maize for sale',
        category: 'Crops',
        price: 50000,
        unit: 'bag',
        location: 'Abuja',
        available: true,
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

    const makeQuery = (result) => {
        const query = {
            populate: jest.fn().mockReturnThis(),
            sort: jest.fn().mockReturnThis(),
            skip: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            then: (resolve, reject) =>
                Promise.resolve(result).then(resolve, reject),
        };

        return query;
    };

    const makeResponse = () => {
        const response = {
            status: jest.fn(),
            json: jest.fn(),
        };

        response.status.mockReturnValue(response);
        response.json.mockReturnValue(response);

        return response;
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
                user: sellerId,
            });

            expect(MarketplaceItem.findById).toHaveBeenCalledWith(
                itemId
            );

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
            MarketplaceItem.findById.mockReturnValue(
                makeQuery(item)
            );

            await createMarketplaceItem(req, res);

            expect(MarketplaceItem.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    user: sellerId,
                })
            );
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
            MarketplaceItem.findById.mockReturnValue(
                makeQuery(null)
            );

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

            MarketplaceItem.findById
                .mockResolvedValueOnce(item)
                .mockReturnValueOnce(makeQuery(updatedItem));

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
        });

        test('compares owner IDs as strings', async () => {
            const item = makeItem({
                user: {
                    toString: () => sellerId,
                },
            });

            MarketplaceItem.findById
                .mockResolvedValueOnce(item)
                .mockReturnValueOnce(makeQuery(item));

            await updateMarketplaceItem(req, res);

            expect(item.save).toHaveBeenCalledTimes(1);
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });

    describe('deleteMarketplaceItem', () => {
        test('deletes a listing owned by the authenticated user', async () => {
            const item = makeItem();
            MarketplaceItem.findById.mockResolvedValue(item);

            await deleteMarketplaceItem(req, res);

            expect(item.deleteOne).toHaveBeenCalledTimes(1);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Marketplace listing deleted successfully.',
            });
        });

        test('returns 404 when the listing does not exist', async () => {
            MarketplaceItem.findById.mockResolvedValue(null);

            await deleteMarketplaceItem(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Marketplace listing not found.',
            });
        });

        test('prevents a user from deleting another seller listing', async () => {
            const item = makeItem({
                user: {
                    toString: () => otherSellerId,
                },
            });

            MarketplaceItem.findById.mockResolvedValue(item);

            await deleteMarketplaceItem(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'You can only delete your own listing.',
            });

            expect(item.deleteOne).not.toHaveBeenCalled();
        });
    });
});