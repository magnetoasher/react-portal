/** @format */

// #region Imports NPM
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  OneToOne,
} from 'typeorm';
// #endregion
// #region Imports Local
import { TicketDepartmentEntity } from '../department/department.entity';
// #endregion

@Entity('ticket_service')
export class TicketServiceEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  name: string;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  @OneToOne((type: any) => TicketDepartmentEntity, { cascade: true, onDelete: 'CASCADE' })
  @JoinColumn()
  department: TicketDepartmentEntity;

  toResponseObject = (): TicketServiceEntity => ({ ...this });
}
