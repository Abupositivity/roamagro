import React, { useEffect, useRef, useState } from "react";
import {
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
} from "@mui/material";
import {
    Visibility,
    VisibilityOff
} from "@mui/icons-material";
import { GoogleLogin } from "@react-oauth/google";
import { useDispatch, useSelector } from "react-redux";
import {
    register,
    googleLogin
} from "../../redux/actions/authActions";
import {
    Link,
    useNavigate
} from "react-router-dom";
import { useTranslation } from "react-i18next";

const Register = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const {
        loading,
        error,
        isAuthenticated
    } = useSelector(state => state.auth);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: ""
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [localError, setLocalError] = useState("");
    const [success, setSuccess] = useState(false);

    const navigationTimer = useRef(null);

    useEffect(() => {
        return () => {
            if (navigationTimer.current) {
                clearTimeout(navigationTimer.current);
            }
        };
    }, []);

    useEffect(() => {
        if (isAuthenticated) {
            navigate("/dashboard", { replace: true });
        }
    }, [isAuthenticated, navigate]);

    const handleChange = e => {
        setFormData(previous => ({
            ...previous,
            [e.target.name]: e.target.value
        }));

        setLocalError("");
    };

    const handleSubmit = async e => {
        e.preventDefault();

        if (loading || success) return;

        setLocalError("");

        const name = formData.name.trim();
        const email = formData.email.trim().toLowerCase();
        const password = formData.password;

        if (name.length < 2) {
            setLocalError(
                t("Name must contain at least 2 characters.")
            );
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setLocalError(
                t("Please enter a valid email address.")
            );
            return;
        }

        if (password.length < 6 || password.length > 128) {
            setLocalError(
                t("Password must be between 6 and 128 characters.")
            );
            return;
        }

        if (password !== formData.confirmPassword) {
            setLocalError(t("Passwords do not match."));
            return;
        }

        try {
            const result = await dispatch(
                register({
                    name,
                    email,
                    password
                })
            );

            if (result?.success) {
                setSuccess(true);

                navigationTimer.current = setTimeout(() => {
                    navigate("/login", {
                        replace: true,
                        state: {
                            message:
                                result.message ||
                                t(
                                    "Registration successful. Please verify your email before logging in."
                                )
                        }
                    });
                }, 1200);
            } else {
                setLocalError(
                    result?.message ||
                    t("Registration failed. Please try again.")
                );
            }
        } catch (err) {
            setLocalError(
                t("Something went wrong. Please try again.")
            );
        }
    };

    const handleGoogleSuccess = async response => {
        if (loading || success) return;

        setLocalError("");

        if (!response?.credential) {
            setLocalError(
                t("Google sign-in did not return a valid credential. Please try again.")
            );
            return;
        }

        try {
            const result = await dispatch(
                googleLogin(response.credential)
            );

            if (!result?.success) {
                setLocalError(
                    result?.message ||
                    t("Google registration failed. Please try again.")
                );
            }
        } catch (err) {
            setLocalError(
                t("Google registration failed. Please try again.")
            );
        }
    };

    return (
        <Container maxWidth="sm">
            <Box
                sx={{
                    minHeight: "100vh",
                    display: "flex",
                    alignItems: "center",
                    py: 3
                }}
            >
                <Card
                    sx={{
                        width: "100%",
                        borderRadius: 4
                    }}
                    elevation={3}
                >
                    <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
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
                                    sx={{ mt: 0.7 }}
                                >
                                    {t("Create your RoamAgro account")}
                                </Typography>
                            </Box>

                            {(localError || error) && (
                                <Alert severity="error">
                                    {localError || error}
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
                                        disabled={loading || success}
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
                                        disabled={loading || success}
                                        autoComplete="email"
                                        required
                                    />

                                    <TextField
                                        fullWidth
                                        name="password"
                                        label={t("Password")}
                                        type={showPassword ? "text" : "password"}
                                        value={formData.password}
                                        onChange={handleChange}
                                        disabled={loading || success}
                                        autoComplete="new-password"
                                        required
                                        helperText={t(
                                            "Password must be between 6 and 128 characters."
                                        )}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        type="button"
                                                        onClick={() =>
                                                            setShowPassword(previous => !previous)
                                                        }
                                                        edge="end"
                                                        aria-label={
                                                            showPassword
                                                                ? t("Hide password")
                                                                : t("Show password")
                                                        }
                                                    >
                                                        {showPassword
                                                            ? <VisibilityOff />
                                                            : <Visibility />
                                                        }
                                                    </IconButton>
                                                </InputAdornment>
                                            )
                                        }}
                                    />

                                    <TextField
                                        fullWidth
                                        name="confirmPassword"
                                        label={t("Confirm Password")}
                                        type={
                                            showConfirmPassword
                                                ? "text"
                                                : "password"
                                        }
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        disabled={loading || success}
                                        autoComplete="new-password"
                                        required
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        type="button"
                                                        onClick={() =>
                                                            setShowConfirmPassword(previous => !previous)
                                                        }
                                                        edge="end"
                                                        aria-label={
                                                            showConfirmPassword
                                                                ? t("Hide password")
                                                                : t("Show password")
                                                        }
                                                    >
                                                        {showConfirmPassword
                                                            ? <VisibilityOff />
                                                            : <Visibility />
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
                                            mt: 1,
                                            borderRadius: 2.5,
                                            py: 1.3
                                        }}
                                        disabled={loading || success}
                                        type="submit"
                                    >
                                        {loading ? (
                                            <CircularProgress
                                                size={24}
                                                color="inherit"
                                            />
                                        ) : (
                                            t("Create Account")
                                        )}
                                    </Button>
                                </Stack>
                            </Box>

                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1.5
                                }}
                            >
                                <Box
                                    sx={{
                                        flex: 1,
                                        height: "1px",
                                        bgcolor: "divider"
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
                                        flex: 1,
                                        height: "1px",
                                        bgcolor: "divider"
                                    }}
                                />
                            </Box>

                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "center"
                                }}
                            >
                                <GoogleLogin
                                    onSuccess={handleGoogleSuccess}
                                    onError={() =>
                                        setLocalError(
                                            t("Google registration failed. Please try again.")
                                        )
                                    }
                                />
                            </Box>

                            <Typography align="center" variant="body2">
                                {t("Already have an account?")}{" "}
                                <Typography
                                    component={Link}
                                    to="/login"
                                    color="primary"
                                    fontWeight={700}
                                    sx={{ textDecoration: "none" }}
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
                onClose={() => setSuccess(false)}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "center"
                }}
            >
                <Alert
                    severity="success"
                    variant="filled"
                    onClose={() => setSuccess(false)}
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