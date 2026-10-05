import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';
import { unpack } from 'msgpackr';
import { firstValueFrom, of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';

import { MsgpackInterceptor } from '../msgpack.interceptor';

/** Runs `data` through the interceptor as a handler's return value, against a recording reply. */
async function intercept(data: unknown) {
  const response = { header: vi.fn() };
  const context = new ExecutionContextHost([{}, response]);
  const body = await firstValueFrom(new MsgpackInterceptor().intercept(context, { handle: () => of(data) }));
  return { body, response };
}

describe('MsgpackInterceptor', () => {
  it('should label the reply as msgpack, so the client decodes it rather than parsing it as JSON', async () => {
    const { response } = await intercept({ id: 'subject-1' });
    expect(response.header).toHaveBeenCalledExactlyOnceWith('Content-Type', 'application/x-msgpack');
  });

  it('should encode the handler result losslessly, so the client reads back what the handler returned', async () => {
    const data = [
      { date: new Date('2026-01-01T00:00:00.000Z'), id: 'record-1', score: 3 },
      { date: new Date('2026-02-01T00:00:00.000Z'), id: 'record-2', score: 7 }
    ];
    const { body } = await intercept(data);
    expect(unpack(body)).toStrictEqual(data);
  });
});
