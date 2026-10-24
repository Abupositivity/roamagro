const mongoose = require('mongoose');
const User = require('../../models/User');
const Connection = require('../../models/Connection');
const MarketplaceItem = require('../../models/MarketplaceItem');
const CommunityPost = require('../../models/CommunityPost');
const Notification = require('../../models/Notification');
const connectionController = require('../../controllers/connectionController');

jest.mock('../../models/User', () => ({
    find: jest.fn(),
    findOne: jest.fn(),
    countDocuments: jest.fn()
}));

jest.mock('../../models/Connection', () => ({
    find: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    countDocuments: jest.fn(),
    findOneAndUpdate: jest.fn(),
    findOneAndDelete: jest.fn()
}));

jest.mock('../../models/MarketplaceItem', () => ({
    find: jest.fn(),
    countDocuments: jest.fn()
}));

jest.mock('../../models/CommunityPost', () => ({
    find: jest.fn(),
    countDocuments: jest.fn()
}));

jest.mock('../../models/Notification', () => ({
    create: jest.fn()
}));

const CURRENT_ID = '64b000000000000000000001';
const OTHER_ID = '64b000000000000000000002';
const THIRD_ID = '64b000000000000000000003';
const FOURTH_ID = '64b000000000000000000004';

const makeQuery = (result) => {
    const query = {};

    [
        'select',
        'sort',
        'skip',
        'limit',
        'lean',
        'populate'
    ].forEach((method) => {
        query[method] = jest.fn(() => query);
    });

    query.then = (resolve, reject) =>
        Promise.resolve(result).then(resolve, reject);

    query.catch = (reject) =>
        Promise.resolve(result).catch(reject);

    return query;
};

const makeRes = () => {
    const res = {
        status: jest.fn(),
        json: jest.fn()
    };

    res.status.mockReturnValue(res);
    res.json.mockReturnValue(res);

    return res;
};

const makeReq = ({
    userId = CURRENT_ID,
    user = {},
    params = {},
    query = {}
} = {}) => ({
    user: {
        _id: userId,
        name: 'Current User',
        role: 'farmer',
        state: 'Kaduna',
        lga: 'Zaria',
        ...user
    },
    params,
    query
});

const runController = async (handler, req) => {
    const res = makeRes();
    const next = jest.fn();

    await handler(req, res, next);

    return { res, next };
};

const expectError = async (
    handler,
    req,
    message,
    statusCode
) => {
    const { next } = await runController(handler, req);

    expect(next).toHaveBeenCalledTimes(1);

    const error = next.mock.calls[0][0];

    expect(error.message).toBe(message);
    expect(error.statusCode || error.status).toBe(statusCode);
};

beforeEach(() => {
    jest.clearAllMocks();
    Notification.create.mockResolvedValue({});
});

