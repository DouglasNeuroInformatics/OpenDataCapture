export class Router extends Bun.FileSystemRouter {
  constructor(dir: string) {
    super({ dir, style: 'nextjs' });
  }
}
