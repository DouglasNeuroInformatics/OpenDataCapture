import { describe, expect, it } from 'vitest';

import { defineSuite } from '../helpers';

type OpenApiOperation = {
  requestBody?: { content: { 'application/json': { schema: { [key: string]: unknown } } } };
};

type OpenApiDocument = {
  paths: { [path: string]: { [method: string]: OpenApiOperation } };
};

export default defineSuite('boot', function () {
  describe('GET /v1/setup', () => {
    it('should report that a fresh instance requires setup', async () => {
      const response = await this.app.inject({ method: 'GET', url: '/v1/setup' });
      expect(response.statusCode).toBe(200);
      expect(response.json()).toMatchObject({ isSetup: false });
    });
  });

  describe('GET /spec.json', () => {
    const getDocument = async (): Promise<OpenApiDocument> => {
      const response = await this.app.inject({ method: 'GET', url: '/spec.json' });
      expect(response.statusCode).toBe(200);
      return response.json<OpenApiDocument>();
    };

    it('should document every route under the version prefix it is served at', async () => {
      const { paths } = await getDocument();
      expect(Object.keys(paths)).toContain('/v1/setup');
    });

    it('should document every request body from its Zod schema, so no body is rendered as unknown', async () => {
      const { paths } = await getDocument();
      const undocumentedBodies = Object.entries(paths).flatMap(([path, operations]) => {
        return Object.entries(operations)
          .filter(([, { requestBody }]) => {
            return requestBody && Object.keys(requestBody.content['application/json'].schema).length === 0;
          })
          .map(([method]) => `${method.toUpperCase()} ${path}`);
      });
      expect(undocumentedBodies).toEqual([]);
    });

    it('should document the fields of a request body', async () => {
      const { paths } = await getDocument();
      expect(paths['/v1/groups']!.post!.requestBody!.content['application/json'].schema).toMatchObject({
        properties: { name: { type: 'string' }, type: { enum: ['CLINICAL', 'RESEARCH'] } },
        required: ['name', 'type']
      });
    });
  });
});
