const { createHash } = require('crypto');
const { MongoClient, ObjectId } = require ('mongodb');

class Random {
  static int(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  }

  static date(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  }

  static birthday() {
    return this.date(new Date(1950, 0), new Date(2000, 0));
  }
}

class StringUtils {
  static isInt(s) {
    return s ? parseInt(s).toString().length === s.length : false;
  }

  static sanitize(s, allowNumericChars = false, validSpecialChars = /[-\s]/g) {
    s = s
      .toUpperCase()
      .replace(validSpecialChars, '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
    const invalidRegExp = allowNumericChars ? /[^A-Z0-9]/g : /[^A-Z]/g;
    const invalidChars = s.toUpperCase().match(invalidRegExp);
    if (invalidChars) {
      throw new Error(`The following characters are invalid: ${invalidChars.join(', ')}`);
    }
    return s;
  }
}


function createSubjectId(firstName, lastName, dateOfBirth) {
  const shortDateOfBirth = dateOfBirth.toISOString().split('T')[0];
  const source = StringUtils.sanitize(firstName + lastName) + StringUtils.sanitize(shortDateOfBirth, true);
  return createHash('sha256').update(source).digest('hex');
}

const maleNames = ['James', 'Robert', 'John', 'Michael', 'David', 'William', 'Richard', 'Joseph', 'Thomas', 'Charles'];

const femaleNames = [
  'Mary',
  'Patricia',
  'Jennifer',
  'Linda',
  'Elizabeth',
  'Barbara',
  'Susan',
  'Jessica',
  'Sarah',
  'Karen'
];

const lastNames = [
  'Smith',
  'Johnson',
  'Williams',
  'Brown',
  'Jones',
  'Garcia',
  'Miller',
  'Davis',
  'Rodriguez',
  'Martinez'
];


function computeScore(timepoint, sex) {
  if (sex === 'female') {
    return Math.min(Random.int(1 + timepoint * 2, 11), 10);
  }
  return Random.int(1, 11);
}

async function main() {
  const uri = "mongodb://localhost:27017/development";
  const client = new MongoClient(uri);
  await client.connect();
  console.log('success!')

  const db = await client.db()

  db.dropDatabase();

  const demoHappy = await db.collection('demoHappy');
  const demo = await db.collection('demo');
  const instruments = await db.collection('instruments');
  const instrumentrecords = await db.collection('instrumentrecords');
  const subjects = await db.collection('subjects');
  const users = await db.collection('users');

  const hqId = new ObjectId();
  const edId = new ObjectId();

  await instruments.insertMany([
    {
      _id: hqId,
      name: 'The Happiness Questionnaire',
      description:
        "The Happiness Questionnaire is a survey that asks questions about an individual's feelings of contentment, satisfaction, and well-being. It includes questions about daily activities, social connections, and overall life satisfaction.",
      instructions:
        'To complete the questionnaire, you should read each question carefully and consider your personal experiences and feelings before choosing the response that best reflects your thoughts and feelings. It is important to answer all questions honestly and to the best of your ability. Once you have finished answering all of the questions, you should submit the questionnaire. It is important to be as honest and accurate as possible when completing a happiness questionnaire, as the results can be used to identify areas of your life that may be contributing to your overall sense of well-being.',
      estimatedDuration: 1,
      version: 1.0,
      fields: [
        {
          name: 'overallHappiness',
          label: 'Overall Happiness',
          isRequired: true,
          type: 'text'
        }
      ]
    },
    {
      _id: edId,
      name: 'Sample Eating Disorder Questionnaire',
      description: "This is a sample eating disorder questionnaire",
      instructions: 'Please respond to the following questions',
      estimatedDuration: 2,
      version: 1.0,
      fields: [
        {
          name: 'weight',
          label: 'Weight (lbs)',
          isRequired: true,
          type: 'text'
        },
        {
          name: 'disorderedEating',
          label: 'Disordered Eating (1-10)',
          isRequired: true,
          type: 'text'
        }
      ]
    }
  ]);

  await users.insertMany([
    {
      username: 'user',
      password: '$2b$10$zJ0AcNILpw3paByOtjGGAeosh5YVnPpnlPFjAVuy0e2ONj5MOLhvC',
      role: 'user'
    },
    {
      username: 'admin',
      password: '$2b$10$8OyRj59zTpqLYeI7rYYO0eOTMktg6g8yBWl5vt0Uf31DvoPYgB.3e',
      role: 'admin'
    }
  ]);

  
  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 10; j++) {
      for (const sex of ['male', 'female']) {
        const firstName = sex === 'male' ? maleNames[j] : femaleNames[j];
        const lastName = lastNames[i];
        const dateOfBirth = Random.birthday();
        const subjectId = createSubjectId(firstName, lastName, dateOfBirth);
        const subject = {
          _id: subjectId,
          firstName: firstName,
          lastName: lastName,
          sex: sex,
          dateOfBirth: dateOfBirth,
          createdAt: new Date()
        };
        await subjects.insertOne(subject);

        for (let n = 0; n < 4; n++) {
          const creationDate = Random.date(new Date(2022, 0 + n), new Date(2022, 6));
          const hqRecord = {
            subjectId: subjectId,
            instrument: hqId,
            instrumentName: 'eatingQuestionnaire',
            createdAt: creationDate,
            creationDateStr: creationDate.toISOString().split('-')[0] + "-" + creationDate.toISOString().split('-')[1],
            sex: sex,
            responses: {
              weight: 200,
              disorderedEating: computeScore(n, sex),
            }
          };

          await instrumentrecords.insertOne(hqRecord)
        }
      }
    }
  }

  await demo.insertMany([
    {
      month: 'January 2020',
      avgScoreMale: 8,
      avgScoreFemale: 6
    },
    {
      month: 'February 2020',
      avgScoreMale: 7.5,
      avgScoreFemale: 6.5
    },
    {
      month: 'March 2020',
      avgScoreMale: 6,
      avgScoreFemale: 8
    },
    {
      month: 'April 2020',
      avgScoreMale: 7,
      avgScoreFemale: 8.1
    }
  ])

  await demoHappy.insertMany([
    {
      month: 'January 2020',
      avgScoreMale: 8,
      avgScoreFemale: 6
    },
    {
      month: 'February 2020',
      avgScoreMale: 7.5,
      avgScoreFemale: 6.5
    },
    {
      month: 'March 2020',
      avgScoreMale: 6,
      avgScoreFemale: 8
    },
    {
      month: 'April 2020',
      avgScoreMale: 7,
      avgScoreFemale: 8.1
    }
  ])

  console.log(await db.listCollections().toArray())

  await client.close();
}

main()

/*


*/