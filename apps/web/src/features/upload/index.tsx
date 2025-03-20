import type { RouteObject } from 'react-router-dom';

import { UploadPage } from './pages/UploadPage';
import { UploadSelectPage } from './pages/UploadSelectPage';

export const uploadRoute: RouteObject = {
  children: [
    {
      element: <UploadSelectPage />,
      index: true
    },
    {
      element: <UploadPage />,
      path: ':id' //instrument id
    }
  ],
  path: 'upload'
};
