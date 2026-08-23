const AppError=require('../utils/AppError');

const ensureAdmin=(req,res,next)=>{
    if(!req.user){
        return next(
            new AppError(
                'Authentication required.',
                401
            )
        );
    }

    if(req.user.role!=='admin'){
        return next(
            new AppError(
                'Administrator access required.',
                403
            )
        );
    }

    next();
};

module.exports=ensureAdmin;