// src/index.js
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

async function main() {
  if (process.env.NODE_ENV === 'development') {
    if (window.location.pathname === '/login') {
      window.location.pathname = '/login/';
      return;
    }

    const { worker } = require('./mocks/browser');

    await worker.start({
      serviceWorker: {
        url: '/login/mockServiceWorker.js'
      }
    });
  }

  ReactDOM.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
    document.getElementById('root')
  );
}

main();
