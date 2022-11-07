import type Patient from '~/models/Patient';

export default async function postPatient(patient: Patient) {
  const response = await fetch('/api/patients', {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(patient)
  });
  return new Promise((resolve, reject) => {
    response.ok ? resolve(response.status) : reject(response.status);
  });
}