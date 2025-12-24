import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/main.css'

import { PrivyProvider } from '@privy-io/react-auth';

ReactDOM.createRoot(document.getElementById('app')).render(
  <React.StrictMode>
    <PrivyProvider
      appId="cm7xqm1h800psbxctvvnwt0na"
      config={{
        loginMethods: ['email', 'wallet', 'google', 'twitter', 'discord'],
        appearance: {
          theme: 'light',
          accentColor: '#676FFF',
        },
      }}
    >
      <App />
    </PrivyProvider>
  </React.StrictMode>,
)
