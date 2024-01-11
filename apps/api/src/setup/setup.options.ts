import { Injectable } from '@nestjs/common';
import { $SetupState, type SetupState } from '@open-data-capture/common/setup';

import { InjectModel } from '@/prisma/prisma.decorators';
import type { Model } from '@/prisma/prisma.types';

@Injectable()
export class SetupOptions {
  constructor(@InjectModel('SetupOption') private readonly setupOptionModel: Model<'SetupOption'>) {}

  async getOption(key: keyof SetupState) {
    return this.setupOptionModel.findUnique({ where: { key } }).then((result) => {
      if (!result) {
        return null;
      }
      return this.validate(key, result.value);
    });
  }

  async setOption<TKey extends keyof SetupState>(key: TKey, value: SetupState[TKey]) {
    return this.setupOptionModel.update({ data: { value: await this.validate(key, value) }, where: { key } });
  }

  private async validate(key: keyof SetupState, value: unknown) {
    return $SetupState.shape[key].parseAsync(value);
  }
}
