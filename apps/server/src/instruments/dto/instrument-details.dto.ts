import { ApiProperty } from '@nestjs/swagger';

import { Type } from 'class-transformer';
import { IsDefined, IsIn, IsNumber, IsString } from 'class-validator';
import { InstrumentDetailsInterface, InstrumentLanguage, instrumentLanguageOptions } from 'common';

export class InstrumentDetailsDto implements InstrumentDetailsInterface {
  @ApiProperty({
    description: 'A brief description of the instrument',
    example:
      "The Happiness Questionnaire is a survey that asks questions about an individual's feelings of contentment, satisfaction, and well-being. It includes questions about daily activities, social connections, and overall life satisfaction."
  })
  @IsDefined()
  @IsString()
  description: string;

  @ApiProperty({
    description: 'The language in which the instrument is written',
    enum: instrumentLanguageOptions
  })
  @IsDefined()
  @IsIn(instrumentLanguageOptions)
  language: InstrumentLanguage;

  @ApiProperty({
    description: 'Instructions for how the user can complete the instrument',
    example:
      'To complete the questionnaire, you should read each question carefully and consider your personal experiences and feelings before choosing the response that best reflects your thoughts and feelings. It is important to answer all questions honestly and to the best of your ability. Once you have finished answering all of the questions, you should submit the questionnaire. It is important to be as honest and accurate as possible when completing a happiness questionnaire, as the results can be used to identify areas of your life that may be contributing to your overall sense of well-being.'
  })
  @IsDefined()
  @IsString()
  instructions: string;

  @ApiProperty({
    description: 'The estimated time to complete the instrument (minutes)',
    example: 5
  })
  @IsDefined()
  @IsNumber()
  @Type(() => Number)
  estimatedDuration: number;

  @ApiProperty({
    description: 'The version of the instrument',
    example: 1.0
  })
  @IsDefined()
  @IsNumber()
  @Type(() => Number)
  version: number;
}
