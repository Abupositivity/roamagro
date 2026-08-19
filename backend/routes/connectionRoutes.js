const express=require('express');
const router=express.Router();
const ensureAuthenticated=require('../middleware/ensureAuthenticated');
const validateRequest=require('../middleware/validateRequest');

const{
    searchUsers,
    discoverUsers,
    getPublicProfile,
    getConnectionStatus,
    sendConnectionRequest,
    acceptConnectionRequest,
    declineConnectionRequest,
    cancelConnectionRequest,
    removeConnection,
    getConnections,
    getIncomingRequests,
    getOutgoingRequests
}=require('../controllers/connectionController');

const{
    userIdValidator
}=require('../validators/connectionValidator');

router.use(
    ensureAuthenticated
);

router.get(
    '/search',
    searchUsers
);

router.get(
    '/discover',
    discoverUsers
);

router.get(
    '/requests/incoming',
    getIncomingRequests
);

router.get(
    '/requests/outgoing',
    getOutgoingRequests
);

router.get(
    '/',
    getConnections
);

router.get(
    '/:userId/profile',
    userIdValidator,
    validateRequest,
    getPublicProfile
);

router.get(
    '/:userId/status',
    userIdValidator,
    validateRequest,
    getConnectionStatus
);

router.post(
    '/:userId/connect',
    userIdValidator,
    validateRequest,
    sendConnectionRequest
);

router.put(
    '/:userId/accept',
    userIdValidator,
    validateRequest,
    acceptConnectionRequest
);

router.delete(
    '/:userId/decline',
    userIdValidator,
    validateRequest,
    declineConnectionRequest
);

router.delete(
    '/:userId/cancel',
    userIdValidator,
    validateRequest,
    cancelConnectionRequest
);

router.delete(
    '/:userId/remove',
    userIdValidator,
    validateRequest,
    removeConnection
);

module.exports=router;