/// <reference types="@open-data-capture/rollup-plugin-raw/client" />

import BPRS_SOURCE from './forms/brief-psychiatric-rating-scale?raw';
import EDQ_SOURCE from './forms/enhanced-demographics-questionnaire?raw';
import HQ_SOURCE from './forms/happiness-questionnaire?raw';
import MMSE_SOURCE from './forms/mini-mental-state-examination?raw';
import MOCA_SOURCE from './forms/montreal-cognitive-assessment?raw';
import CLICK_TASK_SOURCE from './interactive/click-task?raw';

export { BPRS_SOURCE, CLICK_TASK_SOURCE, EDQ_SOURCE, HQ_SOURCE, MMSE_SOURCE, MOCA_SOURCE };

// export { default as BPRS } from './forms/brief-psychiatric-rating-scale';
// export { default as EDQ } from './forms/enhanced-demographics-questionnaire';
// export { default as HQ } from './forms/happiness-questionnaire';
// export { default as MMSE } from './forms/mini-mental-state-examination';
// export { default as MOCA } from './forms/montreal-cognitive-assessment';
