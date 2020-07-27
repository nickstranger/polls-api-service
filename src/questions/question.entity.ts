import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index
} from 'typeorm';

import { Poll } from '../polls/poll.entity';
import { Option } from '../options/option.entity';
import { QuestionState } from './question.types';
import { Vote } from '../votes/vote.entity';

@Entity()
export class Question {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  orderInPoll: number;

  @Column()
  text: string;

  @Index()
  @Column()
  pollId: number;

  @ManyToOne((type) => Poll, (poll) => poll.questions, {
    eager: false,
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'poll_id' })
  poll: Poll;

  @OneToMany((type) => Option, (option) => option.question, {
    eager: false
  })
  options: Option[];

  optionsCount: number;

  userVote: Vote;

  votesCount: number;

  state: QuestionState;
}