describe('connectionController search and discovery', () => {
    describe('searchUsers', () => {
        test('returns an empty result for a search shorter than two characters', async () => {
            const { res } = await runController(
                connectionController.searchUsers,
                makeReq({ query: { search: 'a' } })
            );

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    count: 0,
                    data: []
                })
            );

            expect(User.find).not.toHaveBeenCalled();
        });

        test('returns an empty result when no search term is supplied', async () => {
            const { res } = await runController(
                connectionController.searchUsers,
                makeReq()
            );

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json.mock.calls[0][0]).toMatchObject({
                success: true,
                count: 0,
                total: 0,
                page: 1,
                limit: 10,
                totalPages: 0,
                hasMore: false,
                data: []
            });

            expect(User.find).not.toHaveBeenCalled();
        });

        test('rejects search terms over 100 characters', async () => {
            await expectError(
                connectionController.searchUsers,
                makeReq({
                    query: { search: 'a'.repeat(101) }
                }),
                'Search term cannot exceed 100 characters.',
                400
            );
        });

        test('returns users and their connection statuses', async () => {
            const users = [
                { _id: OTHER_ID, name: 'Other' },
                { _id: THIRD_ID, name: 'Third' }
            ];

            User.find.mockReturnValue(makeQuery(users));
            User.countDocuments.mockResolvedValue(2);

            Connection.find.mockReturnValue(
                makeQuery([
                    {
                        _id: 'conn1',
                        requester: CURRENT_ID,
                        recipient: OTHER_ID,
                        status: 'pending'
                    },
                    {
                        _id: 'conn2',
                        requester: THIRD_ID,
                        recipient: CURRENT_ID,
                        status: 'accepted'
                    }
                ])
            );

            const { res } = await runController(
                connectionController.searchUsers,
                makeReq({
                    query: {
                        q: 'farmer',
                        page: '2',
                        limit: '5'
                    }
                })
            );

            const body = res.json.mock.calls[0][0];

            expect(res.status).toHaveBeenCalledWith(200);

            expect(body).toMatchObject({
                success: true,
                count: 2,
                total: 2,
                page: 2,
                limit: 5,
                totalPages: 1,
                hasMore: false
            });

            expect(body.data[0]).toMatchObject({
                _id: OTHER_ID,
                connectionStatus: 'outgoing_pending',
                connectionId: 'conn1'
            });

            expect(body.data[1]).toMatchObject({
                _id: THIRD_ID,
                connectionStatus: 'connected',
                connectionId: 'conn2'
            });
        });

        test('skips connection lookup when no users match', async () => {
            User.find.mockReturnValue(makeQuery([]));
            User.countDocuments.mockResolvedValue(0);

            const { res } = await runController(
                connectionController.searchUsers,
                makeReq({
                    query: { search: 'nobody' }
                })
            );

            expect(res.json.mock.calls[0][0].data).toEqual([]);
            expect(Connection.find).not.toHaveBeenCalled();
        });

        test('uses the search parameter aliases', async () => {
            User.find.mockReturnValue(makeQuery([]));
            User.countDocuments.mockResolvedValue(0);

            await runController(
                connectionController.searchUsers,
                makeReq({
                    query: { query: 'maize' }
                })
            );

            expect(User.find).toHaveBeenCalledWith(
                expect.objectContaining({
                    accountStatus: 'active'
                })
            );
        });
    });

    describe('discoverUsers', () => {
        test('excludes existing connections and ranks similar users', async () => {
            Connection.find.mockReturnValue(
                makeQuery([
                    {
                        requester: CURRENT_ID,
                        recipient: OTHER_ID
                    }
                ])
            );

            const users = [
                {
                    _id: THIRD_ID,
                    name: 'Similar',
                    state: 'Kaduna',
                    lga: 'Zaria',
                    role: 'farmer'
                },
                {
                    _id: FOURTH_ID,
                    name: 'Different',
                    state: 'Lagos',
                    lga: 'Ikeja',
                    role: 'buyer'
                }
            ];

            User.find.mockReturnValue(makeQuery(users));
            User.countDocuments.mockResolvedValue(2);

            const { res } = await runController(
                connectionController.discoverUsers,
                makeReq()
            );

            const body = res.json.mock.calls[0][0];

            expect(res.status).toHaveBeenCalledWith(200);
            expect(body.data).toHaveLength(2);

            expect(body.data[0]).toMatchObject({
                _id: THIRD_ID,
                connectionStatus: 'none',
                connectionId: null
            });

            expect(body.data[1]).toMatchObject({
                _id: FOURTH_ID,
                connectionStatus: 'none',
                connectionId: null
            });

            expect(User.find.mock.calls[0][0]._id.$nin).toEqual(
                expect.arrayContaining([
                    expect.any(mongoose.Types.ObjectId)
                ])
            );

            expect(body.data[0]).not.toHaveProperty(
                'recommendationScore'
            );
        });

        test('returns an empty discovery list when no users are available', async () => {
            Connection.find.mockReturnValue(makeQuery([]));
            User.find.mockReturnValue(makeQuery([]));
            User.countDocuments.mockResolvedValue(0);

            const { res } = await runController(
                connectionController.discoverUsers,
                makeReq()
            );

            expect(res.json.mock.calls[0][0]).toMatchObject({
                success: true,
                count: 0,
                total: 0,
                data: []
            });
        });
    });
});

