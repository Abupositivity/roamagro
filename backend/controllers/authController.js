const User=require('../models/User');
const {OAuth2Client}=require('google-auth-library');
const asyncHandler=require('../middleware/asyncHandler');
const AppError=require('../utils/AppError');
const generateToken=require('../utils/generateToken');
const {sendEmail}=require('../utils/email');
const {createRawToken,hashToken}=require('../utils/authTokens');

const client=new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const frontendUrl=process.env.FRONTEND_URL||'http://localhost:3000';

exports.registerUser=asyncHandler(async(req,res)=>{
    const{name,email,password}=req.body;
    const normalizedEmail=email.toLowerCase().trim();

    const existingUser=await User.findOne({
        email:normalizedEmail
    });

    if(existingUser){
        if(!existingUser.isVerified){
            const rawToken=createRawToken();
            const hashedToken=hashToken(rawToken);

            existingUser.emailVerificationToken=hashedToken;
            existingUser.emailVerificationExpires=new Date(
                Date.now()+24*60*60*1000
            );

            await existingUser.save({validateBeforeSave:false});

            const verificationUrl=
                `${frontendUrl}/verify-email?token=${rawToken}`;

            await sendEmail({
                to:existingUser.email,
                subject:'Verify your RoamAgro email',
                text:`Verify your RoamAgro account: ${verificationUrl}`,
                html:`
                    <h2>Verify your RoamAgro account</h2>
                    <p>Hello ${existingUser.name},</p>
                    <p>Please verify your email address to activate your RoamAgro account.</p>
                    <p><a href="${verificationUrl}">Verify Email Address</a></p>
                    <p>This link expires in 24 hours.</p>
                `
            });

            return res.status(200).json({
                success:true,
                message:'A new verification email has been sent.'
            });
        }

        throw new AppError(
            'Email already registered.',
            409
        );
    }

    const rawToken=createRawToken();
    const hashedToken=hashToken(rawToken);

    const user=await User.create({
        name,
        email:normalizedEmail,
        password,
        isVerified:false,
        emailVerificationToken:hashedToken,
        emailVerificationExpires:new Date(
            Date.now()+24*60*60*1000
        )
    });

    const verificationUrl=
        `${frontendUrl}/verify-email?token=${rawToken}`;

    await sendEmail({
        to:user.email,
        subject:'Verify your RoamAgro email',
        text:`Verify your RoamAgro account: ${verificationUrl}`,
        html:`
            <h2>Welcome to RoamAgro</h2>
            <p>Hello ${user.name},</p>
            <p>Your RoamAgro account has been created.</p>
            <p>Please verify your email address before logging in.</p>
            <p><a href="${verificationUrl}">Verify Email Address</a></p>
            <p>This link expires in 24 hours.</p>
        `
    });

    res.status(201).json({
        success:true,
        message:'Registration successful. Please check your email to verify your account.',
        data:{
            email:user.email
        }
    });
});

exports.verifyEmail=asyncHandler(async(req,res)=>{
    const{token}=req.query;

    if(!token){
        throw new AppError(
            'Email verification token is required.',
            400
        );
    }

    const hashedToken=hashToken(token);

    const user=await User.findOne({
        emailVerificationToken:hashedToken,
        emailVerificationExpires:{
            $gt:new Date()
        }
    });

    if(!user){
        throw new AppError(
            'This verification link is invalid or has expired.',
            400
        );
    }

    user.isVerified=true;
    user.emailVerificationToken=null;
    user.emailVerificationExpires=null;

    await user.save({validateBeforeSave:false});

    res.json({
        success:true,
        message:'Email verified successfully.'
    });
});

