import { loadSource } from './macros' with { type: 'macro' };

export const BRIEF_PSYCHIATRIC_RATING_SCALE_SOURCE = loadSource('forms/brief-psychiatric-rating-scale');
export const ENHANCED_DEMOGRAPHICS_QUESTIONNAIRE_SOURCE = loadSource('forms/enhanced-demographics-questionnaire');
export const HAPPINESS_QUESTIONNAIRE_SOURCE = loadSource('forms/happiness-questionnaire');
export const MINI_MENTAL_STATE_EXAMINATION_SOURCE = loadSource('forms/mini-mental-state-examination');
export const MONTREAL_COGNITIVE_ASSESSMENT_SOURCE = loadSource('forms/montreal-cognitive-assessment');

export { default as BRIEF_PSYCHIATRIC_RATING_SCALE } from './forms/brief-psychiatric-rating-scale';
export { default as ENHANCED_DEMOGRAPHICS_QUESTIONNAIRE } from './forms/enhanced-demographics-questionnaire';
export { default as HAPPINESS_QUESTIONNAIRE } from './forms/happiness-questionnaire';
export { default as MINI_MENTAL_STATE_EXAMINATION } from './forms/mini-mental-state-examination';
export { default as MONTREAL_COGNITIVE_ASSESSMENT } from './forms/montreal-cognitive-assessment';