describe('connectionController profiles and status', () => {
    describe('getPublicProfile', () => {
        test('rejects an invalid user ID', async () => {
            await expectError(
                connectionController.getPublicProfile,
                makeReq({
                    params: { userId: 'bad-id' }
                }),
                'Invalid user ID.',
                400
            );
        });

        test('returns own profile and aggregate statistics', async () => {
            User.findOne.mockReturnValue(
                makeQuery({
                    _id: CURRENT_ID,
                    name: 'Current User'
                })
            );

            Connection.countDocuments.mockResolvedValue(4);
            MarketplaceItem.countDocuments.mockResolvedValue(2);
            CommunityPost.countDocuments.mockResolvedValue(3);

            const { res } = await runController(
                connectionController.getPublicProfile,
                makeReq({
                    params: { userId: CURRENT_ID }
                })
            );

            expect(res.status).toHaveBeenCalledWith(200);

            expect(res.json.mock.calls[0][0]).toMatchObject({
                success: true,
                data: {
                    connectionStatus: 'self',
                    connectionId: null,
                    stats: {
                        connections: 4,
                        marketplaceListings: 2,
                        communityPosts: 3
                    }
                }
            });

            expect(Connection.findOne).not.toHaveBeenCalled();
            expect(MarketplaceItem.find).not.toHaveBeenCalled();
            expect(CommunityPost.find).not.toHaveBeenCalled();
        });

        test('returns not found for unavailable users', async () => {
            User.findOne.mockReturnValue(makeQuery(null));

            await expectError(
                connectionController.getPublicProfile,
                makeReq({
                    params: { userId: OTHER_ID }
                }),
                'User not found.',
                404
            );
        });

        test('returns another user and their pending connection status', async () => {
            User.findOne.mockReturnValue(
                makeQuery({
                    _id: OTHER_ID,
                    name: 'Other'
                })
            );

            Connection.findOne.mockResolvedValue({
                _id: 'conn1',
                requester: CURRENT_ID,
                recipient: OTHER_ID,
                status: 'pending'
            });

            Connection.countDocuments.mockResolvedValue(1);

            MarketplaceItem.find.mockReturnValue(
                makeQuery([{ _id: 'item1' }])
            );

            MarketplaceItem.countDocuments.mockResolvedValue(1);

            CommunityPost.find.mockReturnValue(
                makeQuery([{ _id: 'post1' }])
            );

            CommunityPost.countDocuments.mockResolvedValue(1);

            const { res } = await runController(
                connectionController.getPublicProfile,
                makeReq({
                    params: { userId: OTHER_ID }
                })
            );

            expect(res.json.mock.calls[0][0]).toMatchObject({
                success: true,
                data: {
                    connectionStatus: 'outgoing_pending',
                    connectionId: 'conn1',
                    marketplaceListings: [{ _id: 'item1' }],
                    communityPosts: [{ _id: 'post1' }],
                    stats: {
                        connections: 1,
                        marketplaceListings: 1,
                        communityPosts: 1
                    }
                }
            });
        });

        test('returns incoming pending status when the other user sent the request', async () => {
            User.findOne.mockReturnValue(
                makeQuery({
                    _id: OTHER_ID,
                    name: 'Other'
                })
            );

            Connection.findOne.mockResolvedValue({
                _id: 'conn2',
                requester: OTHER_ID,
                recipient: CURRENT_ID,
                status: 'pending'
            });

            Connection.countDocuments.mockResolvedValue(0);
            MarketplaceItem.find.mockReturnValue(makeQuery([]));
            MarketplaceItem.countDocuments.mockResolvedValue(0);
            CommunityPost.find.mockReturnValue(makeQuery([]));
            CommunityPost.countDocuments.mockResolvedValue(0);

            const { res } = await runController(
                connectionController.getPublicProfile,
                makeReq({
                    params: { userId: OTHER_ID }
                })
            );

            expect(res.json.mock.calls[0][0].data).toMatchObject({
                connectionStatus: 'incoming_pending',
                connectionId: 'conn2'
            });
        });
    });

    describe('getConnectionStatus', () => {
        test('returns self without querying the database', async () => {
            const { res } = await runController(
                connectionController.getConnectionStatus,
                makeReq({
                    params: { userId: CURRENT_ID }
                })
            );

            expect(res.json.mock.calls[0][0].data).toEqual({
                connectionStatus: 'self',
                connectionId: null
            });

            expect(User.findOne).not.toHaveBeenCalled();
            expect(Connection.findOne).not.toHaveBeenCalled();
        });

        test('rejects an invalid user ID', async () => {
            await expectError(
                connectionController.getConnectionStatus,
                makeReq({
                    params: { userId: 'invalid' }
                }),
                'Invalid user ID.',
                400
            );
        });

        test('returns none when no connection exists', async () => {
            User.findOne.mockResolvedValue({
                _id: OTHER_ID,
                accountStatus: 'active'
            });

            Connection.findOne.mockResolvedValue(null);

            const { res } = await runController(
                connectionController.getConnectionStatus,
                makeReq({
                    params: { userId: OTHER_ID }
                })
            );

            expect(res.json.mock.calls[0][0].data).toEqual({
                connectionStatus: 'none',
                connectionId: null
            });
        });

        test('rejects unavailable users', async () => {
            User.findOne.mockResolvedValue(null);

            await expectError(
                connectionController.getConnectionStatus,
                makeReq({
                    params: { userId: OTHER_ID }
                }),
                'User not found.',
                404
            );
        });

        test('returns connected status for an accepted connection', async () => {
            User.findOne.mockResolvedValue({
                _id: OTHER_ID,
                accountStatus: 'active'
            });

            Connection.findOne.mockResolvedValue({
                _id: 'conn1',
                requester: CURRENT_ID,
                recipient: OTHER_ID,
                status: 'accepted'
            });

            const { res } = await runController(
                connectionController.getConnectionStatus,
                makeReq({
                    params: { userId: OTHER_ID }
                })
            );

            expect(res.json.mock.calls[0][0].data).toEqual({
                connectionStatus: 'connected',
                connectionId: 'conn1'
            });
        });
    });
});

