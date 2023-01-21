import { z } from 'zod';

export const demographicOptions = {
  sex: ['Male', 'Female'],
  ethnicity: [
    'White',
    'South Asian (e.g., East Indian, Pakistani, Sri Lankan)',
    'Chinese',
    'Black',
    'Filipino',
    'Arab',
    'Latin American',
    'Southeast Asian (e.g., Vietnamese, Cambodian, Laotian, Thai)',
    'West Asian (e.g., Iranian, Afghan)',
    'Korean',
    'Japanese',
    'Other'
  ],
  gender: ['Male', 'Female', 'Non-Binary'],
  employmentStatus: ['Full-Time', 'Part-Time', 'Student', 'Unemployed'],
  maritalStatus: [
    'Married (and not separated)',
    'Widowed (including living common law)',
    'Separated (including living common law)',
    'Divorced (including living common law)',
    'Single (including living common law)'
  ],
  firstLanguage: ['English', 'French', 'Other']
} as const;

// Also consider living status (do they live alone?)
export const subjectDemographicsSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  dateOfBirth: z.coerce.date(),
  sex: z.enum(demographicOptions.sex),
  forwardSortationArea: z.string().optional(),
  ethnicity: z.enum(demographicOptions.ethnicity).optional(),
  gender: z.enum(demographicOptions.gender).optional(),
  employmentStatus: z.enum(demographicOptions.employmentStatus).optional(),
  maritalStatus: z.enum(demographicOptions.maritalStatus).optional(),
  firstLanguage: z.enum(demographicOptions.firstLanguage).optional()
});

export const subjectSchema = z.object({
  identifier: z.string(),
  demographics: subjectDemographicsSchema
});

export type SubjectInterface = z.infer<typeof subjectSchema>;

export type SubjectDemographicsInterface = SubjectInterface['demographics'];
