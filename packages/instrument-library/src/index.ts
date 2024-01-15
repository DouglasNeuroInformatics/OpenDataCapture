import { loadSource } from './macros' with { type: 'macro' };

export const BPRS_SOURCE = loadSource('forms/brief-psychiatric-rating-scale');
export const EDQ_SOURCE = loadSource('forms/enhanced-demographics-questionnaire');
export const HQ_SOURCE = loadSource('forms/happiness-questionnaire');
export const MMSE_SOURCE = loadSource('forms/mini-mental-state-examination');
export const MOCA_SOURCE = loadSource('forms/montreal-cognitive-assessment');

export const CLICK_TASK_SOURCE = loadSource('interactive/click-task');

export { default as BPRS } from './forms/brief-psychiatric-rating-scale';
export { default as EDQ } from './forms/enhanced-demographics-questionnaire';
export { default as HQ } from './forms/happiness-questionnaire';
export { default as MMSE } from './forms/mini-mental-state-examination';
export { default as MOCA } from './forms/montreal-cognitive-assessment';
