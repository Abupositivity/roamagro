import React, { useEffect, useRef, useState } from "react";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Container,
    Stack,
    Typography
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { verifyEmail } from "../../redux/actions/authActions";
import {
    Link,
    useSearchParams
} from "react-router-dom";
import { useTranslation } from "react-i18next";

const VerifyEmail = () => {
    const dispatch = useDispatch();
    const [tParams] = useSearchParams();
    const { t } = useTranslation();

    const {
        loading,
        error
    } = useSelector(state => state.auth);

    const token = tParams.get("token");

    const [message, setMessage] = useState("");
    const [completed, setCompleted] = useState(false);
    const [localError, setLocalError] = useState("");

    const attemptedToken = useRef(null);

    useEffect(() => {
        if (!token) {
            setLocalError(
                t("This verification link is invalid or incomplete.")
            );
            return;
        }

        if (attemptedToken.current === token) return;

        attemptedToken.current = token;

        let active = true;

        const verify = async () => {
            try {
                const result = await dispatch(verifyEmail(token));

                if (!active) return;

                if (result?.success) {
                    setMessage(
                        result.message ||
                        t("Email verified successfully.")
                    );
                    setCompleted(true);
                    setLocalError("");
                } else {
                    setLocalError(
                        result?.message ||
                        t("Email verification failed. The link may have expired.")
                    );
                }
            } catch (err) {
                if (active) {
                    setLocalError(
                        t("Something went wrong while verifying your email. Please try again.")
                    );
                }
            }
        };

        verify();

        return () => {
            active = false;
        };
    }, [dispatch, token, t]);

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
                        <Stack
                            spacing={2.5}
                            alignItems="center"
                        >
                            <Typography
                                variant="h4"
                                fontWeight={800}
                                align="center"
                            >
                                {t("Email Verification")}
                            </Typography>

                            {loading && (
                                <>
                                    <CircularProgress />

                                    <Typography
                                        color="text.secondary"
                                        align="center"
                                    >
                                        {t("Verifying your email address...")}
                                    </Typography>
                                </>
                            )}

                            {!loading && !token && (
                                <Alert
                                    severity="error"
                                    sx={{ width: "100%" }}
                                >
                                    {localError ||
                                        t("This verification link is invalid or incomplete.")}
                                </Alert>
                            )}

                            {!loading && token && (localError || error) && (
                                <Alert
                                    severity="error"
                                    sx={{ width: "100%" }}
                                >
                                    {localError || error}
                                </Alert>
                            )}

                            {!loading && completed && (
                                <>
                                    <Alert
                                        severity="success"
                                        sx={{ width: "100%" }}
                                    >
                                        {message}
                                    </Alert>

                                    <Button
                                        component={Link}
                                        to="/login"
                                        variant="contained"
                                        fullWidth
                                        sx={{ borderRadius: 2.5 }}
                                    >
                                        {t("Continue to Login")}
                                    </Button>
                                </>
                            )}

                            {!loading && !completed && token && (
                                <Button
                                    component={Link}
                                    to="/login"
                                    variant="outlined"
                                    fullWidth
                                    sx={{ borderRadius: 2.5 }}
                                >
                                    {t("Back to Login")}
                                </Button>
                            )}
                        </Stack>
                    </CardContent>
                </Card>
            </Box>
        </Container>
    );
};

export default VerifyEmail;