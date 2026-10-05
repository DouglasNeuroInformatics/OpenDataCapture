import { describe, expect, it } from 'vitest';

import instrument from '../series/DNP_HAPPINESS_QUESTIONNAIRE_WITH_CONSENT/index.ts';

function getSeriesContent() {
  const { content } = instrument;
  if (Array.isArray(content)) {
    throw new Error('Expected the series content to declare params');
  }
  return content;
}

function getParam<TKey extends 'completionMessage' | 'terminate'>(key: TKey) {
  const param = getSeriesContent().params?.[key];
  if (!param) {
    throw new Error(`Expected the series to declare '${key}'`);
  }
  return param;
}

describe('DNP_HAPPINESS_QUESTIONNAIRE_WITH_CONSENT', () => {
  it('should administer the consent form before the happiness questionnaire', () => {
    expect(getSeriesContent().items.map(({ name }) => name)).toEqual([
      'DNP_GENERAL_CONSENT_FORM',
      'DNP_HAPPINESS_QUESTIONNAIRE'
    ]);
  });

  describe('terminate', () => {
    it('should end the series when the participant declines consent', () => {
      const terminate = getParam('terminate');
      expect(terminate({ consent: false }, { itemIndex: 0, itemName: 'DNP_GENERAL_CONSENT_FORM' })).toBe(true);
    });

    it('should continue the series when the participant gives consent', () => {
      const terminate = getParam('terminate');
      expect(terminate({ consent: true }, { itemIndex: 0, itemName: 'DNP_GENERAL_CONSENT_FORM' })).toBe(false);
    });

    it('should ignore a consent field on any item other than the consent form', () => {
      const terminate = getParam('terminate');
      expect(terminate({ consent: false }, { itemIndex: 1, itemName: 'DNP_HAPPINESS_QUESTIONNAIRE' })).toBe(false);
    });
  });

  describe('completionMessage', () => {
    it('should explain in every language that the questionnaire was skipped when the series was terminated', () => {
      const completionMessage = getParam('completionMessage');
      expect(completionMessage({ itemName: 'DNP_GENERAL_CONSENT_FORM', terminated: true })).toEqual({
        en: expect.stringContaining('did not consent'),
        fr: expect.stringContaining("n'avez pas donné votre consentement")
      });
    });

    it('should defer to the default message when the series ran to completion', () => {
      const completionMessage = getParam('completionMessage');
      expect(completionMessage({ itemName: 'DNP_HAPPINESS_QUESTIONNAIRE', terminated: false })).toBeNull();
    });
  });
});
