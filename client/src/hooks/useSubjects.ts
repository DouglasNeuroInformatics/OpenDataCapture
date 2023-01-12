import { useState } from 'react';

import { subjectSchema } from 'common';
import { useQuery } from 'react-query';
import { z } from 'zod';

export default function useSubjects() {
  return useQuery('Subjects', async () => {
    const response = await fetch(`${import.meta.env.VITE_API_HOST}/api/subjects`);
    return response.json();
  });
}
