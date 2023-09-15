/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

import React from 'react';
import ReactDOM from 'react-dom/client';

import { App } from './App';
import './main.css';

ReactDOM.hydrateRoot(document, <App />);
