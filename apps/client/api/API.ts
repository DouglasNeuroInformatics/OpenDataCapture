type Data = { [key: string]: string };

export default class API {
  private static host = 'http://localhost:5500';

  static async addPatient(data: Data) {
    const response = await fetch(`${this.host}/api/patient`, {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    this.alertUser(response);
  }

  static async deletePatient(id: string) {
    const response = await fetch(`${this.host}/api/patient/${id}`, {
      method: 'DELETE'
    });
    this.alertUser(response);
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
    this.alertUser(response);
  }

  static async getHappinessScalesForPatient(id: string) {
    const response = await fetch(`${this.host}/api/instrument/happiness-scale/${id}`);
    if (!response.ok) {
      console.error(response.status, response.statusText);
      return;
    }
    return response.json();
  }

  private static alertUser(response: Response) {
    response.ok ? alert('Success!') : alert(`An Error Occurred: ${response.status} ${response.statusText}`);
  }
}
