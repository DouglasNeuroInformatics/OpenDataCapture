import { type RouteObject } from 'react-router-dom';

export const uploadRoute: RouteObject = {
  children: [
    {
      path: ':id' //instrument id
      // element: <UploadDataPage/>
    }
  ],
  path: 'upload'
};
