type Sex = 'Male' | 'Female';


export default class Patient {
  id: number;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  sex: Sex;

  constructor(firstName: string, lastName: string, dateOfBirth: Date, sex: Sex) {
    this.id = Math.random(),
    this.firstName = firstName;
    this.lastName = lastName;
    this.dateOfBirth = dateOfBirth;
    this.sex = sex;
  }
}
