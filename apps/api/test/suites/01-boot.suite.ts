import { describe, expect, it } from 'vitest';

import { defineSuite } from '../helpers';

export default defineSuite('boot', function () {
  describe('GET /v1/setup', () => {
    it('should report that a fresh instance requires setup', async () => {
      const response = await this.app.inject({ method: 'GET', url: '/v1/setup' });
      expect(response.statusCode).toBe(200);
      expect(response.json()).toMatchObject({ isSetup: false });
    });
  });

  describe('GET /spec.json', () => {
    it('should serve an OpenAPI document, so every controller is introspectable', async () => {
      const response = await this.app.inject({ method: 'GET', url: '/spec.json' });
      expect(response.statusCode).toBe(200);
      // Swagger builds the document before `enableVersioning`, so its paths carry no `/v1` prefix.
      expect(Object.keys(response.json<{ paths: object }>().paths)).toContain('/setup');
    });
  });
});
