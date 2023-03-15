import { CryptoService } from '../crypto.service';

describe('CryptoService', () => {
  let cryptoService: CryptoService;

  beforeEach(() => {
    cryptoService = new CryptoService();
  });

  it('should create a hash that is not equal to the input value', async () => {
    await expect(cryptoService.hash('foo')).resolves.not.toBe('foo');
  });

  it('should create two different hashes for the same value, both of which can be verified', async () => {
    const h1 = await cryptoService.hash('foo');
    const h2 = await cryptoService.hash('foo');
    expect(h1).not.toBe(h2);
    await expect(cryptoService.compare('foo', h1)).resolves.toBe(true);
    await expect(cryptoService.compare('foo', h2)).resolves.toBe(true);
  });

  it('should return false when comparing a hash with an incorrect value', async () => {
    const hash = await cryptoService.hash('foo');
    await expect(cryptoService.compare('bar', hash)).resolves.toBe(false);
  });
});
