import React, { useState } from "react";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Container,
    Stack,
    TextField,
    Typography
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { forgotPassword } from "../../redux/actions/authActions";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const ForgotPassword = () => {
    const dispatch = useDispatch();
    const { t } = useTranslation();

    const { loading, error } = useSelector(state => state.auth);

    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [localError, setLocalError] = useState("");

    const handleSubmit = async e => {
        e.preventDefault();

        if (loading || message) return;

        setLocalError("");
        setMessage("");

        const normalizedEmail = email.trim().toLowerCase();

        if (!normalizedEmail) {
            setLocalError(t("Email is required."));
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
            setLocalError(t("Please enter a valid email address."));
            return;
        }

        try {
            const result = await dispatch(
                forgotPassword(normalizedEmail)
            );

            if (result?.success) {
                setMessage(
                    result.message ||
                    t(
                        "If an account exists for that email, password reset instructions have been sent."
                    )
                );
            } else {
                setLocalError(
                    result?.message ||
                    t("Unable to process password recovery. Please try again.")
                );
            }
        } catch (err) {
            setLocalError(
                t("Something went wrong. Please try again.")
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
                                    fontWeight={800}
                                    align="center"
                                >
                                    {t("Forgot Password")}
                                </Typography>

                                <Typography
                                    color="text.secondary"
                                    align="center"
                                    sx={{ mt: 0.7 }}
                                >
                                    {t(
                                        "Enter your email and we will send you password reset instructions."
                                    )}
                                </Typography>
                            </Box>

                            {(localError || error) && (
                                <Alert severity="error">
                                    {localError || error}
                                </Alert>
                            )}

                            {message && (
                                <Alert severity="success">
                                    {message}
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
                                        label={t("Email Address")}
                                        type="email"
                                        value={email}
                                        onChange={e => {
                                            setEmail(e.target.value);
                                            setLocalError("");
                                            setMessage("");
                                        }}
                                        disabled={loading || !!message}
                                        autoComplete="email"
                                        required
                                    />

                                    <Button
                                        fullWidth
                                        variant="contained"
                                        size="large"
                                        type="submit"
                                        disabled={loading || !!message}
                                        sx={{
                                            borderRadius: 2.5,
                                            py: 1.3
                                        }}
                                    >
                                        {loading ? (
                                            <CircularProgress
                                                size={24}
                                                color="inherit"
                                            />
                                        ) : (
                                            t("Send Reset Link")
                                        )}
                                    </Button>
                                </Stack>
                            </Box>

                            <Typography align="center" variant="body2">
                                <Typography
                                    component={Link}
                                    to="/login"
                                    color="primary"
                                    fontWeight={700}
                                    sx={{ textDecoration: "none" }}
                                >
                                    {t("Back to Login")}
                                </Typography>
                            </Typography>
                        </Stack>
                    </CardContent>
                </Card>
            </Box>
        </Container>
    );
};

export default ForgotPassword;