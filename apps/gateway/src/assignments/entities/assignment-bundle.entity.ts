import type { AssignmentBundle } from '@open-data-capture/common/assignment';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class AssignmentBundleEntity implements AssignmentBundle {
  @Column()
  assignedAt: Date;

  @Column()
  expiresAt: Date;

  @PrimaryColumn()
  id: string;

  @Column()
  instrumentBundle: string;

  @Column()
  instrumentId: string;

  @Column()
  status: 'CANCELED' | 'COMPLETE' | 'EXPIRED' | 'OUTSTANDING';

  @Column()
  subjectIdentifier: string;

  @Column()
  url: string;
}
