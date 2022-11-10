const { createHash } = require('crypto')

const maleNames = ['James', 'Robert', 'John', 'Michael', 'David', 'William', 'Richard', 'Joseph', 'Thomas', 'Charles'];
const femaleNames = ['Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan', 'Jessica', 'Sarah', 'Karen'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];

function getRandomInteger(min, max) {
  return Math.floor(Math.random() * (max - min) ) + min;
}

function getRandomBirthday() {
  const year = getRandomInteger(1950, 2000);
  const month = getRandomInteger(0, 12);
  const day = getRandomInteger(0, 29);
  return new Date(year, month, day);
}

const dummyPatients = []
const dummyHappinessQuestionnaires = []
for (let i = 0; i < 10; i++) {
  for (let j = 0; j < 10; j++) {
    const malePatientId = createHash('sha256').update(maleNames[j] + lastNames[i]).digest('hex')
    const femalePatientId = createHash('sha256').update(femaleNames[j] + lastNames[i]).digest('hex')
    dummyPatients.push({
      _id: malePatientId,
      firstName: maleNames[j],
      lastName: lastNames[i],
      sex: 'male',
      dateOfBirth: getRandomBirthday()
    })
    dummyPatients.push({
      _id: femalePatientId,
      firstName: femaleNames[j],
      lastName: lastNames[i],
      sex: 'female',
      dateOfBirth: getRandomBirthday()
    })
    for (let n = 0; n < getRandomInteger(0, 5); n++) {
      dummyHappinessQuestionnaires.push({
        patientId: malePatientId,
        score: getRandomInteger(1, 11)
      })
      dummyHappinessQuestionnaires.push({
        patientId: femalePatientId,
        score: getRandomInteger(1, 11)
      })
    }
  }
}
db = connect('mongodb://mongo:27017/main');
db.patients.drop()
db.happinessquestionnaires.drop()
db.patients.insertMany(dummyPatients);
db.happinessquestionnaires.insertMany(dummyHappinessQuestionnaires);