import React,{useState}from"react";
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
import{useDispatch,useSelector}from"react-redux";
import{register}from"../../redux/actions/authActions";
import{Link,useNavigate}from"react-router-dom";
import{useTranslation}from"react-i18next";

const Register=()=>{
    const dispatch=useDispatch();
    const navigate=useNavigate();
    const{t}=useTranslation();

    const{
        loading,
        error
    }=useSelector(state=>state.auth);

    const[formData,setFormData]=useState({
        name:"",
        email:"",
        password:""
    });

    const[showPassword,setShowPassword]=useState(false);
    const[localError,setLocalError]=useState("");
    const[success,setSuccess]=useState(false);

    const handleChange=e=>{
        setFormData(previous=>({
            ...previous,
            [e.target.name]:e.target.value
        }));

        setLocalError("");
    };

    const handleSubmit=async e=>{
        e.preventDefault();
        setLocalError("");

        const name=formData.name.trim();
        const email=formData.email.trim();

        if(name.length<2){
            setLocalError(
                t("Name must contain at least 2 characters.")
            );
            return;
        }

        if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
            setLocalError(
                t("Please enter a valid email address.")
            );
            return;
        }

        if (
            formData.password.length < 6 ||
            formData.password.length > 128
        ) {
            setLocalError(
                t("Password must be between 6 and 128 characters.")
            );
            return;
        }

        const result=await dispatch(
            register({
                name,
                email,
                password:formData.password
            })
        );

        if(result?.success){
            setSuccess(true);

            setTimeout(()=>{
                navigate("/login",{
                    state:{
                        message:
                            result.message||
                            t(
                                "Registration successful. Please verify your email before logging in."
                            )
                    }
                });
            },1200);
        }
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
                                    {t("Register New User")}
                                </Typography>

                                <Typography
                                    variant="body2"
                                    align="center"
                                    color="text.secondary"
                                    sx={{mt:.7}}
                                >
                                    {t(
                                        "Create your RoamAgro account"
                                    )}
                                </Typography>
                            </Box>

                            {(localError||error)&&(
                                <Alert severity="error">
                                    {localError||error}
                                </Alert>
                            )}

                            <Alert severity="info">
                                {t(
                                    "You will need to verify your email address before you can log in."
                                )}
                            </Alert>

                            <Box
                                component="form"
                                onSubmit={handleSubmit}
                                noValidate
                            >
                                <Stack spacing={2}>
                                    <TextField
                                        fullWidth
                                        name="name"
                                        label={t("Name")}
                                        value={formData.name}
                                        onChange={handleChange}
                                        disabled={loading}
                                        autoComplete="name"
                                        required
                                    />

                                    <TextField
                                        fullWidth
                                        name="email"
                                        label={t("Email Address")}
                                        type="email"
                                        value={formData.email}
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
                                        value={formData.password}
                                        onChange={handleChange}
                                        disabled={loading}
                                        autoComplete="new-password"
                                        required
                                        helperText={t(
                                            "Use at least 6 characters."
                                        )}
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

                                    <Button
                                        fullWidth
                                        variant="contained"
                                        size="large"
                                        sx={{
                                            mt:1,
                                            borderRadius:2.5,
                                            py:1.3
                                        }}
                                        disabled={loading}
                                        type="submit"
                                    >
                                        {loading?(
                                            <CircularProgress
                                                size={24}
                                                color="inherit"
                                            />
                                        ):(
                                            t("Create Account")
                                        )}
                                    </Button>
                                </Stack>
                            </Box>

                            <Typography
                                align="center"
                                variant="body2"
                            >
                                {t("Already have an account?")}{" "}
                                <Typography
                                    component={Link}
                                    to="/login"
                                    color="primary"
                                    fontWeight={700}
                                    sx={{
                                        textDecoration:"none"
                                    }}
                                >
                                    {t("Login")}
                                </Typography>
                            </Typography>
                        </Stack>
                    </CardContent>
                </Card>
            </Box>

            <Snackbar
                open={success}
                autoHideDuration={2500}
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
                    {t(
                        "Account created. Check your email to verify your account."
                    )}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default Register;