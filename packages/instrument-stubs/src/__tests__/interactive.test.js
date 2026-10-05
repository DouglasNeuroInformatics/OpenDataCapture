// @vitest-environment happy-dom

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { bilingualInteractiveInstrument, interactiveInstrument } from '../interactive.js';

/** @param {string} name */
function getButton(name) {
  const button = Array.from(document.querySelectorAll('button')).find((element) => element.textContent === name);
  if (!button) {
    throw new Error(`Expected a button labelled '${name}'`);
  }
  return button;
}

beforeEach(() => {
  document.body.innerHTML = '';
  document.body.removeAttribute('style');
  document.documentElement.setAttribute('lang', 'en');
});

describe('interactiveInstrument', () => {
  const { content, validationSchema } = interactiveInstrument.instance;

  it('should center its content in a full-viewport column', () => {
    content.render(vi.fn());
    expect(document.body.style.display).toBe('flex');
    expect(document.body.style.flexDirection).toBe('column');
    expect(document.body.style.height).toBe('100vh');
  });

  it('should not complete until the submit button is clicked', () => {
    const done = vi.fn();
    content.render(done);
    expect(done).not.toHaveBeenCalled();
  });

  it('should complete with a greeting when the submit button is clicked', () => {
    const done = vi.fn();
    content.render(done);
    getButton('Submit Instrument').click();
    expect(done).toHaveBeenCalledExactlyOnceWith({ message: 'Hello World' });
  });

  it('should accept the data it completes with', () => {
    expect(validationSchema.safeParse({ message: 'Hello World' }).success).toBe(true);
  });
});

describe('bilingualInteractiveInstrument', () => {
  const { content, validationSchema } = bilingualInteractiveInstrument.instance;

  it('should label its buttons in the document language', () => {
    document.documentElement.setAttribute('lang', 'fr');
    content.render(vi.fn());
    expect(getButton('Changer de langue')).toBeTruthy();
    expect(getButton('Soumettre')).toBeTruthy();
  });

  it('should switch the document from English to French when the language button is clicked', () => {
    content.render(vi.fn());
    getButton('Change Language').click();
    expect(document.documentElement.getAttribute('lang')).toBe('fr');
  });

  it('should switch the document from French to English when the language button is clicked', () => {
    document.documentElement.setAttribute('lang', 'fr');
    content.render(vi.fn());
    getButton('Changer de langue').click();
    expect(document.documentElement.getAttribute('lang')).toBe('en');
  });

  it('should relabel its buttons when the document language changes', async () => {
    content.render(vi.fn());
    getButton('Change Language').click();
    await vi.waitFor(() => {
      expect(getButton('Changer de langue')).toBeTruthy();
      expect(getButton('Soumettre')).toBeTruthy();
    });
  });

  it('should complete with a greeting in the current language when the submit button is clicked', () => {
    document.documentElement.setAttribute('lang', 'fr');
    const done = vi.fn();
    content.render(done);
    getButton('Soumettre').click();
    expect(done).toHaveBeenCalledExactlyOnceWith({ message: 'Bonjour' });
  });

  it('should reject completion data without a message', () => {
    expect(validationSchema.safeParse({}).success).toBe(false);
  });
});
