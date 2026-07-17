const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {

    try {

        const authHeader = req.headers.authorization;

        if (!authHeader) {

            return res.status(401).json({

                success: false,

                message: 'No authorization token.'

            });

        }

        const token = authHeader.startsWith('Bearer ')
            ? authHeader.split(' ')[1]
            : authHeader;

        const decoded = jwt.verify(

            token,

            process.env.JWT_SECRET

        );

        const user = await User.findById(decoded.id).select('-password');

        if (!user) {

            return res.status(401).json({

                success: false,

                message: 'User not found.'

            });

        }

        req.user = user;

        next();

    }

    catch (error) {

        return res.status(401).json({

            success: false,

            message: 'Invalid or expired token.'

        });

    }

};