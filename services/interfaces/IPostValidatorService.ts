/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */
import Post from "../../models/DTO/post";

export default interface IPostValidatorService {
  validate(post: Post, newPost: boolean): Promise<void>;
}