describe('connectionController request lifecycle', () => {
    describe('sendConnectionRequest', () => {
        test('rejects invalid IDs and self requests', async () => {
            await expectError(
                connectionController.sendConnectionRequest,
                makeReq({
                    params: { userId: 'bad' }
                }),
                'Invalid user ID.',
                400
            );

            await expectError(
                connectionController.sendConnectionRequest,
                makeReq({
                    params: { userId: CURRENT_ID }
                }),
                'You cannot send a connection request to yourself.',
                400
            );
        });

        test('rejects an unavailable recipient', async () => {
            User.findOne.mockResolvedValue(null);

            await expectError(
                connectionController.sendConnectionRequest,
                makeReq({
                    params: { userId: OTHER_ID }
                }),
                'User not found or account is unavailable.',
                404
            );
        });

        test.each([
            [
                {
                    requester: CURRENT_ID,
                    recipient: OTHER_ID,
                    status: 'accepted'
                },
                'You are already connected with this user.'
            ],
            [
                {
                    requester: CURRENT_ID,
                    recipient: OTHER_ID,
                    status: 'pending'
                },
                'You have already sent a connection request.'
            ],
            [
                {
                    requester: OTHER_ID,
                    recipient: CURRENT_ID,
                    status: 'pending'
                },
                'This user has already sent you a connection request.'
            ]
        ])(
            'rejects an existing relationship',
            async (existing, message) => {
                User.findOne.mockResolvedValue({
                    _id: OTHER_ID,
                    accountStatus: 'active'
                });

                Connection.findOne.mockResolvedValue(existing);

                await expectError(
                    connectionController.sendConnectionRequest,
                    makeReq({
                        params: { userId: OTHER_ID }
                    }),
                    message,
                    409
                );
            }
        );

        test('creates a pending request, notifies recipient, and returns the connection', async () => {
            User.findOne.mockResolvedValue({
                _id: OTHER_ID,
                accountStatus: 'active'
            });

            Connection.findOne.mockResolvedValue(null);
            Connection.create.mockResolvedValue({ _id: 'conn1' });

            Connection.findById.mockReturnValue(
                makeQuery({
                    _id: 'conn1',
                    status: 'pending'
                })
            );

            const { res } = await runController(
                connectionController.sendConnectionRequest,
                makeReq({
                    params: { userId: OTHER_ID }
                })
            );

            expect(Connection.create).toHaveBeenCalledWith({
                requester: CURRENT_ID,
                recipient: OTHER_ID,
                status: 'pending'
            });

            expect(Notification.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    sender: CURRENT_ID,
                    recipient: OTHER_ID,
                    type: 'connection_request',
                    link: '/connections'
                })
            );

            expect(res.status).toHaveBeenCalledWith(201);

            expect(res.json.mock.calls[0][0]).toMatchObject({
                success: true,
                message: 'Connection request sent successfully.',
                data: {
                    _id: 'conn1',
                    status: 'pending'
                }
            });
        });

        test('translates duplicate-key errors into a conflict', async () => {
            User.findOne.mockResolvedValue({
                _id: OTHER_ID,
                accountStatus: 'active'
            });

            Connection.findOne.mockResolvedValue(null);
            Connection.create.mockRejectedValue({ code: 11000 });

            await expectError(
                connectionController.sendConnectionRequest,
                makeReq({
                    params: { userId: OTHER_ID }
                }),
                'A connection request already exists.',
                409
            );
        });

        test('continues when notification creation fails', async () => {
            User.findOne.mockResolvedValue({
                _id: OTHER_ID,
                accountStatus: 'active'
            });

            Connection.findOne.mockResolvedValue(null);
            Connection.create.mockResolvedValue({ _id: 'conn1' });

            Connection.findById.mockReturnValue(
                makeQuery({ _id: 'conn1' })
            );

            Notification.create.mockRejectedValue(
                new Error('notification service unavailable')
            );

            const errorSpy = jest
                .spyOn(console, 'error')
                .mockImplementation(() => {});

            try {
                const { res, next } = await runController(
                    connectionController.sendConnectionRequest,
                    makeReq({
                        params: { userId: OTHER_ID }
                    })
                );

                expect(next).not.toHaveBeenCalled();
                expect(res.status).toHaveBeenCalledWith(201);
            } finally {
                errorSpy.mockRestore();
            }
        });

        test('propagates unexpected connection creation errors', async () => {
            User.findOne.mockResolvedValue({
                _id: OTHER_ID,
                accountStatus: 'active'
            });

            Connection.findOne.mockResolvedValue(null);
            Connection.create.mockRejectedValue(
                new Error('database unavailable')
            );

            await expectError(
                connectionController.sendConnectionRequest,
                makeReq({
                    params: { userId: OTHER_ID }
                }),
                'database unavailable',
                undefined
            );
        });
    });

    describe('acceptConnectionRequest', () => {
        test('rejects invalid IDs', async () => {
            await expectError(
                connectionController.acceptConnectionRequest,
                makeReq({
                    params: { userId: 'bad' }
                }),
                'Invalid user ID.',
                400
            );
        });

        test('rejects an unavailable requester', async () => {
            User.findOne.mockResolvedValue(null);

            await expectError(
                connectionController.acceptConnectionRequest,
                makeReq({
                    params: { userId: OTHER_ID }
                }),
                'User not found or account is unavailable.',
                404
            );
        });

        test('rejects when no pending request exists', async () => {
            User.findOne.mockResolvedValue({
                _id: OTHER_ID,
                accountStatus: 'active'
            });

            Connection.findOneAndUpdate.mockReturnValue(
                makeQuery(null)
            );

            await expectError(
                connectionController.acceptConnectionRequest,
                makeReq({
                    params: { userId: OTHER_ID }
                }),
                'Pending connection request not found.',
                404
            );
        });

        test('accepts a pending request and sends a notification', async () => {
            User.findOne.mockResolvedValue({
                _id: OTHER_ID,
                accountStatus: 'active'
            });

            Connection.findOneAndUpdate.mockReturnValue(
                makeQuery({
                    _id: 'conn1',
                    status: 'accepted'
                })
            );

            const { res } = await runController(
                connectionController.acceptConnectionRequest,
                makeReq({
                    params: { userId: OTHER_ID }
                })
            );

            expect(Connection.findOneAndUpdate).toHaveBeenCalledWith(
                {
                    requester: OTHER_ID,
                    recipient: CURRENT_ID,
                    status: 'pending'
                },
                { status: 'accepted' },
                { new: true, runValidators: true }
            );

            expect(Notification.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    sender: CURRENT_ID,
                    recipient: OTHER_ID,
                    type: 'connection_accepted'
                })
            );

            expect(res.status).toHaveBeenCalledWith(200);

            expect(res.json.mock.calls[0][0].data.status).toBe(
                'accepted'
            );
        });

        test('uses a fallback sender name when the current user has no name', async () => {
            User.findOne.mockResolvedValue({
                _id: OTHER_ID,
                accountStatus: 'active'
            });

            Connection.findOneAndUpdate.mockReturnValue(
                makeQuery({
                    _id: 'conn1',
                    status: 'accepted'
                })
            );

            await runController(
                connectionController.acceptConnectionRequest,
                makeReq({
                    params: { userId: OTHER_ID },
                    user: { name: '' }
                })
            );

            expect(Notification.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'A user accepted your connection request.'
                })
            );
        });
    });

    describe('declineConnectionRequest', () => {
        test('rejects invalid IDs', async () => {
            await expectError(
                connectionController.declineConnectionRequest,
                makeReq({
                    params: { userId: 'bad' }
                }),
                'Invalid user ID.',
                400
            );
        });

        test('reports when no incoming pending request exists', async () => {
            Connection.findOneAndDelete.mockResolvedValue(null);

            await expectError(
                connectionController.declineConnectionRequest,
                makeReq({
                    params: { userId: OTHER_ID }
                }),
                'Pending connection request not found.',
                404
            );
        });

        test('deletes the incoming request and notifies the sender', async () => {
            Connection.findOneAndDelete.mockResolvedValue({
                _id: 'conn1'
            });

            const { res } = await runController(
                connectionController.declineConnectionRequest,
                makeReq({
                    params: { userId: OTHER_ID }
                })
            );

            expect(Connection.findOneAndDelete).toHaveBeenCalledWith({
                requester: OTHER_ID,
                recipient: CURRENT_ID,
                status: 'pending'
            });

            expect(Notification.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    sender: CURRENT_ID,
                    recipient: OTHER_ID,
                    type: 'connection_rejected'
                })
            );

            expect(res.status).toHaveBeenCalledWith(200);

            expect(res.json.mock.calls[0][0]).toMatchObject({
                success: true,
                message: 'Connection request declined.'
            });
        });
    });

    describe('cancelConnectionRequest', () => {
        test('rejects invalid IDs', async () => {
            await expectError(
                connectionController.cancelConnectionRequest,
                makeReq({
                    params: { userId: 'bad' }
                }),
                'Invalid user ID.',
                400
            );
        });

        test('deletes only the current user outgoing pending request', async () => {
            Connection.findOneAndDelete.mockResolvedValue({
                _id: 'conn1'
            });

            const { res } = await runController(
                connectionController.cancelConnectionRequest,
                makeReq({
                    params: { userId: OTHER_ID }
                })
            );

            expect(Connection.findOneAndDelete).toHaveBeenCalledWith({
                requester: CURRENT_ID,
                recipient: OTHER_ID,
                status: 'pending'
            });

            expect(res.json.mock.calls[0][0].message).toBe(
                'Connection request cancelled.'
            );

            expect(Notification.create).not.toHaveBeenCalled();
        });

        test('reports when no outgoing request exists', async () => {
            Connection.findOneAndDelete.mockResolvedValue(null);

            await expectError(
                connectionController.cancelConnectionRequest,
                makeReq({
                    params: { userId: OTHER_ID }
                }),
                'Outgoing connection request not found.',
                404
            );
        });
    });

    describe('removeConnection', () => {
        test('rejects invalid IDs', async () => {
            await expectError(
                connectionController.removeConnection,
                makeReq({
                    params: { userId: 'bad' }
                }),
                'Invalid user ID.',
                400
            );
        });

        test('prevents removing oneself', async () => {
            await expectError(
                connectionController.removeConnection,
                makeReq({
                    params: { userId: CURRENT_ID }
                }),
                'Invalid connection.',
                400
            );

            expect(Connection.findOneAndDelete).not.toHaveBeenCalled();
        });

        test('reports when no accepted connection exists', async () => {
            Connection.findOneAndDelete.mockResolvedValue(null);

            await expectError(
                connectionController.removeConnection,
                makeReq({
                    params: { userId: OTHER_ID }
                }),
                'Connection not found.',
                404
            );
        });

        test('deletes an accepted connection in either direction', async () => {
            Connection.findOneAndDelete.mockResolvedValue({
                _id: 'conn1'
            });

            const { res } = await runController(
                connectionController.removeConnection,
                makeReq({
                    params: { userId: OTHER_ID }
                })
            );

            expect(Connection.findOneAndDelete).toHaveBeenCalledWith({
                $or: [
                    {
                        requester: CURRENT_ID,
                        recipient: OTHER_ID
                    },
                    {
                        requester: OTHER_ID,
                        recipient: CURRENT_ID
                    }
                ],
                status: 'accepted'
            });

            expect(res.json.mock.calls[0][0].message).toBe(
                'Connection removed successfully.'
            );
        });
    });
});

