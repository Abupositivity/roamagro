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
}from"../actions/types";

const getStoredUser=()=>{
    try{
        const user=localStorage.getItem("user");
        return user?JSON.parse(user):null;
    }catch(error){
        localStorage.removeItem("user");
        return null;
    }
};

const initialState={
    token:localStorage.getItem("token"),
    user:getStoredUser(),
    isAuthenticated:!!localStorage.getItem("token"),
    loading:false,
    success:false,
    error:null,
    message:null
};

const authReducer=(state=initialState,action)=>{
    switch(action.type){

        case REGISTER_REQUEST:
        case LOGIN_REQUEST:
        case GOOGLE_LOGIN_REQUEST:
        case VERIFY_EMAIL_REQUEST:
        case FORGOT_PASSWORD_REQUEST:
        case RESET_PASSWORD_REQUEST:
        case UPDATE_PROFILE_REQUEST:
            return{
                ...state,
                loading:true,
                success:false,
                error:null,
                message:null
            };

        case REGISTER_SUCCESS:
            return{
                ...state,
                loading:false,
                success:true,
                error:null,
                message:action.payload?.message||"Registration successful."
            };

        case LOGIN_SUCCESS:
        case GOOGLE_LOGIN_SUCCESS:
            return{
                ...state,
                loading:false,
                success:true,
                isAuthenticated:true,
                token:action.payload.token,
                user:action.payload.user,
                error:null,
                message:null
            };

        case VERIFY_EMAIL_SUCCESS:
        case FORGOT_PASSWORD_SUCCESS:
        case RESET_PASSWORD_SUCCESS:
            return{
                ...state,
                loading:false,
                success:true,
                error:null,
                message:action.payload
            };

        case UPDATE_PROFILE_SUCCESS:
            return{
                ...state,
                loading:false,
                success:true,
                user:action.payload,
                error:null
            };

        case REGISTER_FAIL:
        case LOGIN_FAIL:
        case GOOGLE_LOGIN_FAIL:
        case VERIFY_EMAIL_FAIL:
        case FORGOT_PASSWORD_FAIL:
        case RESET_PASSWORD_FAIL:
        case UPDATE_PROFILE_FAIL:
            return{
                ...state,
                loading:false,
                success:false,
                error:action.payload,
                message:null
            };

        case LOGOUT:
            return{
                token:null,
                user:null,
                isAuthenticated:false,
                loading:false,
                success:false,
                error:null,
                message:null
            };

        default:
            return state;
    }
};

export default authReducer;