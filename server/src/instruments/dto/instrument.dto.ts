import { ApiProperty } from '@nestjs/swagger';

import { IsString, ValidateNested } from 'class-validator';
import {
  InstrumentField as InstrumentFieldInterface,
  InstrumentFieldType,
  Instrument as InstrumentInterface,
  instrumentFieldTypeOptions
} from 'common';

class InstrumentFieldDto implements InstrumentFieldInterface {
  @ApiProperty({
    description: 'The name of the field as to be represented in the database',
    example: 'overallHappinessRating'
  })
  name: string;

  @ApiProperty({
    description: 'The label of the field to be presented to the user',
    example: 'Overall Happiness Rating'
  })
  label: string;

  @ApiProperty({
    description:
      'The type of the field, which is designed to be as close as possible, though not equivalent to, the JavaScript runtime type it will be represented as',
    enum: instrumentFieldTypeOptions
  })
  type: InstrumentFieldType;

  // Optional Fields
  @ApiProperty({
    description: 'Whether the field is required',
    default: false
  })
  isRequired: boolean;
}

export class InstrumentDto implements InstrumentInterface {
  @ApiProperty({
    description: 'The name/title of the instrument',
    example: 'The Happiness Questionnaire'
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'A brief description of the instrument',
    example:
      "The Happiness Questionnaire is a survey that asks questions about an individual's feelings of contentment, satisfaction, and well-being. It includes questions about daily activities, social connections, and overall life satisfaction."
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Instructions for how the user can complete the instrument',
    example:
      'To complete the questionnaire, you should read each question carefully and consider your personal experiences and feelings before choosing the response that best reflects your thoughts and feelings. It is important to answer all questions honestly and to the best of your ability. Once you have finished answering all of the questions, you should submit the questionnaire. It is important to be as honest and accurate as possible when completing a happiness questionnaire, as the results can be used to identify areas of your life that may be contributing to your overall sense of well-being.'
  })
  @IsString()
  instructions: string;

  @ApiProperty({
    description: 'The estimated time to complete the instrument (minutes)'
  })
  estimatedDuration: number;

  @ApiProperty({
    description: 'A list of fields that compose the instrument'
  })
  @ValidateNested()
  fields: InstrumentFieldDto[];

  @ApiProperty({
    description: 'The version of the instrument'
  })
  version: number;
}
