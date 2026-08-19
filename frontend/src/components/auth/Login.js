import React,{useEffect,useState}from"react";
import{
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Container,
    IconButton,
    InputAdornment,
    Snackbar,
    Stack,
    TextField,
    Typography
}from"@mui/material";
import{
    Visibility,
    VisibilityOff
}from"@mui/icons-material";
import{GoogleLogin}from"@react-oauth/google";
import{useDispatch,useSelector}from"react-redux";
import{login,googleLogin}from"../../redux/actions/authActions";
import{Link,useNavigate}from"react-router-dom";
import{useTranslation}from"react-i18next";

const Login=()=>{
    const dispatch=useDispatch();
    const navigate=useNavigate();
    const{t}=useTranslation();

    const{
        loading,
        error,
        isAuthenticated
    }=useSelector(state=>state.auth);

    const[credentials,setCredentials]=useState({
        email:"",
        password:""
    });

    const[showPassword,setShowPassword]=useState(false);
    const[localError,setLocalError]=useState("");
    const[success,setSuccess]=useState(false);

    useEffect(()=>{
        if(!isAuthenticated){
            return;
        }

        setSuccess(true);

        const timer=setTimeout(()=>{
            navigate("/dashboard");
        },700);

        return()=>clearTimeout(timer);
    },[isAuthenticated,navigate]);

    const handleChange=e=>{
        setCredentials(previous=>({
            ...previous,
            [e.target.name]:e.target.value
        }));

        setLocalError("");
    };

    const handleSubmit=async e=>{
        e.preventDefault();
        setLocalError("");

        const email=credentials.email.trim();

        if(!email){
            setLocalError(t("Email is required."));
            return;
        }

        if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
            setLocalError(
                t("Please enter a valid email address.")
            );
            return;
        }

        if(!credentials.password){
            setLocalError(t("Password is required."));
            return;
        }

        await dispatch(
            login({
                email,
                password:credentials.password
            })
        );
    };

    const handleGoogleSuccess=response=>{
        setLocalError("");
        dispatch(
            googleLogin(response.credential)
        );
    };

    return(
        <Container maxWidth="sm">
            <Box
                sx={{
                    minHeight:"100vh",
                    display:"flex",
                    alignItems:"center",
                    py:3
                }}
            >
                <Card
                    sx={{
                        width:"100%",
                        borderRadius:4
                    }}
                    elevation={3}
                >
                    <CardContent
                        sx={{
                            p:{xs:2.5,sm:4}
                        }}
                    >
                        <Stack spacing={2.5}>
                            <Box>
                                <Typography
                                    variant="h4"
                                    align="center"
                                    fontWeight={800}
                                >
                                    {t("Login")}
                                </Typography>

                                <Typography
                                    variant="body2"
                                    align="center"
                                    color="text.secondary"
                                    sx={{mt:.7}}
                                >
                                    {t("Welcome Back")}
                                </Typography>
                            </Box>

                            {(localError||error)&&(
                                <Alert severity="error">
                                    {localError||error}
                                </Alert>
                            )}

                            <Box
                                component="form"
                                onSubmit={handleSubmit}
                                noValidate
                            >
                                <Stack spacing={2}>
                                    <TextField
                                        fullWidth
                                        name="email"
                                        label={t("Email Address")}
                                        type="email"
                                        value={credentials.email}
                                        onChange={handleChange}
                                        disabled={loading}
                                        autoComplete="email"
                                        required
                                    />

                                    <TextField
                                        fullWidth
                                        name="password"
                                        label={t("Password")}
                                        type={
                                            showPassword
                                                ?"text"
                                                :"password"
                                        }
                                        value={credentials.password}
                                        onChange={handleChange}
                                        disabled={loading}
                                        autoComplete="current-password"
                                        required
                                        InputProps={{
                                            endAdornment:(
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        type="button"
                                                        onClick={()=>
                                                            setShowPassword(
                                                                previous=>!previous
                                                            )
                                                        }
                                                        edge="end"
                                                        aria-label={
                                                            showPassword
                                                                ?t("Hide password")
                                                                :t("Show password")
                                                        }
                                                    >
                                                        {showPassword
                                                            ?<VisibilityOff/>
                                                            :<Visibility/>
                                                        }
                                                    </IconButton>
                                                </InputAdornment>
                                            )
                                        }}
                                    />

                                    <Box
                                        sx={{
                                            display:"flex",
                                            justifyContent:"flex-end"
                                        }}
                                    >
                                        <Typography
                                            component={Link}
                                            to="/forgot-password"
                                            variant="body2"
                                            color="primary"
                                            sx={{
                                                textDecoration:"none",
                                                fontWeight:600
                                            }}
                                        >
                                            {t("Forgot password?")}
                                        </Typography>
                                    </Box>

                                    <Button
                                        fullWidth
                                        variant="contained"
                                        disabled={loading}
                                        type="submit"
                                        size="large"
                                        sx={{
                                            borderRadius:2.5,
                                            py:1.3
                                        }}
                                    >
                                        {loading?(
                                            <CircularProgress
                                                size={24}
                                                color="inherit"
                                            />
                                        ):(
                                            t("SIGN IN")
                                        )}
                                    </Button>
                                </Stack>
                            </Box>

                            <Box
                                sx={{
                                    display:"flex",
                                    alignItems:"center",
                                    gap:1.5
                                }}
                            >
                                <Box
                                    sx={{
                                        flex:1,
                                        height:"1px",
                                        bgcolor:"divider"
                                    }}
                                />

                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                >
                                    {t("OR")}
                                </Typography>

                                <Box
                                    sx={{
                                        flex:1,
                                        height:"1px",
                                        bgcolor:"divider"
                                    }}
                                />
                            </Box>

                            <Box
                                sx={{
                                    display:"flex",
                                    justifyContent:"center"
                                }}
                            >
                                <GoogleLogin
                                    onSuccess={handleGoogleSuccess}
                                    onError={()=>
                                        setLocalError(
                                            t(
                                                "Google sign-in failed. Please try again."
                                            )
                                        )
                                    }
                                />
                            </Box>

                            <Typography
                                align="center"
                                variant="body2"
                            >
                                {t("Don't have an account?")}{" "}
                                <Typography
                                    component={Link}
                                    to="/register"
                                    color="primary"
                                    fontWeight={700}
                                    sx={{
                                        textDecoration:"none"
                                    }}
                                >
                                    {t("Register")}
                                </Typography>
                            </Typography>
                        </Stack>
                    </CardContent>
                </Card>
            </Box>

            <Snackbar
                open={success}
                autoHideDuration={1800}
                onClose={()=>setSuccess(false)}
                anchorOrigin={{
                    vertical:"bottom",
                    horizontal:"center"
                }}
            >
                <Alert
                    severity="success"
                    variant="filled"
                    onClose={()=>setSuccess(false)}
                >
                    {t("Login successful")}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default Login;