import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import './styles/theme';
import App from './App';
import './i18n';

import { BrowserRouter } from 'react-router-dom';

ReactDOM.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
  document.getElementById('root')
);