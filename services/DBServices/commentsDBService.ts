/* eslint-disable class-methods-use-this */
import { RowDataPacket } from "mysql2";
import { Brackets, getRepository, Repository } from "typeorm";
import Comment from "../../models/DTO/comment";
import CommentEntity from "../../models/entities/commentEntity";
import { commentsFilter } from "../filters/commentsFilter";
import ICommentsService from "../interfaces/ICommentsService";
import CustomError from "../validators/customError";

export default class CommentsService implements ICommentsService {
  commentsRepository!: Repository<CommentEntity>;

  private instantiateRepo() {
    if (!this.commentsRepository)
      this.commentsRepository = getRepository(CommentEntity);
  }

  private async parentBelongsToPost(
    parentId: number | undefined,
    postId: number
  ) {
    if (parentId !== undefined) {
      const parentComment = await this.commentsRepository.findOne({
        where: { id: parentId },
      });
      if (parentComment === undefined || parentComment.postId !== postId) {
        throw new CustomError(
          400,
          "Parent comment is not part of the same post or it does not exist"
        );
      }
    }
  }

  private async validateComment(comment: Comment) {
    if (
      comment.postID == null ||
      comment.text == null ||
      comment.author == null
    ) {
      throw new CustomError(
        400,
        "All required comment fields must have a value."
      );
    }

    try {
      await this.parentBelongsToPost(comment.parentID, comment.postID);
    } catch (e) {
      if (e instanceof CustomError) throw e;
    }
  }

  private convertEntityToDTO(commentEntity: CommentEntity) {
    return new Comment(
      commentEntity.id,
      commentEntity.postId,
      commentEntity.text,
      commentEntity.authorId,
      commentEntity.parentId,
      commentEntity.dateCreated,
      commentEntity.dateModified
    );
  }

  private convertRawDBResponseToDTO(commentRaw: RowDataPacket): Comment {
    const comment = new Comment(
      commentRaw.comment_id,
      commentRaw.comment_postId,
      commentRaw.comment_text,
      commentRaw.comment_authorId,
      commentRaw.comment_parentId,
      commentRaw.comment_dateCreated,
      commentRaw.comment_dateModified
    );
    comment.authorName = commentRaw.user_name;
    comment.repliesCount = commentRaw.repliesCount;
    return comment;
  }

  async get(id: number) {
    this.instantiateRepo();
    try {
      const comment = await this.commentsRepository.findOne({
        where: { id },
      });

      if (!comment)
        throw new CustomError(
          404,
          "The comment with the given id does not exist."
        );

      return this.convertEntityToDTO(comment);
    } catch (e) {
      if (e instanceof CustomError) throw e;
      throw new CustomError(400, "Error while trying to retrieve comment");
    }
  }

  async getAll(
    filter: commentsFilter,
    filterid: number,
    previousPageLastCommentIndex: number,
    limit: number,
    searchText: string = ""
  ) {
    this.instantiateRepo();
    try {
      let dbQuery = this.commentsRepository
        .createQueryBuilder("comment")
        .leftJoin("comment.author", "user")
        .leftJoin("comment.replies", "replies")
        .select([
          "comment.id",
          "comment.postId",
          "comment.text",
          "comment.authorId",
          "comment.parentId",
          "comment.dateCreated",
          "comment.dateModified",
          "user.name",
          "COUNT(DISTINCT(replies.id)) AS repliesCount",
        ])
        .groupBy("comment.id");
      switch (filter) {
        case commentsFilter.post:
          dbQuery = dbQuery.where({ postId: filterid, parentId: null });
          break;
        case commentsFilter.author:
          dbQuery = dbQuery.where({ authorId: filterid });
          break;
        case commentsFilter.parent:
          dbQuery = dbQuery.where({ parentId: filterid });
          break;
        case commentsFilter.search:
          dbQuery = dbQuery
            .where("comment.postId = :postId", { postId: filterid })
            .andWhere(
              new Brackets((subQuery) => {
                subQuery
                  .where("comment.text like :text", {
                    text: `%${searchText}%`,
                  })
                  .orWhere("user.name like :userName", {
                    userName: `%${searchText}%`,
                  });
              })
            );
          break;

        default:
          throw new CustomError(
            400,
            "Input parameters were incomplete or incorrect."
          );
      }

      const commentsCount = await dbQuery.getCount();

      if (previousPageLastCommentIndex > -1)
        dbQuery = dbQuery.andWhere("comment.id < :lastCommentId", {
          lastCommentId: previousPageLastCommentIndex,
        });

      const filteredComments = await dbQuery
        .orderBy("comment.dateCreated", "DESC")
        .limit(limit)
        .getRawMany();

      return {
        comments: filteredComments.map((c) =>
          this.convertRawDBResponseToDTO(c)
        ),
        primaryCommentsCount: commentsCount,
      };
    } catch (e) {
      if (e instanceof CustomError) throw e;
      throw new CustomError(400, "Error while trying to retrieve comments");
    }
  }

  async add(commentToAdd: Comment) {
    this.instantiateRepo();
    try {
      await this.validateComment(commentToAdd);
      const commentEntity = new CommentEntity();
      commentEntity.postId = commentToAdd.postID;
      commentEntity.text = commentToAdd.text.substring(0, 1000);
      commentEntity.authorId = commentToAdd.author;
      if (commentToAdd.parentID) commentEntity.parentId = commentToAdd.parentID;

      const newComment = await this.commentsRepository.save(commentEntity);
      return this.convertEntityToDTO(newComment);
    } catch (e) {
      if (e instanceof CustomError) throw e;
      throw new CustomError(400, "Error while trying to add new comment.");
    }
  }

  async update(id: number, text: string) {
    this.instantiateRepo();
    try {
      await this.commentsRepository.update(id, {
        text: text.substring(0, 1000),
      });

      const comment = await this.get(id);
      return comment;
    } catch (e) {
      if (e instanceof CustomError) throw e;
      throw new CustomError(400, "Error while updating the comment");
    }
  }

  async remove(id: number) {
    this.instantiateRepo();
    try {
      await this.commentsRepository.delete(id);
    } catch (e) {
      if (e instanceof CustomError) throw e;
      throw new CustomError(400, "Error while removing the comment");
    }
  }

  async removeAll(filter: commentsFilter, filterId: number) {
    this.instantiateRepo();
    try {
      switch (filter) {
        case commentsFilter.post:
          try {
            await this.commentsRepository.delete({ postId: filterId });
          } catch (e) {
            throw new CustomError(
              400,
              "Error while removing comments with specific postID"
            );
          }
          break;
        case commentsFilter.author:
          try {
            await this.commentsRepository.delete({ authorId: filterId });
          } catch (e) {
            throw new CustomError(
              400,
              "Error while removing comments with specific author"
            );
          }
          break;
        default:
          throw new CustomError(400, "Error while removing comments");
      }
    } catch (e) {
      if (e instanceof CustomError) throw e;
    }
  }
}
