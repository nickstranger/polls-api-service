import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany
} from 'typeorm';

import { PollStatus } from './poll.types';
import { Question } from '../questions/question.entity';

@Entity()
export class Poll {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  dateCreated: Date;

  @UpdateDateColumn()
  dateUpdated: Date;

  @Index()
  @Column({
    type: 'enum',
    enum: PollStatus,
    default: PollStatus.ACTIVE
  })
  status: PollStatus;

  @Column()
  creatorIp: string;

  @Column()
  creatorUserAgent: string;

  @Column({
    nullable: true
  })
  creatorCookie: string;

  @Column({
    type: 'int',
    nullable: true
  })
  creatorId: number;

  @OneToMany((type) => Question, (question) => question.poll, {
    eager: false
  })
  questions: Question[];

  questionsCount: number;
}
