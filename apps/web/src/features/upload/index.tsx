import { type RouteObject } from 'react-router-dom';

import { UploadSelectPage } from './pages/UploadSelectPage';

export const uploadRoute: RouteObject = {
  children: [
    {
      element: <UploadSelectPage />,
      index: true
    },
    {
      path: ':id' //instrument id
      // element: <UploadDataPage/>
    }
  ],
  path: 'upload'
};
