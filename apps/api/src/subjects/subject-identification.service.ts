import { randomBytes } from 'node:crypto';

import { InjectModel } from '@douglasneuroinformatics/libnest';
import type { Model } from '@douglasneuroinformatics/libnest';
import { ConflictException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { $SubjectIdentificationMethod } from '@opendatacapture/schemas/subject';
import { DEFAULT_OFFERED_SUBJECT_IDENTIFICATION_METHODS } from '@opendatacapture/schemas/subject-identification';
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
    const [firstOfferedMethod, ...otherOfferedMethods] =
      setupState?.subjectIdentificationSettings?.offeredMethods ?? [];
    const customFields = setupState?.subjectIdentificationSettings?.customFields ?? null;
    return {
      customFields,
      isCustomFieldsLocked: customFields !== null && (await this.subjectsService.hasCustomFieldsSubjects()),
      offeredMethods: firstOfferedMethod
        ? [firstOfferedMethod, ...otherOfferedMethods]
        : DEFAULT_OFFERED_SUBJECT_IDENTIFICATION_METHODS
    };
  }

  async updateSettings({
    customFields,
    offeredMethods
  }: $UpdateSubjectIdentificationSettingsData): Promise<SubjectIdentificationSettings> {
    const setupState = await this.setupStateModel.findFirst();
    if (!setupState?.isSetup) {
      throw new ServiceUnavailableException('Cannot update subject identification settings before setup');
    }
    const stored = setupState.subjectIdentificationSettings?.customFields ?? null;
    // The values typed into the fields are never stored, so once an id has been derived from them, a
    // different salt, iteration count or list of fields could never produce that id again. A `cf_` id
    // with no definition stored (one uploaded, say) matches no definition, so there is none to protect.
    if (stored && (await this.subjectsService.hasCustomFieldsSubjects())) {
      if (!customFields) {
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
            },
            // Stored in one fixed order, so the first offered method a form falls back to is predictable.
            offeredMethods: $SubjectIdentificationMethod.options.filter((method) => offeredMethods.includes(method))
          }
        }
      },
      where: { id: setupState.id }
    });
    return this.getSettings();
  }
}
