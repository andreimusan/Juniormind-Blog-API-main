/* eslint-disable import/no-cycle */
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from "typeorm";
import CommentEntity from "./commentEntity";
import UserEntity from "./userEntity";

@Entity()
export default class PostEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column("text")
  content!: string;

  @Column("int")
  authorId!: number;

  @CreateDateColumn()
  dateCreated!: Date;

  @UpdateDateColumn()
  dateModified!: Date;

  @ManyToOne(() => UserEntity, (author) => author.posts)
  @JoinColumn()
  author!: UserEntity;

  @OneToMany(() => CommentEntity, (comment) => comment.post)
  comments!: CommentEntity[];

  @Column({ default: "" })
  image!: string;
}