describe('connectionController connection lists', () => {
    describe('getConnections', () => {
        test('returns the other user and filters suspended or missing users', async () => {
            Connection.find.mockReturnValue(
                makeQuery([
                    {
                        _id: 'conn1',
                        requester: { _id: CURRENT_ID },
                        recipient: {
                            _id: OTHER_ID,
                            name: 'Connected',
                            accountStatus: 'active'
                        }
                    },
                    {
                        _id: 'conn2',
                        requester: {
                            _id: THIRD_ID,
                            name: 'Connected user',
                            accountStatus: 'active'
                        },
                        recipient: { _id: CURRENT_ID }
                    },
                    {
                        _id: 'conn3',
                        requester: {
                            _id: FOURTH_ID,
                            name: 'Suspended user',
                            accountStatus: 'suspended'
                        },
                        recipient: { _id: CURRENT_ID }
                    },
                    {
                        _id: 'conn4',
                        requester: null,
                        recipient: { _id: CURRENT_ID }
                    }
                ])
            );

            Connection.countDocuments.mockResolvedValue(4);

            const { res } = await runController(
                connectionController.getConnections,
                makeReq()
            );

            const body = res.json.mock.calls[0][0];

            expect(body.total).toBe(4);
            expect(body.data).toHaveLength(2);

            expect(body.data[0]).toMatchObject({
                user: { _id: OTHER_ID },
                connectionStatus: 'connected',
                connectionId: 'conn1'
            });

            expect(body.data[1]).toMatchObject({
                user: { _id: THIRD_ID },
                connectionStatus: 'connected',
                connectionId: 'conn2'
            });
        });

        test('returns an empty list when there are no accepted connections', async () => {
            Connection.find.mockReturnValue(makeQuery([]));
            Connection.countDocuments.mockResolvedValue(0);

            const { res } = await runController(
                connectionController.getConnections,
                makeReq()
            );

            expect(res.json.mock.calls[0][0]).toMatchObject({
                success: true,
                count: 0,
                total: 0,
                data: []
            });
        });
    });

    describe('getIncomingRequests', () => {
        test('returns non-suspended requesters only', async () => {
            Connection.find.mockReturnValue(
                makeQuery([
                    {
                        _id: 'conn1',
                        requester: {
                            _id: OTHER_ID,
                            accountStatus: 'active'
                        }
                    },
                    {
                        _id: 'conn2',
                        requester: {
                            _id: THIRD_ID,
                            accountStatus: 'suspended'
                        }
                    },
                    {
                        _id: 'conn3',
                        requester: null
                    }
                ])
            );

            Connection.countDocuments.mockResolvedValue(3);

            const { res } = await runController(
                connectionController.getIncomingRequests,
                makeReq()
            );

            expect(res.json.mock.calls[0][0].data).toEqual([
                {
                    user: {
                        _id: OTHER_ID,
                        accountStatus: 'active'
                    },
                    connectionStatus: 'incoming_pending',
                    connectionId: 'conn1'
                }
            ]);
        });

        test('returns an empty list when there are no incoming requests', async () => {
            Connection.find.mockReturnValue(makeQuery([]));
            Connection.countDocuments.mockResolvedValue(0);

            const { res } = await runController(
                connectionController.getIncomingRequests,
                makeReq()
            );

            expect(res.json.mock.calls[0][0].data).toEqual([]);
        });
    });

    describe('getOutgoingRequests', () => {
        test('returns non-suspended recipients only', async () => {
            Connection.find.mockReturnValue(
                makeQuery([
                    {
                        _id: 'conn1',
                        recipient: {
                            _id: OTHER_ID,
                            accountStatus: 'active'
                        }
                    },
                    {
                        _id: 'conn2',
                        recipient: {
                            _id: THIRD_ID,
                            accountStatus: 'suspended'
                        }
                    },
                    {
                        _id: 'conn3',
                        recipient: null
                    }
                ])
            );

            Connection.countDocuments.mockResolvedValue(3);

            const { res } = await runController(
                connectionController.getOutgoingRequests,
                makeReq()
            );

            expect(res.json.mock.calls[0][0].data).toEqual([
                {
                    user: {
                        _id: OTHER_ID,
                        accountStatus: 'active'
                    },
                    connectionStatus: 'outgoing_pending',
                    connectionId: 'conn1'
                }
            ]);
        });

        test('returns an empty list when there are no outgoing requests', async () => {
            Connection.find.mockReturnValue(makeQuery([]));
            Connection.countDocuments.mockResolvedValue(0);

            const { res } = await runController(
                connectionController.getOutgoingRequests,
                makeReq()
            );

            expect(res.json.mock.calls[0][0].data).toEqual([]);
        });
    });
});