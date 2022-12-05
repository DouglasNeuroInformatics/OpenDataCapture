type Data = { [key: string]: string };

class APIError extends Error {
  constructor(public status: number, public statusText: string) {
    super(`${status}: ${statusText}`);
    this.name = 'APIError';
  }
}

export default class API {
  private static get host() {
    const host = process.env['NEXT_PUBLIC_API_HOST'];
    if (!host) {
      throw new Error('NEXT_PUBLIC_API_HOST must be defined!');
    }
    return host;
  }

  private static checkResponse(response: Response) {
    if (!response.ok) {
      throw new APIError(response.status, response.statusText);
    }
  }

  static async addPatient(data: Data) {
    const response = await fetch(`${this.host}/api/patient`, {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    this.checkResponse(response);
  }

  static async deletePatient(id: string) {
    const response = await fetch(`${this.host}/api/patient/${id}`, {
      method: 'DELETE'
    });
    this.checkResponse(response);
  }

  static async getPatients() {
    const response = await fetch(`${this.host}/api/patient`);
    if (!response.ok) {
      console.error(response.status, response.statusText);
      return;
    }
    return response.json();
  }

  static async addHappinessScale(data: Data) {
    const response = await fetch(`${this.host}/api/instrument/happiness-scale`, {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    this.checkResponse(response);
  }

  static async getHappinessScalesForPatient(id: string) {
    const response = await fetch(`${this.host}/api/instrument/happiness-scale/${id}`);
    if (!response.ok) {
      console.error(response.status, response.statusText);
      return;
    }
    return response.json();
  }
}
