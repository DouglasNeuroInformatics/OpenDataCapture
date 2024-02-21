import { HttpResponse, http } from 'msw';

export const SubjectHandlers = [
  http.get('/v1/subjects', () => {
    return HttpResponse.json([
      {
        __model__: 'Subject',
        createdAt: '2024-02-20T21:20:33.479Z',
        dateOfBirth: '1987-03-07T03:38:36.157Z',
        firstName: 'Meta',
        groupIds: ['65d5179e27e183f93166d4bc'],
        id: 'a869b577da44ffa8cca3bba7c7a9d90b77acc934d37c79d1c8be8afa89293d71',
        lastName: 'Keebler',
        sex: 'FEMALE',
        updatedAt: '2024-02-20T21:20:33.486Z'
      },
      {
        __model__: 'Subject',
        createdAt: '2024-02-20T21:20:33.714Z',
        dateOfBirth: '1979-02-10T18:56:27.754Z',
        firstName: 'Arturo',
        groupIds: ['65d5179e27e183f93166d4bc'],
        id: '14f94c0b2f2817e524e793c41c893ea700ba7d9f8df079abb4fe2afdc66e7949',
        lastName: 'Fahey',
        sex: 'FEMALE',
        updatedAt: '2024-02-20T21:20:33.716Z'
      },
      {
        __model__: 'Subject',
        createdAt: '2024-02-20T21:20:33.916Z',
        dateOfBirth: '1982-10-21T09:37:31.542Z',
        firstName: 'Trevor',
        groupIds: ['65d5179e27e183f93166d4bd'],
        id: '525c933ee689ebfc593b302aafaa76cd79b3be5379543fa414a3b1c19e4ea798',
        lastName: 'Ryan',
        sex: 'FEMALE',
        updatedAt: '2024-02-20T21:20:33.918Z'
      },
      {
        __model__: 'Subject',
        createdAt: '2024-02-20T21:20:34.123Z',
        dateOfBirth: '1967-12-01T01:45:35.163Z',
        firstName: 'Marcelina',
        groupIds: ['65d5179e27e183f93166d4bc'],
        id: 'df8e9565be232fc9aa2c15f42f550dd4bb86cd6d0bffd58d669d5e1894e62425',
        lastName: 'Stokes',
        sex: 'FEMALE',
        updatedAt: '2024-02-20T21:20:34.125Z'
      },
      {
        __model__: 'Subject',
        createdAt: '2024-02-20T21:20:34.314Z',
        dateOfBirth: '1944-06-26T10:57:24.581Z',
        firstName: 'Domenica',
        groupIds: ['65d5179e27e183f93166d4bc'],
        id: '3345f47e4ca798b3612cd54f0bf0198c82abd77dda297e8b10fa16d66133124d',
        lastName: 'Hane-Herzog',
        sex: 'FEMALE',
        updatedAt: '2024-02-20T21:20:34.316Z'
      },
      {
        __model__: 'Subject',
        createdAt: '2024-02-20T21:20:34.514Z',
        dateOfBirth: '1982-02-23T03:49:44.823Z',
        firstName: 'Helene',
        groupIds: ['65d5179e27e183f93166d4bd'],
        id: 'ebebf0eb4a90342c40ffa8f3b668ba2a1587d333314e08a7f3277e7b7da186d4',
        lastName: 'Schaefer',
        sex: 'MALE',
        updatedAt: '2024-02-20T21:20:34.516Z'
      },
      {
        __model__: 'Subject',
        createdAt: '2024-02-20T21:20:34.701Z',
        dateOfBirth: '1989-12-28T03:07:08.633Z',
        firstName: 'Dolly',
        groupIds: ['65d5179e27e183f93166d4bc'],
        id: '9fe8495827553bdb43bc92540646334fd8ef7562a03b9b22016b1e0e723455b9',
        lastName: 'Lakin',
        sex: 'MALE',
        updatedAt: '2024-02-20T21:20:34.703Z'
      },
      {
        __model__: 'Subject',
        createdAt: '2024-02-20T21:20:34.887Z',
        dateOfBirth: '1987-11-08T03:10:28.180Z',
        firstName: 'Emmie',
        groupIds: ['65d5179e27e183f93166d4bd'],
        id: '4e3c243b069e27e34d822a98a7e3d72e0ba499ce6541269bd31d07e032349104',
        lastName: 'Kovacek-Kuphal',
        sex: 'FEMALE',
        updatedAt: '2024-02-20T21:20:34.890Z'
      },
      {
        __model__: 'Subject',
        createdAt: '2024-02-20T21:20:35.074Z',
        dateOfBirth: '1959-03-02T04:13:51.633Z',
        firstName: 'Stephon',
        groupIds: ['65d5179e27e183f93166d4bc'],
        id: '97de8a10723a0ddfd6d4982b084930eff36be29accde6b96e2e9828aa3fbd5cf',
        lastName: 'Bechtelar',
        sex: 'FEMALE',
        updatedAt: '2024-02-20T21:20:35.076Z'
      },
      {
        __model__: 'Subject',
        createdAt: '2024-02-20T21:20:35.255Z',
        dateOfBirth: '1946-12-26T03:09:39.401Z',
        firstName: 'Jakob',
        groupIds: ['65d5179e27e183f93166d4bc'],
        id: 'ce0fecf2d906c6f066c09258cbb9b112fa2c105230a12a3e14003c289235456c',
        lastName: 'Baumbach',
        sex: 'FEMALE',
        updatedAt: '2024-02-20T21:20:35.258Z'
      },
      {
        __model__: 'Subject',
        createdAt: '2024-02-20T21:20:35.461Z',
        dateOfBirth: '1974-12-09T15:33:40.867Z',
        firstName: 'Jarret',
        groupIds: ['65d5179e27e183f93166d4bc'],
        id: 'fb8dd2ebbf7e3e5528165e7188325ea98ab1d5ecee40c5522e6c111f73b460a9',
        lastName: 'Lebsack-Schaefer',
        sex: 'FEMALE',
        updatedAt: '2024-02-20T21:20:35.463Z'
      },
      {
        __model__: 'Subject',
        createdAt: '2024-02-20T21:20:35.678Z',
        dateOfBirth: '1963-07-25T01:12:47.136Z',
        firstName: 'Naomi',
        groupIds: ['65d5179e27e183f93166d4bc'],
        id: '0ebbf5e89369762282b62b42af5649ac90556dea960aff7bd2908a73231a1b48',
        lastName: 'Okuneva',
        sex: 'FEMALE',
        updatedAt: '2024-02-20T21:20:35.681Z'
      },
      {
        __model__: 'Subject',
        createdAt: '2024-02-20T21:20:35.875Z',
        dateOfBirth: '1999-03-24T19:46:00.604Z',
        firstName: 'Adella',
        groupIds: ['65d5179e27e183f93166d4bd'],
        id: 'fd5074843eb1ac2fa76372efb9c7d63a29845579c3dd2743d65141316e5091d9',
        lastName: 'Morissette',
        sex: 'FEMALE',
        updatedAt: '2024-02-20T21:20:35.877Z'
      },
      {
        __model__: 'Subject',
        createdAt: '2024-02-20T21:20:36.070Z',
        dateOfBirth: '1979-07-15T10:28:36.329Z',
        firstName: 'Ethyl',
        groupIds: ['65d5179e27e183f93166d4bd'],
        id: '318314e7e61e71d372ff4cea7a187137c92be66ecb89293c031220f7265d06e5',
        lastName: 'Smith',
        sex: 'MALE',
        updatedAt: '2024-02-20T21:20:36.072Z'
      },
      {
        __model__: 'Subject',
        createdAt: '2024-02-20T21:20:36.260Z',
        dateOfBirth: '1974-05-20T19:00:16.377Z',
        firstName: 'Brisa',
        groupIds: ['65d5179e27e183f93166d4bd'],
        id: '9aafec9e95dfd361876a89a39febd833d67f028c9fb1b100e2e744a31ad5c9af',
        lastName: 'Larson',
        sex: 'FEMALE',
        updatedAt: '2024-02-20T21:20:36.262Z'
      },
      {
        __model__: 'Subject',
        createdAt: '2024-02-21T15:50:49.193Z',
        dateOfBirth: '1989-02-14T05:00:00.000Z',
        firstName: 'oiejsosofo',
        groupIds: [],
        id: '5c7a60f82e71ab28a46aff22ad60d8379a1f003ee5764ba4f6743063ceecfa99',
        lastName: 'joafjoeajfo',
        sex: 'MALE',
        updatedAt: '2024-02-21T15:50:49.193Z'
      },
      {
        __model__: 'Subject',
        createdAt: '2024-02-21T15:54:31.079Z',
        dateOfBirth: '1965-02-09T05:00:00.000Z',
        firstName: 'fdfokasof',
        groupIds: [],
        id: '4c7d6593b0f1d10abd8db0a3d6341d68b2baeb50083412a0245348e7deae3a4d',
        lastName: 'fafwfef',
        sex: 'MALE',
        updatedAt: '2024-02-21T15:54:31.079Z'
      },
      {
        __model__: 'Subject',
        createdAt: '2024-02-21T16:55:07.890Z',
        dateOfBirth: '1995-02-20T05:00:00.000Z',
        firstName: 'dsfesf',
        groupIds: [],
        id: 'faefe4ea448f46d276d7db7210bfe9f4a13a24f12e08e178e557c813b1250d81',
        lastName: 'efseff',
        sex: 'MALE',
        updatedAt: '2024-02-21T16:55:07.890Z'
      },
      {
        __model__: 'Subject',
        createdAt: '2024-02-21T16:58:43.448Z',
        dateOfBirth: '1973-02-21T05:00:00.000Z',
        firstName: 'fsfefe',
        groupIds: [],
        id: '4f8e20eb3b6805dc52fcae2a378e73343ecb623493e21e9c6be7317cecf63d1a',
        lastName: 'fesfsefe',
        sex: 'MALE',
        updatedAt: '2024-02-21T16:58:43.448Z'
      },
      {
        __model__: 'Subject',
        createdAt: '2024-02-21T17:00:19.734Z',
        dateOfBirth: '1970-02-16T05:00:00.000Z',
        firstName: 'esfefefe',
        groupIds: [],
        id: 'cc5186f6976c54e4579903e5c5ae67ed0c2e610617861b887ca28b780efa7285',
        lastName: 'efsefesfes',
        sex: 'FEMALE',
        updatedAt: '2024-02-21T17:00:19.734Z'
      }
    ]);
  }),
  http.get(
    '/v1/assignments/summary?subjectIdentifier=d7c6060b1b6df7ffc54ef306fec25470af518268c17058aedc4f28b752102a7b',
    () => {
      return HttpResponse.json([]);
    }
  ),

  http.get('/v1/assignments?subjectId=a869b577da44ffa8cca3bba7c7a9d90b77acc934d37c79d1c8be8afa89293d71', () => {
    return HttpResponse.json([]);
  }),

  http.get(
    '/v1/instrument-records?instrumentId=6557bcdc930d9604d635551c&subjectIdentifier=d7c6060b1b6df7ffc54ef306fec25470af518268c17058aedc4f28b752102a7b',
    () => {
      return HttpResponse.json([
        {
          computedMeasures: {
            overallHappiness: 3
          },
          createdAt: '2023-11-17T19:19:57.595Z',
          data: {
            overallHappiness: 3
          },
          date: '2022-09-28T10:23:13.696Z',
          group: '6557bcdc930d9604d6355528',
          id: '6557bcdd930d9604d63555a8',
          instrument: '6557bcdc930d9604d635551c',
          subject: '6557bcdd930d9604d6355539',
          updatedAt: '2023-11-17T19:19:57.595Z'
        },
        {
          computedMeasures: { overallHappiness: 5 },
          createdAt: '2023-11-23T17:04:32.650Z',
          data: { overallHappiness: 5 },
          date: '2022-05-31T03:39:02.806Z',
          group: '655f861eeb97aff8dc4f0c8e',
          id: '655f8620eb97aff8dc4f0d1d',
          instrument: '655f861deb97aff8dc4f0c82',
          subject: '655f861eeb97aff8dc4f0c9f',
          updatedAt: '2023-11-23T17:04:32.650Z'
        },
        {
          computedMeasures: { overallHappiness: 6 },
          createdAt: '2023-11-23T17:04:32.723Z',
          data: { overallHappiness: 6 },
          date: '2023-10-19T05:58:14.760Z',
          group: '655f861eeb97aff8dc4f0c8e',
          id: '655f8620eb97aff8dc4f0d22',
          instrument: '655f861deb97aff8dc4f0c82',
          subject: '655f861eeb97aff8dc4f0c9f',
          updatedAt: '2023-11-23T17:04:32.723Z'
        },
        {
          computedMeasures: { overallHappiness: 5 },
          createdAt: '2023-11-23T17:04:32.807Z',
          data: { overallHappiness: 5 },
          date: '2022-06-24T08:41:50.419Z',
          group: '655f861eeb97aff8dc4f0c8e',
          id: '655f8620eb97aff8dc4f0d27',
          instrument: '655f861deb97aff8dc4f0c82',
          subject: '655f861eeb97aff8dc4f0c9f',
          updatedAt: '2023-11-23T17:04:32.807Z'
        },
        {
          computedMeasures: { overallHappiness: 3 },
          createdAt: '2023-11-23T17:04:32.878Z',
          data: { overallHappiness: 3 },
          date: '2022-03-21T01:31:56.355Z',
          group: '655f861eeb97aff8dc4f0c8e',
          id: '655f8620eb97aff8dc4f0d2c',
          instrument: '655f861deb97aff8dc4f0c82',
          subject: '655f861eeb97aff8dc4f0c9f',
          updatedAt: '2023-11-23T17:04:32.878Z'
        },
        {
          computedMeasures: { overallHappiness: 4 },
          createdAt: '2023-11-23T17:04:32.950Z',
          data: { overallHappiness: 4 },
          date: '2023-07-25T13:50:37.977Z',
          group: '655f861eeb97aff8dc4f0c8e',
          id: '655f8620eb97aff8dc4f0d31',
          instrument: '655f861deb97aff8dc4f0c82',
          subject: '655f861eeb97aff8dc4f0c9f',
          updatedAt: '2023-11-23T17:04:32.950Z'
        },
        {
          computedMeasures: { overallHappiness: 9 },
          createdAt: '2023-11-23T17:04:33.022Z',
          data: { overallHappiness: 9 },
          date: '2022-05-02T13:59:30.850Z',
          group: '655f861eeb97aff8dc4f0c8e',
          id: '655f8621eb97aff8dc4f0d36',
          instrument: '655f861deb97aff8dc4f0c82',
          subject: '655f861eeb97aff8dc4f0c9f',
          updatedAt: '2023-11-23T17:04:33.022Z'
        },
        {
          computedMeasures: { overallHappiness: 9 },
          createdAt: '2023-11-23T17:04:33.094Z',
          data: { overallHappiness: 9 },
          date: '2023-04-28T12:57:14.825Z',
          group: '655f861eeb97aff8dc4f0c8e',
          id: '655f8621eb97aff8dc4f0d3b',
          instrument: '655f861deb97aff8dc4f0c82',
          subject: '655f861eeb97aff8dc4f0c9f',
          updatedAt: '2023-11-23T17:04:33.094Z'
        }
      ]);
    }
  ),

  //handlers for graph page

  http.get('/v1/instrument-records/linear-model?instrumentId=655f861deb97aff8dc4f0c82', () => {
    return HttpResponse.json();
  }),

  http.get(
    '/v1/instrument-records?instrumentId=655f861deb97aff8dc4f0c82&subjectIdentifier=d7c6060b1b6df7ffc54ef306fec25470af518268c17058aedc4f28b752102a7b',
    () => {
      return HttpResponse.json();
    }
  )
];
