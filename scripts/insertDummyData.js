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
for (let i = 0; i < 10; i++) {
  for (let j = 0; j < 10; j++) {
    dummyPatients.push({
      firstName: maleNames[j],
      lastName: lastNames[i],
      sex: 'male',
      dateOfBirth: getRandomBirthday()
    })
  }
}


console.log(dummyPatients)