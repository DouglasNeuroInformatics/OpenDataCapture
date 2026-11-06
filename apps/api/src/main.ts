import { BlockList, isIPv6 } from 'node:net';

import { AppFactory, PrismaModule } from '@douglasneuroinformatics/libnest';

import { AssignmentsModule } from './assignments/assignments.module';
import { AuditModule } from './audit/audit.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModuleOptionsFactory } from './core/prisma';
import { $Env } from './core/schemas/env.schema';
import { GatewayModule } from './gateway/gateway.module';
import { GroupsModule } from './groups/groups.module';
import { InstrumentRecordsModule } from './instrument-records/instrument-records.module';
import { InstrumentReposModule } from './instrument-repos/instrument-repos.module';
import { InstrumentsModule } from './instruments/instruments.module';
import { MailModule } from './mail/mail.module';
import { PermissionSetsModule } from './permission-sets/permission-sets.module';
import { SessionsModule } from './sessions/sessions.module';
import { SetupModule } from './setup/setup.module';
import { StorageModule } from './storage/storage.module';
import { SubjectsModule } from './subjects/subjects.module';
import { SummaryModule } from './summary/summary.module';
import { UsersModule } from './users/users.module';

const LOOPBACK_AND_PRIVATE_NETWORKS = new BlockList();
LOOPBACK_AND_PRIVATE_NETWORKS.addSubnet('127.0.0.0', 8, 'ipv4');
LOOPBACK_AND_PRIVATE_NETWORKS.addSubnet('10.0.0.0', 8, 'ipv4');
LOOPBACK_AND_PRIVATE_NETWORKS.addSubnet('172.16.0.0', 12, 'ipv4');
LOOPBACK_AND_PRIVATE_NETWORKS.addSubnet('192.168.0.0', 16, 'ipv4');
LOOPBACK_AND_PRIVATE_NETWORKS.addAddress('::1', 'ipv6');
LOOPBACK_AND_PRIVATE_NETWORKS.addSubnet('fc00::', 7, 'ipv6');

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
    title: 'Open Data Capture'
  },
  envSchema: $Env,
  fastifyOptions: {
    // Decides which X-Forwarded-For hops `request.ip`, and so every throttler key, is read from. Hop 0 is the
    // peer: the bundled Caddy, or the web dev server's proxy on loopback. Hop 1 is the address Caddy recorded
    // for its own peer. Caddy appends it to the peer's header only when TRUSTED_PROXIES lists the peer, and
    // otherwise replaces the header with it, so hop 2 exists only behind a trusted front proxy and is the
    // client that proxy saw. Trusting hop 1 whatever its address leaves that call to TRUSTED_PROXIES, and
    // trusting nothing past it stops a client choosing its key by forging earlier entries. Node reports no
    // address for a socket that has already closed.
    trustProxy: (address: string | undefined, hop: number) => {
      if (hop > 0) {
        return hop === 1;
      }
      return address !== undefined && LOOPBACK_AND_PRIVATE_NETWORKS.check(address, isIPv6(address) ? 'ipv6' : 'ipv4');
    }
  },
  imports: [
    AuditModule,
    AuthModule,
    GroupsModule,
    InstrumentRecordsModule,
    InstrumentReposModule,
    InstrumentsModule,
    MailModule,
    PermissionSetsModule,
    PrismaModule.forRootAsync({
      useClass: PrismaModuleOptionsFactory
    }),
    SessionsModule,
    SetupModule,
    StorageModule,
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
