import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { SubjectDemographicsInterface, demographicOptions } from 'common';

@Schema({ strict: true })
export class SubjectDemographics implements SubjectDemographicsInterface {
  @Prop({ required: false })
  firstName?: string;

  @Prop({ required: false })
  lastName?: string;

  @Prop({ required: true })
  dateOfBirth: Date;

  @Prop({ enum: demographicOptions.sex, required: true, type: String })
  sex: SubjectDemographicsInterface['sex'];

  @Prop({ required: false })
  forwardSortationArea?: string;

  @Prop({ enum: demographicOptions.ethnicity, required: false, type: String })
  ethnicity?: SubjectDemographicsInterface['ethnicity'];

  @Prop({ enum: demographicOptions.gender, required: false, type: String })
  gender?: SubjectDemographicsInterface['gender'];

  @Prop({ enum: demographicOptions.employmentStatus, required: false, type: String })
  employmentStatus?: SubjectDemographicsInterface['employmentStatus'];

  @Prop({ enum: demographicOptions.maritalStatus, required: false, type: String })
  maritalStatus?: SubjectDemographicsInterface['maritalStatus'];

  @Prop({ enum: demographicOptions.firstLanguage, required: false, type: String })
  firstLanguage?: SubjectDemographicsInterface['firstLanguage'];
}

export const SubjectDemographicsSchema = SchemaFactory.createForClass(SubjectDemographics);
