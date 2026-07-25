import React, { useEffect, useState } from "react";
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
  TextField,
  Typography,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import { GoogleLogin } from "@react-oauth/google";
import { useDispatch, useSelector } from "react-redux";
import { login, googleLogin } from "../../redux/actions/authActions";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { loading, error, isAuthenticated } = useSelector(
    (state) => state.auth
  );

  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const [snackbarOpen, setSnackbarOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      setSnackbarOpen(true);

      setTimeout(() => {
        navigate("/dashboard");
      }, 800);
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(login(credentials));
  };

  const handleGoogleSuccess = (response) => {
    dispatch(googleLogin(response.credential));
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
        }}
      >
        <Card sx={{ width: "100%" }}>
          <CardContent>

            <Typography
              variant="h4"
              align="center"
              gutterBottom
            >
              {t("Login")}
            </Typography>

            <Typography
              variant="body2"
              align="center"
              color="text.secondary"
              mb={3}
            >
              {t("Welcome to RoamAgro")}
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>

              <TextField
                fullWidth
                margin="normal"
                name="email"
                label={t("Email Address")}
                value={credentials.email}
                onChange={handleChange}
              />

              <TextField
                fullWidth
                margin="normal"
                name="password"
                type={showPassword ? "text" : "password"}
                label={t("Password")}
                value={credentials.password}
                onChange={handleChange}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">

                      <IconButton
                        onClick={() =>
                          setShowPassword(!showPassword)
                        }
                      >
                        {showPassword
                          ? <VisibilityOff />
                          : <Visibility />}
                      </IconButton>

                    </InputAdornment>
                  ),
                }}
              />

              <Button
                fullWidth
                variant="contained"
                sx={{ mt: 3 }}
                disabled={loading}
                type="submit"
              >
                {loading
                  ? <CircularProgress size={24} color="inherit" />
                  : t("SIGN IN")}
              </Button>

            </form>

            <Box
              mt={3}
              display="flex"
              justifyContent="center"
            >
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => {}}
              />
            </Box>

            <Typography
              align="center"
              mt={3}
            >
              {t("Don't have an account?")}{" "}
              <Link to="/register">
                {t("Register")}
              </Link>
            </Typography>

          </CardContent>
        </Card>
      </Box>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
      >
        <Alert severity="success">
          {t("Login successful")}
        </Alert>
      </Snackbar>

    </Container>
  );
};

export default Login;