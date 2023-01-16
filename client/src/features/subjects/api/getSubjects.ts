import axios from 'axios';
import { Subject } from 'common';

export const getSubjects = (): Promise<Subject[]> => {
  return axios.get('/api/subjects');
};
