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

import { useDispatch, useSelector } from "react-redux";
import { register } from "../../redux/actions/authActions";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { loading, error, isAuthenticated } =
    useSelector((state) => state.auth);
  const [showPassword, setShowPassword] =
    useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [snackbarOpen, setSnackbarOpen] =
    useState(false);
  useEffect(() => {
    if (isAuthenticated) {
      setSnackbarOpen(true);
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    }
  }, [isAuthenticated, navigate]);
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(register(formData));
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
            >
              {t("Register New User")}
            </Typography>
            <Typography
              variant="body2"
              align="center"
              color="text.secondary"
              mb={3}
            >
              {t("Create your RoamAgro account")}
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
                name="name"
                label={t("Name")}
                value={formData.name}
                onChange={handleChange}
              />
              <TextField
                fullWidth
                margin="normal"
                name="email"
                label={t("Email Address")}
                value={formData.email}
                onChange={handleChange}
              />
              <TextField
                fullWidth
                margin="normal"
                name="password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                label={t("Password")}
                value={formData.password}
                onChange={handleChange}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() =>
                          setShowPassword(
                            !showPassword
                          )
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
                  ? (
                    <CircularProgress
                      size={24}
                      color="inherit"
                    />
                  )
                  : t("Register")}
              </Button>
            </form>
            <Typography
              align="center"
              mt={3}
            >
              {t("Already have an account?")}{" "}
              <Link to="/login">
                {t("Login")}
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
          {t("Registration successful")}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Register;