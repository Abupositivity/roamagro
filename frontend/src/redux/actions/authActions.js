import api from '../../services/api';

import{
    LOGIN_REQUEST,
    LOGIN_SUCCESS,
    LOGIN_FAIL,
    REGISTER_REQUEST,
    REGISTER_SUCCESS,
    REGISTER_FAIL,
    GOOGLE_LOGIN_REQUEST,
    GOOGLE_LOGIN_SUCCESS,
    GOOGLE_LOGIN_FAIL,
    VERIFY_EMAIL_REQUEST,
    VERIFY_EMAIL_SUCCESS,
    VERIFY_EMAIL_FAIL,
    FORGOT_PASSWORD_REQUEST,
    FORGOT_PASSWORD_SUCCESS,
    FORGOT_PASSWORD_FAIL,
    RESET_PASSWORD_REQUEST,
    RESET_PASSWORD_SUCCESS,
    RESET_PASSWORD_FAIL,
    UPDATE_PROFILE_REQUEST,
    UPDATE_PROFILE_SUCCESS,
    UPDATE_PROFILE_FAIL,
    LOGOUT
}from'./types';

export const register=userData=>async dispatch=>{
    dispatch({type:REGISTER_REQUEST});

    try{
        const res=await api.post(
            '/auth/register',
            userData
        );

        dispatch({
            type:REGISTER_SUCCESS,
            payload:res.data
        });

        return{
            success:true,
            message:res.data.message,
            email:res.data.data?.email
        };
    }catch(error){
        const message=
            error.response?.data?.message||
            'Registration failed.';

        dispatch({
            type:REGISTER_FAIL,
            payload:message
        });

        return{
            success:false,
            message
        };
    }
};

export const login=credentials=>async dispatch=>{
    dispatch({type:LOGIN_REQUEST});

    try{
        const res=await api.post(
            '/auth/login',
            credentials
        );

        const{token,user}=res.data.data;

        localStorage.setItem('token',token);
        localStorage.setItem(
            'user',
            JSON.stringify(user)
        );

        dispatch({
            type:LOGIN_SUCCESS,
            payload:{
                token,
                user
            }
        });

        return{
            success:true
        };
    }catch(error){
        const message=
            error.response?.data?.message||
            'Invalid email or password.';

        dispatch({
            type:LOGIN_FAIL,
            payload:message
        });

        return{
            success:false,
            message
        };
    }
};

export const googleLogin=googleToken=>async dispatch=>{
    dispatch({
        type:GOOGLE_LOGIN_REQUEST
    });

    try{
        const res=await api.post(
            '/auth/google',
            {
                token:googleToken
            }
        );

        const{token,user}=res.data.data;

        localStorage.setItem('token',token);
        localStorage.setItem(
            'user',
            JSON.stringify(user)
        );

        dispatch({
            type:GOOGLE_LOGIN_SUCCESS,
            payload:{
                token,
                user
            }
        });

        return{
            success:true
        };
    }catch(error){
        const message=
            error.response?.data?.message||
            'Google login failed.';

        dispatch({
            type:GOOGLE_LOGIN_FAIL,
            payload:message
        });

        return{
            success:false,
            message
        };
    }
};

export const verifyEmail=token=>async dispatch=>{
    dispatch({
        type:VERIFY_EMAIL_REQUEST
    });

    try{
        const res=await api.get(
            `/auth/verify-email?token=${encodeURIComponent(token)}`
        );

        dispatch({
            type:VERIFY_EMAIL_SUCCESS,
            payload:res.data.message
        });

        return{
            success:true,
            message:res.data.message
        };
    }catch(error){
        const message=
            error.response?.data?.message||
            'Email verification failed.';

        dispatch({
            type:VERIFY_EMAIL_FAIL,
            payload:message
        });

        return{
            success:false,
            message
        };
    }
};

export const forgotPassword=email=>async dispatch=>{
    dispatch({
        type:FORGOT_PASSWORD_REQUEST
    });

    try{
        const res=await api.post(
            '/auth/forgot-password',
            {
                email
            }
        );

        dispatch({
            type:FORGOT_PASSWORD_SUCCESS,
            payload:res.data.message
        });

        return{
            success:true,
            message:res.data.message
        };
    }catch(error){
        const message=
            error.response?.data?.message||
            'Unable to process password recovery.';

        dispatch({
            type:FORGOT_PASSWORD_FAIL,
            payload:message
        });

        return{
            success:false,
            message
        };
    }
};

export const resetPassword=(token,password)=>async dispatch=>{
    dispatch({
        type:RESET_PASSWORD_REQUEST
    });

    try{
        const res=await api.post(
            '/auth/reset-password',
            {
                token,
                password
            }
        );

        dispatch({
            type:RESET_PASSWORD_SUCCESS,
            payload:res.data.message
        });

        return{
            success:true,
            message:res.data.message
        };
    }catch(error){
        const message=
            error.response?.data?.message||
            'Unable to reset your password.';

        dispatch({
            type:RESET_PASSWORD_FAIL,
            payload:message
        });

        return{
            success:false,
            message
        };
    }
};

export const updateProfile=profileData=>async dispatch=>{
    dispatch({
        type:UPDATE_PROFILE_REQUEST
    });

    try{
        const res=await api.put(
            '/users/profile',
            profileData
        );

        const user=res.data.data;

        localStorage.setItem(
            'user',
            JSON.stringify(user)
        );

        dispatch({
            type:UPDATE_PROFILE_SUCCESS,
            payload:user
        });

        return{
            success:true,
            user
        };
    }catch(error){
        const message=
            error.response?.data?.message||
            'Unable to update profile.';

        dispatch({
            type:UPDATE_PROFILE_FAIL,
            payload:message
        });

        return{
            success:false,
            message
        };
    }
};

export const deleteAccount=()=>async dispatch=>{
    try{
        const res=await api.delete(
            '/users/account'
        );

        localStorage.removeItem('token');
        localStorage.removeItem('user');

        dispatch({
            type:LOGOUT
        });

        return{
            success:true,
            message:res.data.message
        };
    }catch(error){
        const message=
            error.response?.data?.message||
            'Unable to delete your account.';

        return{
            success:false,
            message
        };
    }
};

export const reportUser=(userId,data)=>async()=>{
    try{
        const res=await api.post(
            `/users/${userId}/report`,
            data
        );

        return{
            success:true,
            message:res.data.message
        };
    }catch(error){
        return{
            success:false,
            message:
                error.response?.data?.message||
                'Unable to submit report.'
        };
    }
};

export const logout=()=>dispatch=>{
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    dispatch({
        type:LOGOUT
    });
};