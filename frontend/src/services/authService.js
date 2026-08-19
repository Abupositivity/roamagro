import api from "./api";

const authService={
    register(userData){
        return api.post(
            "/auth/register",
            userData
        );
    },
    login(credentials){
        return api.post(
            "/auth/login",
            credentials
        );
    },
    googleLogin(token){
        return api.post(
            "/auth/google",
            {token}
        );
    },
    verifyEmail(token){
        return api.get(
            `/auth/verify-email?token=${encodeURIComponent(token)}`
        );
    },
    forgotPassword(email){
        return api.post(
            "/auth/forgot-password",
            {email}
        );
    },
    resetPassword(token,password){
        return api.post(
            "/auth/reset-password",
            {
                token,
                password
            }
        );
    }
};

export default authService;