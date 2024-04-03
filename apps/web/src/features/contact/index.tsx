/* eslint-disable perfectionist/sort-objects */

import React from 'react';

import type { RouteObject } from 'react-router-dom';

import { ContactPage } from './pages/ContactPage';

export const contactRoute: RouteObject = {
  path: 'contact',
  element: <ContactPage />
};