exports.loginUser=asyncHandler(async(req,res)=>{
    const{email,password}=req.body;
    const normalizedEmail=email.toLowerCase().trim();

    const user=await User.findOne({
        email:normalizedEmail
    });

    if(!user||!(await user.matchPassword(password))){
        throw new AppError(
            'Invalid email or password.',
            401
        );
    }

    if(user.accountStatus==='suspended'){
        if(
            user.suspendedUntil&&
            user.suspendedUntil<=new Date()
        ){
            user.accountStatus='active';
            user.suspensionReason='';
            user.suspendedAt=null;
            user.suspendedUntil=null;
            await user.save({validateBeforeSave:false});
        }else{
            throw new AppError(
                'Your RoamAgro account is currently suspended.',
                403
            );
        }
    }

    if(!user.isVerified){
        throw new AppError(
            'Please verify your email address before logging in.',
            403
        );
    }

    res.json({
        success:true,
        message:'Login successful.',
        data:{
            token:generateToken(user._id),
            user
        }
    });
});

exports.googleAuth=asyncHandler(async(req,res)=>{
    const{token}=req.body;

    const ticket=await client.verifyIdToken({
        idToken:token,
        audience:process.env.GOOGLE_CLIENT_ID
    });

    const payload=ticket.getPayload();

    let user=await User.findOne({
        email:payload.email.toLowerCase()
    });

    if(!user){
        user=await User.create({
            googleId:payload.sub,
            name:payload.name,
            email:payload.email.toLowerCase(),
            profilePhoto:payload.picture||'',
            isVerified:true
        });
    }else{
        if(user.accountStatus==='suspended'){
            if(
                user.suspendedUntil&&
                user.suspendedUntil<=new Date()
            ){
                user.accountStatus='active';
                user.suspensionReason='';
                user.suspendedAt=null;
                user.suspendedUntil=null;
                await user.save({validateBeforeSave:false});
            }else{
                throw new AppError(
                    'Your RoamAgro account is currently suspended.',
                    403
                );
            }
        }

        if(!user.isVerified){
            user.isVerified=true;
            user.googleId=user.googleId||payload.sub;
            await user.save({validateBeforeSave:false});
        }
    }

    res.json({
        success:true,
        message:'Google login successful.',
        data:{
            token:generateToken(user._id),
            user
        }
    });
});

exports.forgotPassword=asyncHandler(async(req,res)=>{
    const{email}=req.body;
    const normalizedEmail=email.toLowerCase().trim();

    const user=await User.findOne({
        email:normalizedEmail
    });

    if(user){
        const rawToken=createRawToken();
        const hashedToken=hashToken(rawToken);

        user.passwordResetToken=hashedToken;
        user.passwordResetExpires=new Date(
            Date.now()+30*60*1000
        );

        await user.save({validateBeforeSave:false});

        const resetUrl=
            `${frontendUrl}/reset-password?token=${rawToken}`;

        await sendEmail({
            to:user.email,
            subject:'Reset your RoamAgro password',
            text:`Reset your RoamAgro password: ${resetUrl}`,
            html:`
                <h2>Password Reset</h2>
                <p>Hello ${user.name},</p>
                <p>We received a request to reset your RoamAgro password.</p>
                <p><a href="${resetUrl}">Reset Password</a></p>
                <p>This link expires in 30 minutes.</p>
                <p>If you did not request this, you can safely ignore this email.</p>
            `
        });
    }

    res.json({
        success:true,
        message:'If an account exists for that email, password reset instructions have been sent.'
    });
});

exports.resetPassword=asyncHandler(async(req,res)=>{
    const{token,password}=req.body;

    if(!token){
        throw new AppError(
            'Password reset token is required.',
            400
        );
    }

    const hashedToken=hashToken(token);

    const user=await User.findOne({
        passwordResetToken:hashedToken,
        passwordResetExpires:{
            $gt:new Date()
        }
    });

    if(!user){
        throw new AppError(
            'This password reset link is invalid or has expired.',
            400
        );
    }

    user.password=password;
    user.passwordResetToken=null;
    user.passwordResetExpires=null;

    await user.save();

    res.json({
        success:true,
        message:'Password reset successfully.'
    });
});

exports.getCurrentUser=asyncHandler(async(req,res)=>{
    res.json({
        success:true,
        data:req.user
    });
});