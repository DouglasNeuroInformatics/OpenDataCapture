import { routeExports } from '../route-exports.js';
import { ruleTester } from './rule-tester.js';

ruleTester.run('route-exports', routeExports, {
  invalid: [
    { code: 'export * from "./other";', errors: [{ messageId: 'route' }] },
    { code: 'export default function Page() {}', errors: [{ messageId: 'route' }] },
    { code: 'export function loader() {}', errors: [{ messageId: 'route' }] },
    { code: 'export type Search = { page: number };', errors: [{ messageId: 'route' }] },
    { code: 'export const Route = 1, loader = 2;', errors: [{ column: 24, messageId: 'route' }] },
    { code: 'export const { Route } = routes;', errors: [{ messageId: 'route' }] },
    { code: 'const loader = 1;\nexport { loader };', errors: [{ messageId: 'route' }] },
    { code: 'const loader = 1;\nexport { loader as "loader" };', errors: [{ messageId: 'route' }] }
  ],
  valid: [
    'export const Route = createFileRoute("/")({});',
    'const Route = 1;\nexport { Route };',
    'const route = 1;\nexport { route as "Route" };',
    'const Page = () => null;'
  ]
});
