"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.happinessQuestionnaire = void 0;
const common_1 = require("@ddcp/common");
exports.happinessQuestionnaire = {
    kind: common_1.InstrumentKind.Form,
    name: 'HappinessQuestionnaire',
    tags: ['Well-Being'],
    version: 1,
    details: {
        title: 'Happiness Questionnaire',
        language: common_1.Language.English,
        estimatedDuration: 5,
        description: `
      The Happiness Questionnaire is a survey that asks questions about an individual's
      feelings of contentment, satisfaction, and well-being. It includes questions about 
      daily activities, social connections, and overall life satisfaction.`,
        instructions: `
      To complete the questionnaire, you should read each question carefully and consider your 
      personal experiences and feelings before choosing the response that best reflects your 
      thoughts and feelings. It is important to answer all questions honestly and to the best of 
      your ability. Once you have finished answering all of the questions, you should submit the
       questionnaire. It is important to be as honest and accurate as possible when completing a 
       happiness questionnaire, as the results can be used to identify areas of your life that 
       may be contributing to your overall sense of well-being.`
    },
    content: {
        overallHappiness: {
            kind: common_1.FormFieldKind.Number,
            label: 'Overall Happiness',
            description: "The subject's overall happiness from 1 through 10",
            variant: common_1.NumberFieldVariant.Slider
        }
    },
    validationSchema: {
        type: 'object',
        properties: {
            overallHappiness: {
                type: 'integer',
                minimum: 1,
                maximum: 10
            }
        },
        required: ['overallHappiness']
    }
};
//# sourceMappingURL=happiness-questionnaire.js.map