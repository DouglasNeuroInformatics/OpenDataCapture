import { randomBytes } from 'node:crypto';

import { InjectModel } from '@douglasneuroinformatics/libnest';
import type { Model } from '@douglasneuroinformatics/libnest';
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  ServiceUnavailableException
} from '@nestjs/common';
import type {
  $UpdateSubjectIdentificationSettingsData,
  SubjectIdentificationSettings
} from '@opendatacapture/schemas/subject-identification';

import { SubjectsService } from './subjects.service';

/**
 * The PBKDF2 iteration count given to a new definition. It is stored with the definition, so raising
 * it here changes only the instances that define their fields afterwards.
 */
const CUSTOM_FIELDS_ITERATIONS = 600_000;

const CUSTOM_FIELDS_SALT_BYTES = 32;

@Injectable()
export class SubjectIdentificationService {
  constructor(
    @InjectModel('SetupState') private readonly setupStateModel: Model<'SetupState'>,
    private readonly subjectsService: SubjectsService
  ) {}

  async getSettings(): Promise<SubjectIdentificationSettings> {
    const setupState = await this.setupStateModel.findFirst({ select: { subjectIdentificationSettings: true } });
    return {
      customFields: setupState?.subjectIdentificationSettings?.customFields ?? null,
      isCustomFieldsLocked: await this.subjectsService.hasCustomFieldsSubjects()
    };
  }

  async updateSettings({
    customFields
  }: $UpdateSubjectIdentificationSettingsData): Promise<SubjectIdentificationSettings> {
    const setupState = await this.setupStateModel.findFirst();
    if (!setupState?.isSetup) {
      throw new ServiceUnavailableException('Cannot update subject identification settings before setup');
    }
    const stored = setupState.subjectIdentificationSettings?.customFields ?? null;
    // The values typed into the fields are never stored, so once an id has been derived from them, a
    // different salt, iteration count or list of fields could never produce that id again.
    if (await this.subjectsService.hasCustomFieldsSubjects()) {
      if (!stored) {
        throw new InternalServerErrorException(
          'Subjects are identified by custom fields, but no definition of the fields is stored'
        );
      } else if (!customFields) {
        throw new ConflictException(
          'The custom identifying fields cannot be removed once a subject has been identified with them'
        );
      } else if (customFields.fields.length !== stored.fields.length) {
        throw new ConflictException(
          'The number of custom identifying fields cannot change once a subject has been identified with them'
        );
      }
    }
    await this.setupStateModel.update({
      data: {
        subjectIdentificationSettings: {
          set: {
            customFields: customFields && {
              ...customFields,
              iterations: stored?.iterations ?? CUSTOM_FIELDS_ITERATIONS,
              salt: stored?.salt ?? randomBytes(CUSTOM_FIELDS_SALT_BYTES).toString('hex')
            }
          }
        }
      },
      where: { id: setupState.id }
    });
    return this.getSettings();
  }
}
