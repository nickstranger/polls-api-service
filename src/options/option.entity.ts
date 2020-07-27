import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index
} from 'typeorm';

import { Question } from '../questions/question.entity';
import { Vote } from '../votes/vote.entity';

@Entity()
export class Option {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  orderInQuestion: number;

  @Column()
  text: string;

  @Index()
  @Column()
  questionId: number;

  votesCount: number;

  @ManyToOne((type) => Question, (question) => question.options, {
    eager: false,
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'question_id' })
  question: Question;

  @OneToMany((type) => Vote, (vote) => vote.option, {
    eager: false
  })
  votes: Vote[];
}
