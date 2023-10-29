import fs from 'fs';

export class InstrumentParser {
  private raw: string;
  private transpiler = new Bun.Transpiler();

  constructor(filepath: string) {
    this.raw = fs.readFileSync(filepath, 'utf-8');
  }

  parse() {
    const source = this.transpiler.transformSync(this.raw, 'ts');
    console.log(source);
  }
}
