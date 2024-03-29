/* eslint-disable import/no-cycle */
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import CommentEntity from "./commentEntity";
import PostEntity from "./postEntity";

@Entity()
export default class UserEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column({ default: true })
  active!: boolean;

  @Column({ default: false })
  isAdmin!: boolean;

  @Column({ default: "" })
  image!: string;

  @CreateDateColumn()
  dateCreated!: Date;

  @UpdateDateColumn()
  dateModified!: Date;

  @OneToMany(() => PostEntity, (post) => post.author)
  posts!: PostEntity[];

  @OneToMany(() => CommentEntity, (comment) => comment.author)
  comments!: CommentEntity[];
}
