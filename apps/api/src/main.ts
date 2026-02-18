import { AppFactory, PrismaModule } from '@douglasneuroinformatics/libnest';

import { AssignmentsModule } from './assignments/assignments.module';
import { AuditModule } from './audit/audit.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModuleOptionsFactory } from './core/prisma';
import { $Env } from './core/schemas/env.schema';
import { GatewayModule } from './gateway/gateway.module';
import { GroupsModule } from './groups/groups.module';
import { InstrumentRecordsModule } from './instrument-records/instrument-records.module';
import { InstrumentsModule } from './instruments/instruments.module';
import { SessionsModule } from './sessions/sessions.module';
import { SetupModule } from './setup/setup.module';
import { SubjectsModule } from './subjects/subjects.module';
import { SummaryModule } from './summary/summary.module';
import { UsersModule } from './users/users.module';

export default AppFactory.create({
  docs: {
    // TODO - allow this to be configured via env variables. requires changes in libnest.
    // contact: {
    //   email: 'support@douglasneuroinformatics.ca',
    //   name: 'Douglas Neuroinformatics',
    //   url: 'https://douglasneuroinformatics.ca'
    // },
    description: 'Documentation for the REST API for Open Data Capture',
    externalDoc: {
      description: 'Homepage',
      url: 'https://opendatacapture.org'
    },
    license: {
      name: 'Apache-2.0',
      url: 'https://www.apache.org/licenses/LICENSE-2.0'
    },
    path: '/',
    tags: ['Authentication', 'Groups', 'Instruments', 'Instrument Records', 'Subjects', 'Users'],
    title: 'Open Data Capture'
  },
  envSchema: $Env,
  imports: [
    AuditModule,
    AuthModule,
    GroupsModule,
    InstrumentRecordsModule,
    InstrumentsModule,
    PrismaModule.forRootAsync({
      useClass: PrismaModuleOptionsFactory
    }),
    SessionsModule,
    SetupModule,
    SubjectsModule,
    SummaryModule,
    UsersModule,
    {
      module: AssignmentsModule,
      when: 'GATEWAY_ENABLED'
    },
    {
      module: GatewayModule,
      when: 'GATEWAY_ENABLED'
    }
  ],
  version: '1'
});
