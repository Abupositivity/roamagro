import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { login, googleLogin } from '../../redux/actions/authActions';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Typography, Container, Box, Snackbar, Alert } from '@mui/material';
import { useTranslation } from 'react-i18next';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const handleGoogleSuccess = (response) => {
    const token = response.credential;
    dispatch(googleLogin(token, navigate));
    console.log(t("Google login successful"));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(login(credentials, navigate));
    console.log(t("Login successful"));
    setSnackbarMessage(t("Login successful"));
    setSnackbarOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials({ ...credentials, [name]: value });
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">{t('Login')}</Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="email"
            label={t("Email Address")}
            name="email"
            autoComplete="email"
            autoFocus
            onChange={handleChange}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="password"
            label={t("Password")}
            type="password"
            id="password"
            autoComplete="current-password"
            onChange={handleChange}
          />
          <Button type="submit" fullWidth variant="contained" color="primary" sx={{ mt: 3, mb: 2 }}>
            {t("SIGN IN")}
          </Button>
        </Box>
        <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => console.error(t("Google login failed. Please try again."))} />
        <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={() => setSnackbarOpen(false)}>
          <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%' }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
};

export default Login;