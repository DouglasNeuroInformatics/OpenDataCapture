import { accessibleQuery, InjectModel } from '@douglasneuroinformatics/libnest';
import type { Model } from '@douglasneuroinformatics/libnest';
import { Injectable, NotFoundException } from '@nestjs/common';

import type { EntityOperationOptions, Identity } from '@/core/types';
import { InstrumentRecordsService } from '@/instrument-records/instrument-records.service';

@Injectable()
export class SubjectsDataService {
  constructor(
    @InjectModel('Subject') private readonly subjectModel: Model<'Subject'>,
    private readonly instrumentRecordsService: Identity<InstrumentRecordsService>
  ) {}

  async deleteById(id: string, { ability }: EntityOperationOptions = {}) {
    const subject = await this.findById(id);
    await this.instrumentRecordsService.deleteBySubjectId(id);
    return this.subjectModel.delete({
      where: { AND: [accessibleQuery(ability, 'delete', 'Subject')], id: subject.id }
    });
  }

  async findById(id: string, { ability }: EntityOperationOptions = {}) {
    const subject = await this.subjectModel.findFirst({
      where: { AND: [accessibleQuery(ability, 'read', 'Subject'), { id }] }
    });
    if (!subject) {
      throw new NotFoundException(`Failed to find subject with id: ${id}`);
    }
    return subject;
  }
}
