import { type RouteObject } from 'react-router-dom';

export const uploadRoute: RouteObject = {
  children: [
    {
      index: true
      // element: <SelectUploadPage />
    },
    {
      path: ':id' //instrument id
      // element: <UploadDataPage/>
    }
  ],
  path: 'upload'
};
