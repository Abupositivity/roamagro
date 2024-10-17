import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { login, googleLogin } from '../../redux/actions/authActions';
import { Button, TextField, Typography, Container } from '@mui/material';
import { useTranslation } from 'react-i18next';

const Login = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    dispatch(login({ email, password }));
  };

  return (
    <Container maxWidth="xs">
      <Typography variant="h5">{t('login')}</Typography>
      <form onSubmit={handleLogin}>
        <TextField
          fullWidth
          label="Email"
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          fullWidth
          label="Password"
          type="password"
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button type="submit" color="primary" variant="contained" fullWidth>
          {t('login')}
        </Button>
        <Button onClick={googleLogin} color="secondary" variant="outlined" fullWidth>
          {t('login')} with Google
        </Button>
      </form>
    </Container>
  );
};

export default Login;