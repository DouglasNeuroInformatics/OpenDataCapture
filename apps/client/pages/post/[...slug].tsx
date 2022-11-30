import React from 'react';

import { useRouter } from 'next/router';

const PostPage = () => {
  const router = useRouter();
  console.log(router.query); // array of all params

  return <h1>Post</h1>;
};

export default PostPage;
