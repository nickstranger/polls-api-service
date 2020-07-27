import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index
} from 'typeorm';
import { Option } from '../options/option.entity';

@Entity()
export class Vote {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  dateCreated: Date;

  @Column({
    nullable: true
  })
  creatorCookie: string;

  @Column({
    type: 'int',
    nullable: true
  })
  creatorId: number;

  @Column()
  creatorIp: string;

  @Column()
  creatorUserAgent: string;

  @Index()
  @Column()
  optionId: number;

  @Index()
  @Column()
  questionId: number;

  @ManyToOne((type) => Option, (option) => option.votes, {
    eager: false,
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'option_id' })
  option: Option;
}
