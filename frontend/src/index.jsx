import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { Provider as RollbarProvider, ErrorBoundary } from '@rollbar/react'
import Rollbar from 'rollbar'

import store from './app/store'
import App from './App.jsx'

import 'bootstrap/dist/css/bootstrap.min.css'

import './i18n'

import leoProfanity from 'leo-profanity'

const dictionary = leoProfanity.getDictionary('en')
const ruDictionary = leoProfanity.getDictionary('ru')
leoProfanity.add(dictionary)
leoProfanity.add(ruDictionary)

window.leoProfanity = leoProfanity

const rollbarConfig = {
  accessToken: 'dc1a89b1fa0042b59cc489fb8b716e64',
  environment: 'testenv',
}

const rollbar = new Rollbar(rollbarConfig)

const root = ReactDOM.createRoot(document.getElementById('root'))

root.render(
  <React.StrictMode>
    <RollbarProvider instance={rollbar}>
      <ErrorBoundary>
        <Provider store={store}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </Provider>
      </ErrorBoundary>
    </RollbarProvider>
  </React.StrictMode>,
)
