import Joi from "joi";
import Post from "../../models/DTO/post";
import IPostValidatorService from "../interfaces/IPostValidatorService";
import CustomError from "./customError";

export default class PostsValidatorService implements IPostValidatorService {
  private static validateNewPostData(post: JSON) {
    const schema = Joi.object({
      title: Joi.string().min(1).required(),
      content: Joi.string().min(1).required(),
      author: Joi.number().min(1).required(),
    });

    return schema.validate(post);
  }

  private static validateUpdatePostData(post: JSON) {
    const schema = Joi.object({
      title: Joi.string().min(1),
      content: Joi.string().min(1),
    });

    return schema.validate(post);
  }

  // eslint-disable-next-line class-methods-use-this
  validate = async (post: Post, newPost: boolean): Promise<void> => {
    if (!newPost) {
      if (
        PostsValidatorService.validateUpdatePostData(
          JSON.parse(
            JSON.stringify({
              title: post.title,
              content: post.content,
            })
          )
        ).error
      ) {
        throw new CustomError(400, "The post elements should have a value.");
      }

      return;
    }

    if (
      PostsValidatorService.validateNewPostData(
        JSON.parse(
          JSON.stringify({
            title: post.title,
            content: post.content,
            author: post.author,
          })
        )
      ).error
    ) {
      throw new CustomError(400, "The post elements should have a value.");
    }
  };
}
