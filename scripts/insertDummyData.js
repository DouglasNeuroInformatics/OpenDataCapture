const { createHash } = require("crypto");

const maleNames = [
  "James",
  "Robert",
  "John",
  "Michael",
  "David",
  "William",
  "Richard",
  "Joseph",
  "Thomas",
  "Charles",
];
const femaleNames = [
  "Mary",
  "Patricia",
  "Jennifer",
  "Linda",
  "Elizabeth",
  "Barbara",
  "Susan",
  "Jessica",
  "Sarah",
  "Karen",
];
const lastNames = [
  "Smith",
  "Johnson",
  "Williams",
  "Brown",
  "Jones",
  "Garcia",
  "Miller",
  "Davis",
  "Rodriguez",
  "Martinez",
];

function getRandomInteger(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function getRandomDate(start, end) {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
}

function getRandomBirthday() {
  return getRandomDate(new Date(1950, 0), new Date(2000, 0));
}

const dummyPatients = [];
const dummyHappinessQuestionnaires = [];
for (let i = 0; i < 10; i++) {
  for (let j = 0; j < 10; j++) {
    const malePatientId = createHash("sha256")
      .update(maleNames[j] + lastNames[i])
      .digest("hex");
    const femalePatientId = createHash("sha256")
      .update(femaleNames[j] + lastNames[i])
      .digest("hex");
    dummyPatients.push({
      _id: malePatientId,
      firstName: maleNames[j],
      lastName: lastNames[i],
      sex: "male",
      dateOfBirth: getRandomBirthday(),
    });
    dummyPatients.push({
      _id: femalePatientId,
      firstName: femaleNames[j],
      lastName: lastNames[i],
      sex: "female",
      dateOfBirth: getRandomBirthday(),
    });
    for (let n = 0; n < getRandomInteger(0, 5); n++) {
      dummyHappinessQuestionnaires.push({
        patientId: malePatientId,
        score: getRandomInteger(1, 11),
        createdAt: getRandomDate(new Date(2022, 0), new Date()),
      });
      dummyHappinessQuestionnaires.push({
        patientId: femalePatientId,
        score: getRandomInteger(1, 11),
        createdAt: getRandomDate(new Date(2022, 0), new Date()),
      });
    }
  }
}

db = connect("mongodb://mongo:27017/main");
db.patients.drop();
db.happinessquestionnaires.drop();
db.patients.insertMany(dummyPatients);
db.happinessquestionnaires.insertMany(dummyHappinessQuestionnaires);
