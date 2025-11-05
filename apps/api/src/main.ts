import { AppFactory, ConfigService, PrismaModule } from '@douglasneuroinformatics/libnest';

import { AssignmentsModule } from './assignments/assignments.module';
import { AuthModule } from './auth/auth.module';
import { createPrismaClient } from './core/prisma';
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
    contact: {
      email: 'support@douglasneuroinformatics.ca',
      name: 'Douglas Neuroinformatics',
      url: 'https://douglasneuroinformatics.ca'
    },
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
    AuthModule,
    GroupsModule,
    InstrumentRecordsModule,
    InstrumentsModule,
    PrismaModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const mongoUri = configService.get('MONGO_URI');
        const env = configService.get('NODE_ENV');
        const url = new URL(`${mongoUri.href}/data-capture-${env}`);
        const params = {
          directConnection: configService.get('MONGO_DIRECT_CONNECTION'),
          replicaSet: configService.get('MONGO_REPLICA_SET'),
          retryWrites: configService.get('MONGO_RETRY_WRITES'),
          w: configService.get('MONGO_WRITE_CONCERN')
        };
        for (const [key, value] of Object.entries(params)) {
          if (value) {
            url.searchParams.append(key, String(value));
          }
        }
        return {
          client: createPrismaClient(url.href)
        };
      }
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
