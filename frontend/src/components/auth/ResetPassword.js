import React, { useState } from "react";
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
    Stack,
    TextField,
    Typography
} from "@mui/material";
import {
    Visibility,
    VisibilityOff
} from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { resetPassword } from "../../redux/actions/authActions";
import {
    Link,
    useNavigate,
    useSearchParams
} from "react-router-dom";
import { useTranslation } from "react-i18next";

const ResetPassword = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [tParams] = useSearchParams();
    const { t } = useTranslation();

    const {
        loading,
        error
    } = useSelector(state => state.auth);

    const token = tParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [localError, setLocalError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleSubmit = async e => {
        e.preventDefault();

        if (loading || success) return;

        setLocalError("");

        if (!token) {
            setLocalError(
                t("This password reset link is invalid or incomplete.")
            );
            return;
        }

        if (password.length < 6 || password.length > 128) {
            setLocalError(
                t("Password must be between 6 and 128 characters.")
            );
            return;
        }

        if (password !== confirmPassword) {
            setLocalError(t("Passwords do not match."));
            return;
        }

        try {
            const result = await dispatch(
                resetPassword(token, password)
            );

            if (result?.success) {
                setSuccess(true);

                setTimeout(() => {
                    navigate("/login", {
                        replace: true,
                        state: {
                            message:
                                result.message ||
                                t("Password reset successfully. You can now log in.")
                        }
                    });
                }, 1200);
            } else {
                setLocalError(
                    result?.message ||
                    t("Unable to reset your password. Please try again.")
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
                                    {t("Reset Password")}
                                </Typography>

                                <Typography
                                    color="text.secondary"
                                    align="center"
                                    sx={{ mt: 0.7 }}
                                >
                                    {t(
                                        "Create a new password for your RoamAgro account."
                                    )}
                                </Typography>
                            </Box>

                            {(localError || error) && (
                                <Alert severity="error">
                                    {localError || error}
                                </Alert>
                            )}

                            {success && (
                                <Alert severity="success">
                                    {t(
                                        "Password reset successfully. Redirecting to login..."
                                    )}
                                </Alert>
                            )}

                            {!token && (
                                <Alert severity="warning">
                                    {t(
                                        "This password reset link is invalid or incomplete."
                                    )}
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
                                        label={t("New Password")}
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={e => {
                                            setPassword(e.target.value);
                                            setLocalError("");
                                        }}
                                        disabled={loading || success || !token}
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
                                        label={t("Confirm New Password")}
                                        type={
                                            showConfirmPassword
                                                ? "text"
                                                : "password"
                                        }
                                        value={confirmPassword}
                                        onChange={e => {
                                            setConfirmPassword(e.target.value);
                                            setLocalError("");
                                        }}
                                        disabled={loading || success || !token}
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
                                        type="submit"
                                        disabled={loading || success || !token}
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
                                            t("Reset Password")
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

export default ResetPassword;