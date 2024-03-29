/* eslint-disable no-unused-vars */
import Comment from "../../models/DTO/comment";
import User from "../../models/DTO/user";
import { commentsFilter } from "../filters/commentsFilter";

export default interface ICommentsService {
  get(id: number): Promise<Comment>;
  getAll(
    filter: commentsFilter,
    filterId: number,
    previousPageLastCommentIndex: number,
    limit: number,
    searchText: string
  ): Promise<{ comments: Comment[]; primaryCommentsCount: number }>;
  add(comment: Comment): Promise<Comment>;
  update(id: number, text: string): Promise<Comment>;
  remove(id: number): void;
  removeAll(filter: commentsFilter, filterId: number, user?: User): void;
}
