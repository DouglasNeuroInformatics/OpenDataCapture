import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import type { UserPreferences } from '@ddcp/types';

@Schema({ strict: 'throw' })
export class UserPreferencesEntity implements UserPreferences {
  @Prop({ required: false })
  prefersDarkMode?: boolean;

  @Prop({ required: false })
  prefersMobileLayout?: boolean;
}

export const UserPreferencesSchema = SchemaFactory.createForClass(UserPreferencesEntity);
