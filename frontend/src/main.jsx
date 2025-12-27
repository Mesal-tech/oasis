import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store';
import App from './App';
import './styles/main.css';

import { PrivyProvider } from '@privy-io/react-auth';

const APP_ID = import.meta.env.VITE_PRIVY_APP_ID;

if (!APP_ID) {
  throw new Error('Missing Privy App ID');
}

ReactDOM.createRoot(document.getElementById('app')).render(
  <React.StrictMode>
    <Provider store={store}>
      <PrivyProvider
        appId={APP_ID}
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
    </Provider>
  </React.StrictMode>,
)
