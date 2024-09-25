import { loadResource } from './load-resource.js';

/** @type {import('vite').Connect.NextHandleFunction} */
export const runtimeMiddleware = (req, res, next) => {
  const [version, ...paths] = req.url?.split('/').filter(Boolean) ?? [];
  const filepath = paths.join('/');
  if (!(version && filepath)) {
    return next();
  }
  loadResource(version, filepath)
    .then((resource) => {
      if (!resource) {
        return next();
      }
      res.writeHead(200, { 'Content-Type': resource.contentType });
      res.end(resource.content);
    })
    .catch(next);
};
