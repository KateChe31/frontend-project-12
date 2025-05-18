import React from 'react';  
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';           
import store from './app/store';                 
import App from './App.jsx';

import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import './i18n';

// Настройка словаря фильтрации
import leoProfanity from 'leo-profanity';

const dictionary = leoProfanity.getDictionary('en'); // английский
const ruDictionary = leoProfanity.getDictionary('ru'); // русский

leoProfanity.add(dictionary);
leoProfanity.add(ruDictionary);

window.leoProfanity = leoProfanity;

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <Provider store={store}>                       
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
);
