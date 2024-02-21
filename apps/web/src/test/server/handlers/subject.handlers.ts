import { HttpResponse, http } from 'msw';

export const SubjectHandlers = [
  //list of possible subject, Get request when the user enters the view subjects page
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
      }
    ]);
  }),

  //api to get assigmnents of the subject
  http.get('/v1/assignments?subjectId=a869b577da44ffa8cca3bba7c7a9d90b77acc934d37c79d1c8be8afa89293d71', () => {
    return HttpResponse.json([]);
  }),

  //get response for the happiness questionnaire of the selected subject
  http.get(
    '/v1/instrument-records?instrumentId=65d5179227e183f93166d4b2&kind=FORM&subjectId=a869b577da44ffa8cca3bba7c7a9d90b77acc934d37c79d1c8be8afa89293d71',
    () => {
      return HttpResponse.json([
        {
          __model__: 'InstrumentRecord',
          assignmentId: null,
          computedMeasures: { overallHappiness: 3 },
          createdAt: '2024-02-20T21:20:33.588Z',
          data: { overallHappiness: 3 },
          date: '2023-01-01T12:23:49.700Z',
          groupId: '65d5179e27e183f93166d4bc',
          id: '65d517a127e183f93166d4d6',
          instrument: {
            bundle:
              '(async()=>{const{InstrumentFactory:s}=await import("/runtime/v0.0.1/core.js"),{z:e}=await import("/runtime/v0.0.1/zod.js");return new s({kind:"FORM",language:["en","fr"],validationSchema:e.object({overallHappiness:e.number().int().gte(1).lte(10),reasonForSadness:e.string().optional()})}).defineInstrument({name:"HappinessQuestionnaire",tags:{en:["Well-Being"],fr:["Bien-\\xEAtre"]},version:1,content:{overallHappiness:{description:{en:"Overall happiness from 1 through 10 (inclusive)",fr:"Bonheur g\\xE9n\\xE9ral de 1 \\xE0 10 (inclus)"},kind:"numeric",label:{en:"Overall Happiness",fr:"Bonheur g\\xE9n\\xE9ral"},max:10,min:1,variant:"slider"},reasonForSadness:{deps:["overallHappiness"],kind:"dynamic",render:n=>!n?.overallHappiness||n.overallHappiness>=5?null:{label:{en:"Reason for Sadness",fr:"Raison de la tristesse"},isRequired:!1,kind:"text",variant:"long"}}},details:{description:{en:"The Happiness Questionnaire is a questionnaire about happiness.",fr:"Le questionnaire sur le bonheur est un questionnaire sur le bonheur."},estimatedDuration:1,instructions:{en:["Please answer the question based on your current feelings."],fr:["Veuillez r\\xE9pondre \\xE0 la question en fonction de vos sentiments actuels."]},license:"AGPL-3.0",title:{en:"Happiness Questionnaire",fr:"Questionnaire sur le bonheur"}},measures:{overallHappiness:{kind:"const",ref:"overallHappiness"}}})})();\n',
            kind: 'FORM'
          },
          instrumentId: '65d5179227e183f93166d4b2',
          subjectId: 'a869b577da44ffa8cca3bba7c7a9d90b77acc934d37c79d1c8be8afa89293d71',
          updatedAt: '2024-02-20T21:20:33.588Z'
        },
        {
          __model__: 'InstrumentRecord',
          assignmentId: null,
          computedMeasures: { overallHappiness: 1 },
          createdAt: '2024-02-20T21:20:33.593Z',
          data: { overallHappiness: 1 },
          date: '2023-03-23T23:29:03.498Z',
          groupId: '65d5179e27e183f93166d4bc',
          id: '65d517a127e183f93166d4d7',
          instrument: {
            bundle:
              '(async()=>{const{InstrumentFactory:s}=await import("/runtime/v0.0.1/core.js"),{z:e}=await import("/runtime/v0.0.1/zod.js");return new s({kind:"FORM",language:["en","fr"],validationSchema:e.object({overallHappiness:e.number().int().gte(1).lte(10),reasonForSadness:e.string().optional()})}).defineInstrument({name:"HappinessQuestionnaire",tags:{en:["Well-Being"],fr:["Bien-\\xEAtre"]},version:1,content:{overallHappiness:{description:{en:"Overall happiness from 1 through 10 (inclusive)",fr:"Bonheur g\\xE9n\\xE9ral de 1 \\xE0 10 (inclus)"},kind:"numeric",label:{en:"Overall Happiness",fr:"Bonheur g\\xE9n\\xE9ral"},max:10,min:1,variant:"slider"},reasonForSadness:{deps:["overallHappiness"],kind:"dynamic",render:n=>!n?.overallHappiness||n.overallHappiness>=5?null:{label:{en:"Reason for Sadness",fr:"Raison de la tristesse"},isRequired:!1,kind:"text",variant:"long"}}},details:{description:{en:"The Happiness Questionnaire is a questionnaire about happiness.",fr:"Le questionnaire sur le bonheur est un questionnaire sur le bonheur."},estimatedDuration:1,instructions:{en:["Please answer the question based on your current feelings."],fr:["Veuillez r\\xE9pondre \\xE0 la question en fonction de vos sentiments actuels."]},license:"AGPL-3.0",title:{en:"Happiness Questionnaire",fr:"Questionnaire sur le bonheur"}},measures:{overallHappiness:{kind:"const",ref:"overallHappiness"}}})})();\n',
            kind: 'FORM'
          },
          instrumentId: '65d5179227e183f93166d4b2',
          subjectId: 'a869b577da44ffa8cca3bba7c7a9d90b77acc934d37c79d1c8be8afa89293d71',
          updatedAt: '2024-02-20T21:20:33.593Z'
        },
        {
          __model__: 'InstrumentRecord',
          assignmentId: null,
          computedMeasures: { overallHappiness: 1 },
          createdAt: '2024-02-20T21:20:33.596Z',
          data: { overallHappiness: 1 },
          date: '2022-08-19T19:34:02.205Z',
          groupId: '65d5179e27e183f93166d4bc',
          id: '65d517a127e183f93166d4d8',
          instrument: {
            bundle:
              '(async()=>{const{InstrumentFactory:s}=await import("/runtime/v0.0.1/core.js"),{z:e}=await import("/runtime/v0.0.1/zod.js");return new s({kind:"FORM",language:["en","fr"],validationSchema:e.object({overallHappiness:e.number().int().gte(1).lte(10),reasonForSadness:e.string().optional()})}).defineInstrument({name:"HappinessQuestionnaire",tags:{en:["Well-Being"],fr:["Bien-\\xEAtre"]},version:1,content:{overallHappiness:{description:{en:"Overall happiness from 1 through 10 (inclusive)",fr:"Bonheur g\\xE9n\\xE9ral de 1 \\xE0 10 (inclus)"},kind:"numeric",label:{en:"Overall Happiness",fr:"Bonheur g\\xE9n\\xE9ral"},max:10,min:1,variant:"slider"},reasonForSadness:{deps:["overallHappiness"],kind:"dynamic",render:n=>!n?.overallHappiness||n.overallHappiness>=5?null:{label:{en:"Reason for Sadness",fr:"Raison de la tristesse"},isRequired:!1,kind:"text",variant:"long"}}},details:{description:{en:"The Happiness Questionnaire is a questionnaire about happiness.",fr:"Le questionnaire sur le bonheur est un questionnaire sur le bonheur."},estimatedDuration:1,instructions:{en:["Please answer the question based on your current feelings."],fr:["Veuillez r\\xE9pondre \\xE0 la question en fonction de vos sentiments actuels."]},license:"AGPL-3.0",title:{en:"Happiness Questionnaire",fr:"Questionnaire sur le bonheur"}},measures:{overallHappiness:{kind:"const",ref:"overallHappiness"}}})})();\n',
            kind: 'FORM'
          },
          instrumentId: '65d5179227e183f93166d4b2',
          subjectId: 'a869b577da44ffa8cca3bba7c7a9d90b77acc934d37c79d1c8be8afa89293d71',
          updatedAt: '2024-02-20T21:20:33.596Z'
        },
        {
          __model__: 'InstrumentRecord',
          assignmentId: null,
          computedMeasures: { overallHappiness: 5 },
          createdAt: '2024-02-20T21:20:33.600Z',
          data: { overallHappiness: 5 },
          date: '2022-08-28T07:55:03.806Z',
          groupId: '65d5179e27e183f93166d4bc',
          id: '65d517a127e183f93166d4d9',
          instrument: {
            bundle:
              '(async()=>{const{InstrumentFactory:s}=await import("/runtime/v0.0.1/core.js"),{z:e}=await import("/runtime/v0.0.1/zod.js");return new s({kind:"FORM",language:["en","fr"],validationSchema:e.object({overallHappiness:e.number().int().gte(1).lte(10),reasonForSadness:e.string().optional()})}).defineInstrument({name:"HappinessQuestionnaire",tags:{en:["Well-Being"],fr:["Bien-\\xEAtre"]},version:1,content:{overallHappiness:{description:{en:"Overall happiness from 1 through 10 (inclusive)",fr:"Bonheur g\\xE9n\\xE9ral de 1 \\xE0 10 (inclus)"},kind:"numeric",label:{en:"Overall Happiness",fr:"Bonheur g\\xE9n\\xE9ral"},max:10,min:1,variant:"slider"},reasonForSadness:{deps:["overallHappiness"],kind:"dynamic",render:n=>!n?.overallHappiness||n.overallHappiness>=5?null:{label:{en:"Reason for Sadness",fr:"Raison de la tristesse"},isRequired:!1,kind:"text",variant:"long"}}},details:{description:{en:"The Happiness Questionnaire is a questionnaire about happiness.",fr:"Le questionnaire sur le bonheur est un questionnaire sur le bonheur."},estimatedDuration:1,instructions:{en:["Please answer the question based on your current feelings."],fr:["Veuillez r\\xE9pondre \\xE0 la question en fonction de vos sentiments actuels."]},license:"AGPL-3.0",title:{en:"Happiness Questionnaire",fr:"Questionnaire sur le bonheur"}},measures:{overallHappiness:{kind:"const",ref:"overallHappiness"}}})})();\n',
            kind: 'FORM'
          },
          instrumentId: '65d5179227e183f93166d4b2',
          subjectId: 'a869b577da44ffa8cca3bba7c7a9d90b77acc934d37c79d1c8be8afa89293d71',
          updatedAt: '2024-02-20T21:20:33.600Z'
        },
        {
          __model__: 'InstrumentRecord',
          assignmentId: null,
          computedMeasures: { overallHappiness: 6 },
          createdAt: '2024-02-20T21:20:33.604Z',
          data: { overallHappiness: 6 },
          date: '2024-01-16T10:14:15.691Z',
          groupId: '65d5179e27e183f93166d4bc',
          id: '65d517a127e183f93166d4da',
          instrument: {
            bundle:
              '(async()=>{const{InstrumentFactory:s}=await import("/runtime/v0.0.1/core.js"),{z:e}=await import("/runtime/v0.0.1/zod.js");return new s({kind:"FORM",language:["en","fr"],validationSchema:e.object({overallHappiness:e.number().int().gte(1).lte(10),reasonForSadness:e.string().optional()})}).defineInstrument({name:"HappinessQuestionnaire",tags:{en:["Well-Being"],fr:["Bien-\\xEAtre"]},version:1,content:{overallHappiness:{description:{en:"Overall happiness from 1 through 10 (inclusive)",fr:"Bonheur g\\xE9n\\xE9ral de 1 \\xE0 10 (inclus)"},kind:"numeric",label:{en:"Overall Happiness",fr:"Bonheur g\\xE9n\\xE9ral"},max:10,min:1,variant:"slider"},reasonForSadness:{deps:["overallHappiness"],kind:"dynamic",render:n=>!n?.overallHappiness||n.overallHappiness>=5?null:{label:{en:"Reason for Sadness",fr:"Raison de la tristesse"},isRequired:!1,kind:"text",variant:"long"}}},details:{description:{en:"The Happiness Questionnaire is a questionnaire about happiness.",fr:"Le questionnaire sur le bonheur est un questionnaire sur le bonheur."},estimatedDuration:1,instructions:{en:["Please answer the question based on your current feelings."],fr:["Veuillez r\\xE9pondre \\xE0 la question en fonction de vos sentiments actuels."]},license:"AGPL-3.0",title:{en:"Happiness Questionnaire",fr:"Questionnaire sur le bonheur"}},measures:{overallHappiness:{kind:"const",ref:"overallHappiness"}}})})();\n',
            kind: 'FORM'
          },
          instrumentId: '65d5179227e183f93166d4b2',
          subjectId: 'a869b577da44ffa8cca3bba7c7a9d90b77acc934d37c79d1c8be8afa89293d71',
          updatedAt: '2024-02-20T21:20:33.604Z'
        },
        {
          __model__: 'InstrumentRecord',
          assignmentId: null,
          computedMeasures: { overallHappiness: 5 },
          createdAt: '2024-02-20T21:20:33.609Z',
          data: { overallHappiness: 5 },
          date: '2022-09-21T12:57:51.280Z',
          groupId: '65d5179e27e183f93166d4bc',
          id: '65d517a127e183f93166d4db',
          instrument: {
            bundle:
              '(async()=>{const{InstrumentFactory:s}=await import("/runtime/v0.0.1/core.js"),{z:e}=await import("/runtime/v0.0.1/zod.js");return new s({kind:"FORM",language:["en","fr"],validationSchema:e.object({overallHappiness:e.number().int().gte(1).lte(10),reasonForSadness:e.string().optional()})}).defineInstrument({name:"HappinessQuestionnaire",tags:{en:["Well-Being"],fr:["Bien-\\xEAtre"]},version:1,content:{overallHappiness:{description:{en:"Overall happiness from 1 through 10 (inclusive)",fr:"Bonheur g\\xE9n\\xE9ral de 1 \\xE0 10 (inclus)"},kind:"numeric",label:{en:"Overall Happiness",fr:"Bonheur g\\xE9n\\xE9ral"},max:10,min:1,variant:"slider"},reasonForSadness:{deps:["overallHappiness"],kind:"dynamic",render:n=>!n?.overallHappiness||n.overallHappiness>=5?null:{label:{en:"Reason for Sadness",fr:"Raison de la tristesse"},isRequired:!1,kind:"text",variant:"long"}}},details:{description:{en:"The Happiness Questionnaire is a questionnaire about happiness.",fr:"Le questionnaire sur le bonheur est un questionnaire sur le bonheur."},estimatedDuration:1,instructions:{en:["Please answer the question based on your current feelings."],fr:["Veuillez r\\xE9pondre \\xE0 la question en fonction de vos sentiments actuels."]},license:"AGPL-3.0",title:{en:"Happiness Questionnaire",fr:"Questionnaire sur le bonheur"}},measures:{overallHappiness:{kind:"const",ref:"overallHappiness"}}})})();\n',
            kind: 'FORM'
          },
          instrumentId: '65d5179227e183f93166d4b2',
          subjectId: 'a869b577da44ffa8cca3bba7c7a9d90b77acc934d37c79d1c8be8afa89293d71',
          updatedAt: '2024-02-20T21:20:33.609Z'
        },
        {
          __model__: 'InstrumentRecord',
          assignmentId: null,
          computedMeasures: { overallHappiness: 3 },
          createdAt: '2024-02-20T21:20:33.613Z',
          data: { overallHappiness: 3 },
          date: '2022-06-18T05:47:57.138Z',
          groupId: '65d5179e27e183f93166d4bc',
          id: '65d517a127e183f93166d4dc',
          instrument: {
            bundle:
              '(async()=>{const{InstrumentFactory:s}=await import("/runtime/v0.0.1/core.js"),{z:e}=await import("/runtime/v0.0.1/zod.js");return new s({kind:"FORM",language:["en","fr"],validationSchema:e.object({overallHappiness:e.number().int().gte(1).lte(10),reasonForSadness:e.string().optional()})}).defineInstrument({name:"HappinessQuestionnaire",tags:{en:["Well-Being"],fr:["Bien-\\xEAtre"]},version:1,content:{overallHappiness:{description:{en:"Overall happiness from 1 through 10 (inclusive)",fr:"Bonheur g\\xE9n\\xE9ral de 1 \\xE0 10 (inclus)"},kind:"numeric",label:{en:"Overall Happiness",fr:"Bonheur g\\xE9n\\xE9ral"},max:10,min:1,variant:"slider"},reasonForSadness:{deps:["overallHappiness"],kind:"dynamic",render:n=>!n?.overallHappiness||n.overallHappiness>=5?null:{label:{en:"Reason for Sadness",fr:"Raison de la tristesse"},isRequired:!1,kind:"text",variant:"long"}}},details:{description:{en:"The Happiness Questionnaire is a questionnaire about happiness.",fr:"Le questionnaire sur le bonheur est un questionnaire sur le bonheur."},estimatedDuration:1,instructions:{en:["Please answer the question based on your current feelings."],fr:["Veuillez r\\xE9pondre \\xE0 la question en fonction de vos sentiments actuels."]},license:"AGPL-3.0",title:{en:"Happiness Questionnaire",fr:"Questionnaire sur le bonheur"}},measures:{overallHappiness:{kind:"const",ref:"overallHappiness"}}})})();\n',
            kind: 'FORM'
          },
          instrumentId: '65d5179227e183f93166d4b2',
          subjectId: 'a869b577da44ffa8cca3bba7c7a9d90b77acc934d37c79d1c8be8afa89293d71',
          updatedAt: '2024-02-20T21:20:33.613Z'
        },
        {
          __model__: 'InstrumentRecord',
          assignmentId: null,
          computedMeasures: { overallHappiness: 4 },
          createdAt: '2024-02-20T21:20:33.617Z',
          data: { overallHappiness: 4 },
          date: '2023-10-22T18:06:38.693Z',
          groupId: '65d5179e27e183f93166d4bc',
          id: '65d517a127e183f93166d4dd',
          instrument: {
            bundle:
              '(async()=>{const{InstrumentFactory:s}=await import("/runtime/v0.0.1/core.js"),{z:e}=await import("/runtime/v0.0.1/zod.js");return new s({kind:"FORM",language:["en","fr"],validationSchema:e.object({overallHappiness:e.number().int().gte(1).lte(10),reasonForSadness:e.string().optional()})}).defineInstrument({name:"HappinessQuestionnaire",tags:{en:["Well-Being"],fr:["Bien-\\xEAtre"]},version:1,content:{overallHappiness:{description:{en:"Overall happiness from 1 through 10 (inclusive)",fr:"Bonheur g\\xE9n\\xE9ral de 1 \\xE0 10 (inclus)"},kind:"numeric",label:{en:"Overall Happiness",fr:"Bonheur g\\xE9n\\xE9ral"},max:10,min:1,variant:"slider"},reasonForSadness:{deps:["overallHappiness"],kind:"dynamic",render:n=>!n?.overallHappiness||n.overallHappiness>=5?null:{label:{en:"Reason for Sadness",fr:"Raison de la tristesse"},isRequired:!1,kind:"text",variant:"long"}}},details:{description:{en:"The Happiness Questionnaire is a questionnaire about happiness.",fr:"Le questionnaire sur le bonheur est un questionnaire sur le bonheur."},estimatedDuration:1,instructions:{en:["Please answer the question based on your current feelings."],fr:["Veuillez r\\xE9pondre \\xE0 la question en fonction de vos sentiments actuels."]},license:"AGPL-3.0",title:{en:"Happiness Questionnaire",fr:"Questionnaire sur le bonheur"}},measures:{overallHappiness:{kind:"const",ref:"overallHappiness"}}})})();\n',
            kind: 'FORM'
          },
          instrumentId: '65d5179227e183f93166d4b2',
          subjectId: 'a869b577da44ffa8cca3bba7c7a9d90b77acc934d37c79d1c8be8afa89293d71',
          updatedAt: '2024-02-20T21:20:33.617Z'
        },
        {
          __model__: 'InstrumentRecord',
          assignmentId: null,
          computedMeasures: { overallHappiness: 9 },
          createdAt: '2024-02-20T21:20:33.621Z',
          data: { overallHappiness: 9 },
          date: '2022-07-30T18:15:31.498Z',
          groupId: '65d5179e27e183f93166d4bc',
          id: '65d517a127e183f93166d4de',
          instrument: {
            bundle:
              '(async()=>{const{InstrumentFactory:s}=await import("/runtime/v0.0.1/core.js"),{z:e}=await import("/runtime/v0.0.1/zod.js");return new s({kind:"FORM",language:["en","fr"],validationSchema:e.object({overallHappiness:e.number().int().gte(1).lte(10),reasonForSadness:e.string().optional()})}).defineInstrument({name:"HappinessQuestionnaire",tags:{en:["Well-Being"],fr:["Bien-\\xEAtre"]},version:1,content:{overallHappiness:{description:{en:"Overall happiness from 1 through 10 (inclusive)",fr:"Bonheur g\\xE9n\\xE9ral de 1 \\xE0 10 (inclus)"},kind:"numeric",label:{en:"Overall Happiness",fr:"Bonheur g\\xE9n\\xE9ral"},max:10,min:1,variant:"slider"},reasonForSadness:{deps:["overallHappiness"],kind:"dynamic",render:n=>!n?.overallHappiness||n.overallHappiness>=5?null:{label:{en:"Reason for Sadness",fr:"Raison de la tristesse"},isRequired:!1,kind:"text",variant:"long"}}},details:{description:{en:"The Happiness Questionnaire is a questionnaire about happiness.",fr:"Le questionnaire sur le bonheur est un questionnaire sur le bonheur."},estimatedDuration:1,instructions:{en:["Please answer the question based on your current feelings."],fr:["Veuillez r\\xE9pondre \\xE0 la question en fonction de vos sentiments actuels."]},license:"AGPL-3.0",title:{en:"Happiness Questionnaire",fr:"Questionnaire sur le bonheur"}},measures:{overallHappiness:{kind:"const",ref:"overallHappiness"}}})})();\n',
            kind: 'FORM'
          },
          instrumentId: '65d5179227e183f93166d4b2',
          subjectId: 'a869b577da44ffa8cca3bba7c7a9d90b77acc934d37c79d1c8be8afa89293d71',
          updatedAt: '2024-02-20T21:20:33.621Z'
        },
        {
          __model__: 'InstrumentRecord',
          assignmentId: null,
          computedMeasures: { overallHappiness: 9 },
          createdAt: '2024-02-20T21:20:33.626Z',
          data: { overallHappiness: 9 },
          date: '2023-07-26T17:13:15.405Z',
          groupId: '65d5179e27e183f93166d4bc',
          id: '65d517a127e183f93166d4df',
          instrument: {
            bundle:
              '(async()=>{const{InstrumentFactory:s}=await import("/runtime/v0.0.1/core.js"),{z:e}=await import("/runtime/v0.0.1/zod.js");return new s({kind:"FORM",language:["en","fr"],validationSchema:e.object({overallHappiness:e.number().int().gte(1).lte(10),reasonForSadness:e.string().optional()})}).defineInstrument({name:"HappinessQuestionnaire",tags:{en:["Well-Being"],fr:["Bien-\\xEAtre"]},version:1,content:{overallHappiness:{description:{en:"Overall happiness from 1 through 10 (inclusive)",fr:"Bonheur g\\xE9n\\xE9ral de 1 \\xE0 10 (inclus)"},kind:"numeric",label:{en:"Overall Happiness",fr:"Bonheur g\\xE9n\\xE9ral"},max:10,min:1,variant:"slider"},reasonForSadness:{deps:["overallHappiness"],kind:"dynamic",render:n=>!n?.overallHappiness||n.overallHappiness>=5?null:{label:{en:"Reason for Sadness",fr:"Raison de la tristesse"},isRequired:!1,kind:"text",variant:"long"}}},details:{description:{en:"The Happiness Questionnaire is a questionnaire about happiness.",fr:"Le questionnaire sur le bonheur est un questionnaire sur le bonheur."},estimatedDuration:1,instructions:{en:["Please answer the question based on your current feelings."],fr:["Veuillez r\\xE9pondre \\xE0 la question en fonction de vos sentiments actuels."]},license:"AGPL-3.0",title:{en:"Happiness Questionnaire",fr:"Questionnaire sur le bonheur"}},measures:{overallHappiness:{kind:"const",ref:"overallHappiness"}}})})();\n',
            kind: 'FORM'
          },
          instrumentId: '65d5179227e183f93166d4b2',
          subjectId: 'a869b577da44ffa8cca3bba7c7a9d90b77acc934d37c79d1c8be8afa89293d71',
          updatedAt: '2024-02-20T21:20:33.626Z'
        }
      ]);
    }
  ),

  //handlers for graph page

  http.get('/v1/instrument-records/linear-model?instrumentId=655f861deb97aff8dc4f0c82', () => {
    return HttpResponse.json({
      overallHappiness: { intercept: 9.00818540326624, slope: -2.2446620053625115e-12, stdErr: 1.3275462348873016e-11 }
    });
  })
];
