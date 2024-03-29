/* eslint-disable no-use-before-define */
/* eslint-disable import/no-cycle */
import {
  PrimaryGeneratedColumn,
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import UserEntity from "./userEntity";
import PostEntity from "./postEntity";

@Entity()
export default class CommentEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column("text")
  text!: string;

  @Column("int")
  authorId!: number;

  @ManyToOne(() => UserEntity, (author) => author.comments, { nullable: false })
  @JoinColumn({ name: "authorId" })
  author!: UserEntity;

  @Column("int")
  postId!: number;

  @ManyToOne(() => PostEntity, (post) => post.comments, {
    onDelete: "CASCADE",
    nullable: false,
  })
  @JoinColumn({ name: "postId" })
  post!: PostEntity;

  @OneToMany(() => CommentEntity, (reply) => reply.parent)
  replies!: CommentEntity[];

  @Column("int", { nullable: true })
  parentId!: number;

  @ManyToOne(() => CommentEntity, (parent) => parent.replies, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "parentId" })
  parent!: CommentEntity;

  @CreateDateColumn()
  dateCreated!: Date;

  @UpdateDateColumn()
  dateModified!: Date;
}
