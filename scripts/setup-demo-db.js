db = connect('mongodb://localhost:27017/demo_v2');

db.dropDatabase();

db.instruments.insertOne({
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
});

db.users.insertMany([
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
