import { HttpResponse, http } from 'msw';

export const SubjectHandlers = [
  //list of possible subject, Get request when the user enters the view subjects page
  http.get('/v1/subjects', () => {
    return HttpResponse.json([
      {
        __model__: 'Subject',
        createdAt: '2024-03-05T14:49:18.650Z',
        dateOfBirth: '1987-03-07T03:38:36.157Z',
        firstName: null,
        groupIds: [],
        id: '19c68118c1f5e170001a1a87316621e0d28158e1adb7fc037ef491e9ad427214',
        lastName: null,
        sex: 'FEMALE',
        updatedAt: '2024-03-05T14:49:18.650Z'
      },
      {
        __model__: 'Subject',
        createdAt: '2024-03-05T14:49:18.657Z',
        dateOfBirth: '1987-03-07T03:38:36.157Z',
        firstName: null,
        groupIds: ['65e730ee4344d866399e41f2'],
        id: 'aafe26c37d782a6cce81efd0ac766c696a53178a01676fcb029de1e62c1db7e0',
        lastName: null,
        sex: 'FEMALE',
        updatedAt: '2024-03-05T14:49:18.659Z'
      },
      {
        __model__: 'Subject',
        createdAt: '2024-03-05T14:49:18.907Z',
        dateOfBirth: '1979-02-10T18:56:27.754Z',
        firstName: null,
        groupIds: [],
        id: 'e260b9244e92c7d71e6537c6a3b0b8d9b050c3775e8ae3949d55efc9e22bc6ce',
        lastName: null,
        sex: 'FEMALE',
        updatedAt: '2024-03-05T14:49:18.907Z'
      },
      {
        __model__: 'Subject',
        createdAt: '2024-03-05T14:49:18.909Z',
        dateOfBirth: '1979-02-10T18:56:27.754Z',
        firstName: null,
        groupIds: ['65e730ee4344d866399e41f1'],
        id: '585dfb13106cfc07f93e1690a04009ed5f9de585b32a41d8306ce6f328f80f8b',
        lastName: null,
        sex: 'FEMALE',
        updatedAt: '2024-03-05T14:49:18.910Z'
      },
      {
        __model__: 'Subject',
        createdAt: '2024-03-05T14:49:19.165Z',
        dateOfBirth: '1982-10-21T09:37:31.542Z',
        firstName: null,
        groupIds: [],
        id: 'a2b8c0385fe8fd19cf2fce262687218dd056e4471e2ad121b32f91a1c3ef8388',
        lastName: null,
        sex: 'FEMALE',
        updatedAt: '2024-03-05T14:49:19.165Z'
      },
      {
        __model__: 'Subject',
        createdAt: '2024-03-05T14:49:19.167Z',
        dateOfBirth: '1982-10-21T09:37:31.542Z',
        firstName: null,
        groupIds: ['65e730ee4344d866399e41f2'],
        id: '91956f031b7ddff33c51fe69041b3d661ef893096b35e5a58c88ac1dd2e3fde6',
        lastName: null,
        sex: 'FEMALE',
        updatedAt: '2024-03-05T14:49:19.169Z'
      },
      {
        __model__: 'Subject',
        createdAt: '2024-03-05T14:49:19.413Z',
        dateOfBirth: '1967-12-01T01:45:35.163Z',
        firstName: null,
        groupIds: [],
        id: '9441a3d7626dce13e18a0918e2980f63ed75e8a8eaf3227bb4e5fdc9d77892f1',
        lastName: null,
        sex: 'FEMALE',
        updatedAt: '2024-03-05T14:49:19.413Z'
      },
      {
        __model__: 'Subject',
        createdAt: '2024-03-05T14:49:19.415Z',
        dateOfBirth: '1967-12-01T01:45:35.163Z',
        firstName: null,
        groupIds: ['65e730ee4344d866399e41f2'],
        id: '4c17d41a3f2f4f16f32cfe3113e33100d00768e0f9acb5967ea6463c5e716f6b',
        lastName: null,
        sex: 'FEMALE',
        updatedAt: '2024-03-05T14:49:19.417Z'
      },
      {
        __model__: 'Subject',
        createdAt: '2024-03-05T14:49:19.656Z',
        dateOfBirth: '1944-06-26T10:57:24.581Z',
        firstName: null,
        groupIds: [],
        id: '2633a86dccc9c13022acd25f1b071572e1b02d91e2155922774a8e778460e302',
        lastName: null,
        sex: 'FEMALE',
        updatedAt: '2024-03-05T14:49:19.656Z'
      },
      {
        __model__: 'Subject',
        createdAt: '2024-03-05T14:49:19.659Z',
        dateOfBirth: '1944-06-26T10:57:24.581Z',
        firstName: null,
        groupIds: ['65e730ee4344d866399e41f1'],
        id: '73517fae586ab22cbaf14701970b617f673031e50f05cd1550d89127342c75c1',
        lastName: null,
        sex: 'FEMALE',
        updatedAt: '2024-03-05T14:49:19.661Z'
      },
      {
        __model__: 'Subject',
        createdAt: '2024-03-05T14:49:19.901Z',
        dateOfBirth: '1982-02-23T03:49:44.823Z',
        firstName: null,
        groupIds: [],
        id: '8cb3080f066056b445bffe7afdd0d937691c10d3493c31556eb440c05b9f9214',
        lastName: null,
        sex: 'MALE',
        updatedAt: '2024-03-05T14:49:19.901Z'
      },
      {
        __model__: 'Subject',
        createdAt: '2024-03-05T14:49:19.903Z',
        dateOfBirth: '1982-02-23T03:49:44.823Z',
        firstName: null,
        groupIds: ['65e730ee4344d866399e41f2'],
        id: 'f666b4a56534adca710a02246eaeb8d25d266d8f4c668ab429094df1fae8c4f0',
        lastName: null,
        sex: 'MALE',
        updatedAt: '2024-03-05T14:49:19.905Z'
      },
      {
        __model__: 'Subject',
        createdAt: '2024-03-05T14:49:20.135Z',
        dateOfBirth: '1989-12-28T03:07:08.633Z',
        firstName: null,
        groupIds: [],
        id: '0aac255cef36078ed8ade727801667d7381cc264649c4c78c4cf66417316b6ae',
        lastName: null,
        sex: 'MALE',
        updatedAt: '2024-03-05T14:49:20.135Z'
      },
      {
        __model__: 'Subject',
        createdAt: '2024-03-05T14:49:20.137Z',
        dateOfBirth: '1989-12-28T03:07:08.633Z',
        firstName: null,
        groupIds: ['65e730ee4344d866399e41f2'],
        id: 'd001010d748866ff21436346757bc991311d8356c27500b70b728046db5f23d9',
        lastName: null,
        sex: 'MALE',
        updatedAt: '2024-03-05T14:49:20.139Z'
      },
      {
        __model__: 'Subject',
        createdAt: '2024-03-05T14:49:20.368Z',
        dateOfBirth: '1987-11-08T03:10:28.180Z',
        firstName: null,
        groupIds: [],
        id: '02106d99903ef3e63fb1e237b055c7b7dfda12aa0be339f5777c286501141595',
        lastName: null,
        sex: 'FEMALE',
        updatedAt: '2024-03-05T14:49:20.368Z'
      },
      {
        __model__: 'Subject',
        createdAt: '2024-03-05T14:49:20.371Z',
        dateOfBirth: '1987-11-08T03:10:28.180Z',
        firstName: null,
        groupIds: ['65e730ee4344d866399e41f2'],
        id: '8fe4e62c734a32bfefe23623e2bb21f323713a37c5501836c40b6b0cbb33cefe',
        lastName: null,
        sex: 'FEMALE',
        updatedAt: '2024-03-05T14:49:20.373Z'
      },
      {
        __model__: 'Subject',
        createdAt: '2024-03-05T14:49:20.605Z',
        dateOfBirth: '1959-03-02T04:13:51.633Z',
        firstName: null,
        groupIds: [],
        id: '4f168bc36d31b71daf58188dbe34933eeb93cd02adee84f6ca91f8bcbd655bd9',
        lastName: null,
        sex: 'FEMALE',
        updatedAt: '2024-03-05T14:49:20.605Z'
      }
    ]);
  }),

  //api to get assigmnents of the subject
  http.get('/v1/assignments?subjectId=19c68118c1f5e170001a1a87316621e0d28158e1adb7fc037ef491e9ad4', () => {
    return HttpResponse.json([]);
  }),

  //get response for the happiness questionnaire of the selected subject
  http.get(
    '/v1/instrument-records?instrumentId=65e730e24344d866399e41e8&kind=FORM&subjectId=19c68118c1f5e170001a1a87316621e0d28158e1adb7fc037ef491e9ad427214',
    () => {
      return HttpResponse.json([
        {
          createdAt: '2024-03-05T14:49:18.784Z',
          updatedAt: '2024-03-05T14:49:18.784Z',
          id: '65e730ee4344d866399e420b',
          data: {
            overallHappiness: 3
          },
          date: '2023-01-15T05:52:34.896Z',
          groupId: '65e730ee4344d866399e41f2',
          subjectId: '19c68118c1f5e170001a1a87316621e0d28158e1adb7fc037ef491e9ad427214',
          instrumentId: '65e730e24344d866399e41e8',
          assignmentId: null,
          instrument: {
            bundle:
              '(async()=>{const{InstrumentFactory:s}=await import("/runtime/v0.0.1/core.js"),{z:e}=await import("/runtime/v0.0.1/zod.js");return new s({kind:"FORM",language:["en","fr"],validationSchema:e.object({overallHappiness:e.number().int().gte(1).lte(10),reasonForSadness:e.string().optional()})}).defineInstrument({name:"HappinessQuestionnaire",tags:{en:["Well-Being"],fr:["Bien-\\xEAtre"]},version:1,content:{overallHappiness:{description:{en:"Overall happiness from 1 through 10 (inclusive)",fr:"Bonheur g\\xE9n\\xE9ral de 1 \\xE0 10 (inclus)"},kind:"numeric",label:{en:"Overall Happiness",fr:"Bonheur g\\xE9n\\xE9ral"},max:10,min:1,variant:"slider"},reasonForSadness:{deps:["overallHappiness"],kind:"dynamic",render:n=>!n?.overallHappiness||n.overallHappiness>=5?null:{label:{en:"Reason for Sadness",fr:"Raison de la tristesse"},isRequired:!1,kind:"text",variant:"long"}}},details:{description:{en:"The Happiness Questionnaire is a questionnaire about happiness.",fr:"Le questionnaire sur le bonheur est un questionnaire sur le bonheur."},estimatedDuration:1,instructions:{en:["Please answer the question based on your current feelings."],fr:["Veuillez r\\xE9pondre \\xE0 la question en fonction de vos sentiments actuels."]},license:"AGPL-3.0",title:{en:"Happiness Questionnaire",fr:"Questionnaire sur le bonheur"}},measures:{overallHappiness:{kind:"const",ref:"overallHappiness"}}})})();\n',
            kind: 'FORM'
          },
          computedMeasures: {
            overallHappiness: 3
          },
          __model__: 'InstrumentRecord'
        },
        {
          createdAt: '2024-03-05T14:49:18.787Z',
          updatedAt: '2024-03-05T14:49:18.787Z',
          id: '65e730ee4344d866399e420c',
          data: {
            overallHappiness: 1
          },
          date: '2023-04-06T16:57:48.693Z',
          groupId: '65e730ee4344d866399e41f2',
          subjectId: '19c68118c1f5e170001a1a87316621e0d28158e1adb7fc037ef491e9ad427214',
          instrumentId: '65e730e24344d866399e41e8',
          assignmentId: null,
          instrument: {
            bundle:
              '(async()=>{const{InstrumentFactory:s}=await import("/runtime/v0.0.1/core.js"),{z:e}=await import("/runtime/v0.0.1/zod.js");return new s({kind:"FORM",language:["en","fr"],validationSchema:e.object({overallHappiness:e.number().int().gte(1).lte(10),reasonForSadness:e.string().optional()})}).defineInstrument({name:"HappinessQuestionnaire",tags:{en:["Well-Being"],fr:["Bien-\\xEAtre"]},version:1,content:{overallHappiness:{description:{en:"Overall happiness from 1 through 10 (inclusive)",fr:"Bonheur g\\xE9n\\xE9ral de 1 \\xE0 10 (inclus)"},kind:"numeric",label:{en:"Overall Happiness",fr:"Bonheur g\\xE9n\\xE9ral"},max:10,min:1,variant:"slider"},reasonForSadness:{deps:["overallHappiness"],kind:"dynamic",render:n=>!n?.overallHappiness||n.overallHappiness>=5?null:{label:{en:"Reason for Sadness",fr:"Raison de la tristesse"},isRequired:!1,kind:"text",variant:"long"}}},details:{description:{en:"The Happiness Questionnaire is a questionnaire about happiness.",fr:"Le questionnaire sur le bonheur est un questionnaire sur le bonheur."},estimatedDuration:1,instructions:{en:["Please answer the question based on your current feelings."],fr:["Veuillez r\\xE9pondre \\xE0 la question en fonction de vos sentiments actuels."]},license:"AGPL-3.0",title:{en:"Happiness Questionnaire",fr:"Questionnaire sur le bonheur"}},measures:{overallHappiness:{kind:"const",ref:"overallHappiness"}}})})();\n',
            kind: 'FORM'
          },
          computedMeasures: {
            overallHappiness: 1
          },
          __model__: 'InstrumentRecord'
        },
        {
          createdAt: '2024-03-05T14:49:18.792Z',
          updatedAt: '2024-03-05T14:49:18.792Z',
          id: '65e730ee4344d866399e420d',
          data: {
            overallHappiness: 1
          },
          date: '2022-09-02T13:02:47.401Z',
          groupId: '65e730ee4344d866399e41f2',
          subjectId: '19c68118c1f5e170001a1a87316621e0d28158e1adb7fc037ef491e9ad427214',
          instrumentId: '65e730e24344d866399e41e8',
          assignmentId: null,
          instrument: {
            bundle:
              '(async()=>{const{InstrumentFactory:s}=await import("/runtime/v0.0.1/core.js"),{z:e}=await import("/runtime/v0.0.1/zod.js");return new s({kind:"FORM",language:["en","fr"],validationSchema:e.object({overallHappiness:e.number().int().gte(1).lte(10),reasonForSadness:e.string().optional()})}).defineInstrument({name:"HappinessQuestionnaire",tags:{en:["Well-Being"],fr:["Bien-\\xEAtre"]},version:1,content:{overallHappiness:{description:{en:"Overall happiness from 1 through 10 (inclusive)",fr:"Bonheur g\\xE9n\\xE9ral de 1 \\xE0 10 (inclus)"},kind:"numeric",label:{en:"Overall Happiness",fr:"Bonheur g\\xE9n\\xE9ral"},max:10,min:1,variant:"slider"},reasonForSadness:{deps:["overallHappiness"],kind:"dynamic",render:n=>!n?.overallHappiness||n.overallHappiness>=5?null:{label:{en:"Reason for Sadness",fr:"Raison de la tristesse"},isRequired:!1,kind:"text",variant:"long"}}},details:{description:{en:"The Happiness Questionnaire is a questionnaire about happiness.",fr:"Le questionnaire sur le bonheur est un questionnaire sur le bonheur."},estimatedDuration:1,instructions:{en:["Please answer the question based on your current feelings."],fr:["Veuillez r\\xE9pondre \\xE0 la question en fonction de vos sentiments actuels."]},license:"AGPL-3.0",title:{en:"Happiness Questionnaire",fr:"Questionnaire sur le bonheur"}},measures:{overallHappiness:{kind:"const",ref:"overallHappiness"}}})})();\n',
            kind: 'FORM'
          },
          computedMeasures: {
            overallHappiness: 1
          },
          __model__: 'InstrumentRecord'
        },
        {
          createdAt: '2024-03-05T14:49:18.795Z',
          updatedAt: '2024-03-05T14:49:18.795Z',
          id: '65e730ee4344d866399e420e',
          data: {
            overallHappiness: 5
          },
          date: '2022-09-11T01:23:49.002Z',
          groupId: '65e730ee4344d866399e41f2',
          subjectId: '19c68118c1f5e170001a1a87316621e0d28158e1adb7fc037ef491e9ad427214',
          instrumentId: '65e730e24344d866399e41e8',
          assignmentId: null,
          instrument: {
            bundle:
              '(async()=>{const{InstrumentFactory:s}=await import("/runtime/v0.0.1/core.js"),{z:e}=await import("/runtime/v0.0.1/zod.js");return new s({kind:"FORM",language:["en","fr"],validationSchema:e.object({overallHappiness:e.number().int().gte(1).lte(10),reasonForSadness:e.string().optional()})}).defineInstrument({name:"HappinessQuestionnaire",tags:{en:["Well-Being"],fr:["Bien-\\xEAtre"]},version:1,content:{overallHappiness:{description:{en:"Overall happiness from 1 through 10 (inclusive)",fr:"Bonheur g\\xE9n\\xE9ral de 1 \\xE0 10 (inclus)"},kind:"numeric",label:{en:"Overall Happiness",fr:"Bonheur g\\xE9n\\xE9ral"},max:10,min:1,variant:"slider"},reasonForSadness:{deps:["overallHappiness"],kind:"dynamic",render:n=>!n?.overallHappiness||n.overallHappiness>=5?null:{label:{en:"Reason for Sadness",fr:"Raison de la tristesse"},isRequired:!1,kind:"text",variant:"long"}}},details:{description:{en:"The Happiness Questionnaire is a questionnaire about happiness.",fr:"Le questionnaire sur le bonheur est un questionnaire sur le bonheur."},estimatedDuration:1,instructions:{en:["Please answer the question based on your current feelings."],fr:["Veuillez r\\xE9pondre \\xE0 la question en fonction de vos sentiments actuels."]},license:"AGPL-3.0",title:{en:"Happiness Questionnaire",fr:"Questionnaire sur le bonheur"}},measures:{overallHappiness:{kind:"const",ref:"overallHappiness"}}})})();\n',
            kind: 'FORM'
          },
          computedMeasures: {
            overallHappiness: 5
          },
          __model__: 'InstrumentRecord'
        },
        {
          createdAt: '2024-03-05T14:49:18.799Z',
          updatedAt: '2024-03-05T14:49:18.799Z',
          id: '65e730ee4344d866399e420f',
          data: {
            overallHappiness: 6
          },
          date: '2024-01-30T03:43:00.887Z',
          groupId: '65e730ee4344d866399e41f2',
          subjectId: '19c68118c1f5e170001a1a87316621e0d28158e1adb7fc037ef491e9ad427214',
          instrumentId: '65e730e24344d866399e41e8',
          assignmentId: null,
          instrument: {
            bundle:
              '(async()=>{const{InstrumentFactory:s}=await import("/runtime/v0.0.1/core.js"),{z:e}=await import("/runtime/v0.0.1/zod.js");return new s({kind:"FORM",language:["en","fr"],validationSchema:e.object({overallHappiness:e.number().int().gte(1).lte(10),reasonForSadness:e.string().optional()})}).defineInstrument({name:"HappinessQuestionnaire",tags:{en:["Well-Being"],fr:["Bien-\\xEAtre"]},version:1,content:{overallHappiness:{description:{en:"Overall happiness from 1 through 10 (inclusive)",fr:"Bonheur g\\xE9n\\xE9ral de 1 \\xE0 10 (inclus)"},kind:"numeric",label:{en:"Overall Happiness",fr:"Bonheur g\\xE9n\\xE9ral"},max:10,min:1,variant:"slider"},reasonForSadness:{deps:["overallHappiness"],kind:"dynamic",render:n=>!n?.overallHappiness||n.overallHappiness>=5?null:{label:{en:"Reason for Sadness",fr:"Raison de la tristesse"},isRequired:!1,kind:"text",variant:"long"}}},details:{description:{en:"The Happiness Questionnaire is a questionnaire about happiness.",fr:"Le questionnaire sur le bonheur est un questionnaire sur le bonheur."},estimatedDuration:1,instructions:{en:["Please answer the question based on your current feelings."],fr:["Veuillez r\\xE9pondre \\xE0 la question en fonction de vos sentiments actuels."]},license:"AGPL-3.0",title:{en:"Happiness Questionnaire",fr:"Questionnaire sur le bonheur"}},measures:{overallHappiness:{kind:"const",ref:"overallHappiness"}}})})();\n',
            kind: 'FORM'
          },
          computedMeasures: {
            overallHappiness: 6
          },
          __model__: 'InstrumentRecord'
        },
        {
          createdAt: '2024-03-05T14:49:18.803Z',
          updatedAt: '2024-03-05T14:49:18.803Z',
          id: '65e730ee4344d866399e4210',
          data: {
            overallHappiness: 5
          },
          date: '2022-10-05T06:26:36.475Z',
          groupId: '65e730ee4344d866399e41f2',
          subjectId: '19c68118c1f5e170001a1a87316621e0d28158e1adb7fc037ef491e9ad427214',
          instrumentId: '65e730e24344d866399e41e8',
          assignmentId: null,
          instrument: {
            bundle:
              '(async()=>{const{InstrumentFactory:s}=await import("/runtime/v0.0.1/core.js"),{z:e}=await import("/runtime/v0.0.1/zod.js");return new s({kind:"FORM",language:["en","fr"],validationSchema:e.object({overallHappiness:e.number().int().gte(1).lte(10),reasonForSadness:e.string().optional()})}).defineInstrument({name:"HappinessQuestionnaire",tags:{en:["Well-Being"],fr:["Bien-\\xEAtre"]},version:1,content:{overallHappiness:{description:{en:"Overall happiness from 1 through 10 (inclusive)",fr:"Bonheur g\\xE9n\\xE9ral de 1 \\xE0 10 (inclus)"},kind:"numeric",label:{en:"Overall Happiness",fr:"Bonheur g\\xE9n\\xE9ral"},max:10,min:1,variant:"slider"},reasonForSadness:{deps:["overallHappiness"],kind:"dynamic",render:n=>!n?.overallHappiness||n.overallHappiness>=5?null:{label:{en:"Reason for Sadness",fr:"Raison de la tristesse"},isRequired:!1,kind:"text",variant:"long"}}},details:{description:{en:"The Happiness Questionnaire is a questionnaire about happiness.",fr:"Le questionnaire sur le bonheur est un questionnaire sur le bonheur."},estimatedDuration:1,instructions:{en:["Please answer the question based on your current feelings."],fr:["Veuillez r\\xE9pondre \\xE0 la question en fonction de vos sentiments actuels."]},license:"AGPL-3.0",title:{en:"Happiness Questionnaire",fr:"Questionnaire sur le bonheur"}},measures:{overallHappiness:{kind:"const",ref:"overallHappiness"}}})})();\n',
            kind: 'FORM'
          },
          computedMeasures: {
            overallHappiness: 5
          },
          __model__: 'InstrumentRecord'
        },
        {
          createdAt: '2024-03-05T14:49:18.808Z',
          updatedAt: '2024-03-05T14:49:18.808Z',
          id: '65e730ee4344d866399e4211',
          data: {
            overallHappiness: 3
          },
          date: '2022-07-01T23:16:42.333Z',
          groupId: '65e730ee4344d866399e41f2',
          subjectId: '19c68118c1f5e170001a1a87316621e0d28158e1adb7fc037ef491e9ad427214',
          instrumentId: '65e730e24344d866399e41e8',
          assignmentId: null,
          instrument: {
            bundle:
              '(async()=>{const{InstrumentFactory:s}=await import("/runtime/v0.0.1/core.js"),{z:e}=await import("/runtime/v0.0.1/zod.js");return new s({kind:"FORM",language:["en","fr"],validationSchema:e.object({overallHappiness:e.number().int().gte(1).lte(10),reasonForSadness:e.string().optional()})}).defineInstrument({name:"HappinessQuestionnaire",tags:{en:["Well-Being"],fr:["Bien-\\xEAtre"]},version:1,content:{overallHappiness:{description:{en:"Overall happiness from 1 through 10 (inclusive)",fr:"Bonheur g\\xE9n\\xE9ral de 1 \\xE0 10 (inclus)"},kind:"numeric",label:{en:"Overall Happiness",fr:"Bonheur g\\xE9n\\xE9ral"},max:10,min:1,variant:"slider"},reasonForSadness:{deps:["overallHappiness"],kind:"dynamic",render:n=>!n?.overallHappiness||n.overallHappiness>=5?null:{label:{en:"Reason for Sadness",fr:"Raison de la tristesse"},isRequired:!1,kind:"text",variant:"long"}}},details:{description:{en:"The Happiness Questionnaire is a questionnaire about happiness.",fr:"Le questionnaire sur le bonheur est un questionnaire sur le bonheur."},estimatedDuration:1,instructions:{en:["Please answer the question based on your current feelings."],fr:["Veuillez r\\xE9pondre \\xE0 la question en fonction de vos sentiments actuels."]},license:"AGPL-3.0",title:{en:"Happiness Questionnaire",fr:"Questionnaire sur le bonheur"}},measures:{overallHappiness:{kind:"const",ref:"overallHappiness"}}})})();\n',
            kind: 'FORM'
          },
          computedMeasures: {
            overallHappiness: 3
          },
          __model__: 'InstrumentRecord'
        },
        {
          createdAt: '2024-03-05T14:49:18.812Z',
          updatedAt: '2024-03-05T14:49:18.812Z',
          id: '65e730ee4344d866399e4212',
          data: {
            overallHappiness: 4
          },
          date: '2023-11-05T11:35:23.888Z',
          groupId: '65e730ee4344d866399e41f2',
          subjectId: '19c68118c1f5e170001a1a87316621e0d28158e1adb7fc037ef491e9ad427214',
          instrumentId: '65e730e24344d866399e41e8',
          assignmentId: null,
          instrument: {
            bundle:
              '(async()=>{const{InstrumentFactory:s}=await import("/runtime/v0.0.1/core.js"),{z:e}=await import("/runtime/v0.0.1/zod.js");return new s({kind:"FORM",language:["en","fr"],validationSchema:e.object({overallHappiness:e.number().int().gte(1).lte(10),reasonForSadness:e.string().optional()})}).defineInstrument({name:"HappinessQuestionnaire",tags:{en:["Well-Being"],fr:["Bien-\\xEAtre"]},version:1,content:{overallHappiness:{description:{en:"Overall happiness from 1 through 10 (inclusive)",fr:"Bonheur g\\xE9n\\xE9ral de 1 \\xE0 10 (inclus)"},kind:"numeric",label:{en:"Overall Happiness",fr:"Bonheur g\\xE9n\\xE9ral"},max:10,min:1,variant:"slider"},reasonForSadness:{deps:["overallHappiness"],kind:"dynamic",render:n=>!n?.overallHappiness||n.overallHappiness>=5?null:{label:{en:"Reason for Sadness",fr:"Raison de la tristesse"},isRequired:!1,kind:"text",variant:"long"}}},details:{description:{en:"The Happiness Questionnaire is a questionnaire about happiness.",fr:"Le questionnaire sur le bonheur est un questionnaire sur le bonheur."},estimatedDuration:1,instructions:{en:["Please answer the question based on your current feelings."],fr:["Veuillez r\\xE9pondre \\xE0 la question en fonction de vos sentiments actuels."]},license:"AGPL-3.0",title:{en:"Happiness Questionnaire",fr:"Questionnaire sur le bonheur"}},measures:{overallHappiness:{kind:"const",ref:"overallHappiness"}}})})();\n',
            kind: 'FORM'
          },
          computedMeasures: {
            overallHappiness: 4
          },
          __model__: 'InstrumentRecord'
        },
        {
          createdAt: '2024-03-05T14:49:18.816Z',
          updatedAt: '2024-03-05T14:49:18.816Z',
          id: '65e730ee4344d866399e4213',
          data: {
            overallHappiness: 9
          },
          date: '2022-08-13T11:44:16.693Z',
          groupId: '65e730ee4344d866399e41f2',
          subjectId: '19c68118c1f5e170001a1a87316621e0d28158e1adb7fc037ef491e9ad427214',
          instrumentId: '65e730e24344d866399e41e8',
          assignmentId: null,
          instrument: {
            bundle:
              '(async()=>{const{InstrumentFactory:s}=await import("/runtime/v0.0.1/core.js"),{z:e}=await import("/runtime/v0.0.1/zod.js");return new s({kind:"FORM",language:["en","fr"],validationSchema:e.object({overallHappiness:e.number().int().gte(1).lte(10),reasonForSadness:e.string().optional()})}).defineInstrument({name:"HappinessQuestionnaire",tags:{en:["Well-Being"],fr:["Bien-\\xEAtre"]},version:1,content:{overallHappiness:{description:{en:"Overall happiness from 1 through 10 (inclusive)",fr:"Bonheur g\\xE9n\\xE9ral de 1 \\xE0 10 (inclus)"},kind:"numeric",label:{en:"Overall Happiness",fr:"Bonheur g\\xE9n\\xE9ral"},max:10,min:1,variant:"slider"},reasonForSadness:{deps:["overallHappiness"],kind:"dynamic",render:n=>!n?.overallHappiness||n.overallHappiness>=5?null:{label:{en:"Reason for Sadness",fr:"Raison de la tristesse"},isRequired:!1,kind:"text",variant:"long"}}},details:{description:{en:"The Happiness Questionnaire is a questionnaire about happiness.",fr:"Le questionnaire sur le bonheur est un questionnaire sur le bonheur."},estimatedDuration:1,instructions:{en:["Please answer the question based on your current feelings."],fr:["Veuillez r\\xE9pondre \\xE0 la question en fonction de vos sentiments actuels."]},license:"AGPL-3.0",title:{en:"Happiness Questionnaire",fr:"Questionnaire sur le bonheur"}},measures:{overallHappiness:{kind:"const",ref:"overallHappiness"}}})})();\n',
            kind: 'FORM'
          },
          computedMeasures: {
            overallHappiness: 9
          },
          __model__: 'InstrumentRecord'
        },
        {
          createdAt: '2024-03-05T14:49:18.819Z',
          updatedAt: '2024-03-05T14:49:18.819Z',
          id: '65e730ee4344d866399e4214',
          data: {
            overallHappiness: 9
          },
          date: '2023-08-09T10:42:00.598Z',
          groupId: '65e730ee4344d866399e41f2',
          subjectId: '19c68118c1f5e170001a1a87316621e0d28158e1adb7fc037ef491e9ad427214',
          instrumentId: '65e730e24344d866399e41e8',
          assignmentId: null,
          instrument: {
            bundle:
              '(async()=>{const{InstrumentFactory:s}=await import("/runtime/v0.0.1/core.js"),{z:e}=await import("/runtime/v0.0.1/zod.js");return new s({kind:"FORM",language:["en","fr"],validationSchema:e.object({overallHappiness:e.number().int().gte(1).lte(10),reasonForSadness:e.string().optional()})}).defineInstrument({name:"HappinessQuestionnaire",tags:{en:["Well-Being"],fr:["Bien-\\xEAtre"]},version:1,content:{overallHappiness:{description:{en:"Overall happiness from 1 through 10 (inclusive)",fr:"Bonheur g\\xE9n\\xE9ral de 1 \\xE0 10 (inclus)"},kind:"numeric",label:{en:"Overall Happiness",fr:"Bonheur g\\xE9n\\xE9ral"},max:10,min:1,variant:"slider"},reasonForSadness:{deps:["overallHappiness"],kind:"dynamic",render:n=>!n?.overallHappiness||n.overallHappiness>=5?null:{label:{en:"Reason for Sadness",fr:"Raison de la tristesse"},isRequired:!1,kind:"text",variant:"long"}}},details:{description:{en:"The Happiness Questionnaire is a questionnaire about happiness.",fr:"Le questionnaire sur le bonheur est un questionnaire sur le bonheur."},estimatedDuration:1,instructions:{en:["Please answer the question based on your current feelings."],fr:["Veuillez r\\xE9pondre \\xE0 la question en fonction de vos sentiments actuels."]},license:"AGPL-3.0",title:{en:"Happiness Questionnaire",fr:"Questionnaire sur le bonheur"}},measures:{overallHappiness:{kind:"const",ref:"overallHappiness"}}})})();\n',
            kind: 'FORM'
          },
          computedMeasures: {
            overallHappiness: 9
          },
          __model__: 'InstrumentRecord'
        }
      ]);
    }
  ),

  //handlers for graph page

  http.get('/v1/instrument-records/linear-model?instrumentId=65e730e24344d866399e41e8', () => {
    return HttpResponse.json({
      overallHappiness: {
        intercept: 9.01084757715236,
        slope: -2.2446618402140576e-12,
        stdErr: 1.3275462348052768e-11
      }
    });
  })
];
