import express from "express";
import Comment from "../../models/DTO/comment";
import Post from "../../models/DTO/post";
import User from "../../models/DTO/user";
import { users, posts, comments } from "../../inmemDB";
import CommentsController from "../../controllers/commentsController";
import ServicesRegister from "../../services/servicesRegister";
import { commentsFilter } from "../../services/filters/commentsFilter";
import CustomError from "../../services/validators/customError";

const mockResponse = () => {
  const res = express.response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

let controller: CommentsController;
let user10: User;

beforeAll(() => {
  ServicesRegister.RegisterServices();
  controller = new CommentsController();
});

const localCommentsDB: Comment[] = [];

beforeAll(() => {
  user10 = new User(
    10,
    "Andrei",
    "andrei@mail.com",
    "password",
    true,
    new Date(),
    new Date()
  );
  users.push(user10);

  const post10 = new Post(
    10,
    "post10",
    "post10 text",
    10,
    new Date(),
    new Date()
  );
  posts.push(post10);

  const post11 = new Post(
    11,
    "post10",
    "post10 text",
    10,
    new Date(),
    new Date()
  );
  posts.push(post11);

  const comment10 = new Comment(
    10,
    10,
    "this is comment #10",
    10,
    undefined,
    new Date(),
    new Date()
  );
  const comment11 = new Comment(
    11,
    1,
    "this is comment #11",
    1,
    undefined,
    new Date(),
    new Date()
  );
  const comment12 = new Comment(
    12,
    10,
    "this is comment #12",
    10,
    10,
    new Date(),
    new Date()
  );
  const comment13 = new Comment(
    13,
    10,
    "this is comment #13",
    10,
    10,
    new Date(),
    new Date()
  );
  comments.push(comment10, comment11, comment12, comment13);
  localCommentsDB.push(comment10, comment11, comment12, comment13);
});

afterAll(() => {
  localCommentsDB.forEach((c) => {
    if (comments.includes(c)) {
      comments.splice(comments.indexOf(c), 1);
    }
  });
  posts.pop();
  posts.pop();
  users.pop();
});

describe("GET tests", () => {
  beforeAll(() => {
    const comment14 = new Comment(
      14,
      10,
      "This is comment #14",
      1,
      undefined,
      new Date(),
      new Date()
    );
    const comment15 = new Comment(
      15,
      10,
      "This is comment #15",
      1,
      10,
      new Date(),
      new Date()
    );
    const comment16 = new Comment(
      16,
      10,
      "This is comment #16",
      1,
      undefined,
      new Date(),
      new Date()
    );

    const comment17 = new Comment(
      17,
      10,
      "This is comment #17",
      1,
      undefined,
      new Date(),
      new Date()
    );
    comments.push(comment14, comment15, comment16, comment17);
    localCommentsDB.push(comment14, comment15, comment16, comment17);
  });
  afterAll(() => {
    localCommentsDB.forEach((c) => {
      if (comments.includes(c)) {
        comments.splice(comments.indexOf(c), 1);
      }
    });
  });
  describe("GET request with specific id", () => {
    test("should return error message when service throws error", async () => {
      const spy = jest
        .spyOn(controller.commentsService, "get")
        .mockImplementation(() => {
          throw new CustomError(400, "Error while trying to retrieve comment");
        });
      const req = express.request;
      req.params = { id: "10" };
      const res = mockResponse();
      await controller.get(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toBeCalledWith({
        message: "Error while trying to retrieve comment",
      });
      expect(spy).toHaveBeenCalledWith(10);
      expect(spy).toHaveBeenCalledTimes(1);
      spy.mockRestore();
    });

    test("should return error message when found comment is undefined", async () => {
      const req = express.request;
      req.params = { id: "50" };
      const res = mockResponse();
      await controller.get(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toBeCalledWith({
        message: "The comment with the given id does not exist.",
      });
    });

    test("should return comment with specific id", async () => {
      const req = express.request;
      req.params = { id: "10" };
      const res = mockResponse();
      await controller.get(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toBeCalledWith({ data: localCommentsDB[0] });
    });
  });

  describe("GET request with filter", () => {
    test("should return error message when filter or id is missing", async () => {
      const req = express.request;
      req.query = {};
      const res = mockResponse();
      await controller.getAll(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toBeCalledWith({ message: "Invalid query parameters." });
    });

    test("should return error message when service throws error", async () => {
      const spy = jest
        .spyOn(controller.commentsService, "getAll")
        .mockImplementation(() => {
          throw new CustomError(400, "Error while trying to retrieve comments");
        });
      const req = express.request;
      req.query = { filter: "post", id: "10" };
      const res = mockResponse();
      await controller.getAll(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toBeCalledWith({
        message: "Error while trying to retrieve comments",
      });
      expect(spy).toHaveBeenCalledWith(commentsFilter.post, 10, -1, 5, "");
      expect(spy).toHaveBeenCalledTimes(1);
      spy.mockRestore();
    });

    test("should return an error message when filter is invalid", async () => {
      const req = express.request;
      const res = mockResponse();
      req.query = { filter: "postr", id: "10" };
      await controller.getAll(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toBeCalledWith({
        message: "Input parameters were incomplete or incorrect.",
      });
    });

    test("should return empty array when no comments match filter id", async () => {
      const req = express.request;
      req.query = { filter: "post", id: "20" };
      const res = mockResponse();
      await controller.getAll(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toBeCalledWith({
        comments: [],
        primaryCommentsCount: 0,
      });
    });

    test("should return array with elements that match the filter and the id - default page and limit", async () => {
      const req = express.request;
      const res = mockResponse();
      req.query = { filter: "post", id: "10" };
      await controller.getAll(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toBeCalledWith({
        comments: [
          localCommentsDB[7],
          localCommentsDB[6],
          localCommentsDB[5],
          localCommentsDB[4],
          localCommentsDB[3],
        ],
        primaryCommentsCount: 7,
      });

      req.query = { filter: "author", id: "10" };
      await controller.getAll(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toBeCalledWith({
        comments: [
          localCommentsDB[7],
          localCommentsDB[6],
          localCommentsDB[5],
          localCommentsDB[4],
          localCommentsDB[3],
        ],
        primaryCommentsCount: 7,
      });

      req.query = { filter: "parent", id: "10" };
      await controller.getAll(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toBeCalledWith({
        comments: [localCommentsDB[5], localCommentsDB[3], localCommentsDB[2]],
        primaryCommentsCount: 3,
      });
    });

    test("should return array with elements that match the filter and the id - random page and limit", async () => {
      const req = express.request;
      const res = mockResponse();
      req.query = {
        filter: "post",
        id: "10",
        previousPageLastCommentIndex: "13",
        limit: "5",
      };
      await controller.getAll(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toBeCalledWith({
        comments: [localCommentsDB[2], localCommentsDB[0]],
        primaryCommentsCount: 7,
      });

      req.query = {
        filter: "author",
        id: "10",
        previousPageLastCommentIndex: "13",
        limit: "3",
      };
      await controller.getAll(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toBeCalledWith({
        comments: [localCommentsDB[2], localCommentsDB[0]],
        primaryCommentsCount: 3,
      });

      req.query = {
        filter: "parent",
        id: "10",
        previousPageLastCommentIndex: "15",
        limit: "4",
      };
      await controller.getAll(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toBeCalledWith({
        comments: [localCommentsDB[3], localCommentsDB[2]],
        primaryCommentsCount: 3,
      });
    });

    test("should return array with elements that have postID === 10 - page excedess returned comments number", async () => {
      const req = express.request;
      const res = mockResponse();
      req.query = {
        filter: "post",
        id: "10",
        previousPageLastCommentIndex: "9",
        limit: "5",
      };
      await controller.getAll(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toBeCalledWith({
        comments: [],
        primaryCommentsCount: 7,
      });
    });

    test("should return error when searching for comments and search text is undefined  - default page and limit", async () => {
      const req = express.request;
      const res = mockResponse();
      req.query = { filter: "search", id: "10" };
      await controller.getAll(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toBeCalledWith({
        message: "Invalid query parameters.",
      });
    });

    test("should return error when searching for comments and search text is an empty string  - default page and limit", async () => {
      const req = express.request;
      const res = mockResponse();
      req.query = { filter: "search", id: "10", searchText: "" };
      await controller.getAll(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toBeCalledWith({
        message: "Invalid query parameters.",
      });
    });

    test("should return empty array when search text is not found among them  - default page and limit", async () => {
      const req = express.request;
      const res = mockResponse();
      req.query = { filter: "search", id: "10", searchText: "igjgjgs" };
      await controller.getAll(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toBeCalledWith({
        comments: [],
        primaryCommentsCount: 0,
      });
    });

    test("should return array with comments that their text includes the searched one  - default page and limit", async () => {
      const req = express.request;
      const res = mockResponse();
      req.query = { filter: "search", id: "10", searchText: "is" };
      await controller.getAll(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toBeCalledWith({
        comments: [
          localCommentsDB[7],
          localCommentsDB[6],
          localCommentsDB[5],
          localCommentsDB[4],
          localCommentsDB[3],
        ],
        primaryCommentsCount: 7,
      });
    });

    test("should return array with comments that their text includes the searched one  - random page and limit", async () => {
      const req = express.request;
      const res = mockResponse();
      req.query = {
        filter: "search",
        id: "10",
        searchText: "is",
        previousPageLastCommentIndex: "13",
        limit: "4",
      };
      await controller.getAll(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toBeCalledWith({
        comments: [localCommentsDB[2], localCommentsDB[0]],
        primaryCommentsCount: 7,
      });
    });

    test("should return array with comments that their text includes the author name  - random page and limit", async () => {
      const req = express.request;
      const res = mockResponse();
      req.query = {
        filter: "search",
        id: "10",
        searchText: "Mihai",
        previousPageLastCommentIndex: "16",
        limit: "6",
      };
      await controller.getAll(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toBeCalledWith({
        comments: [localCommentsDB[5], localCommentsDB[4]],
        primaryCommentsCount: 4,
      });
    });
  });
});

describe("POST tests", () => {
  afterAll(() => {
    comments.pop();
  });
  test("should return an error message when required properties are undefined", async () => {
    const req = express.request;
    const res = mockResponse();
    req.body = {
      text: "This is comment #14",
    };
    req.user = user10;

    await controller.add(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toBeCalledWith({
      message: "All required comment fields must have a value.",
    });

    req.body = {
      id: 10,
    };
    await controller.add(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toBeCalledWith({
      message: "All required comment fields must have a value.",
    });

    req.body = {
      id: 10,
      text: "This is comment #14",
    };
    await controller.add(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toBeCalledWith({
      message: "All required comment fields must have a value.",
    });
  });

  test("should return an error message when post does not exist", async () => {
    const req = express.request;
    const res = mockResponse();
    req.body = {
      postID: 20,
      text: "This is comment #14",
    };
    req.user = user10;

    await controller.add(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toBeCalledWith({
      message: "The post does not exist.",
    });
  });

  test("should return an error message when parent is not part of the same post", async () => {
    const req = express.request;
    const res = mockResponse();
    req.body = {
      postID: 11,
      text: "This is comment #14",
      parentID: 10,
    };
    req.user = user10;

    await controller.add(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toBeCalledWith({
      message:
        "Parent comment is not part of the same post or it does not exist",
    });
  });

  test("should return error message when service throws error", async () => {
    const req = express.request;
    const res = mockResponse();
    const spy = jest
      .spyOn(controller.commentsService, "add")
      .mockImplementation(() => {
        throw new CustomError(400, "Error while adding new comment");
      });
    req.body = {
      postID: 10,
      text: "This is comment #14",
    };
    req.user = user10;

    await controller.add(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toBeCalledWith({
      message: "Error while adding new comment",
    });
    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockRestore();
  });

  test("should return the new post when it was added successfully", async () => {
    const req = express.request;
    const res = mockResponse();
    req.body = {
      postID: 10,
      text: "This is comment #5",
      parentID: undefined,
    };
    req.user = user10;

    await controller.add(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    const response = await controller.CommentsService.get(5);
    expect(response?.text).toBe("This is comment #5");
    expect(response?.parentID).toBe(undefined);
  });
});

describe("PUT tests", () => {
  beforeAll(() => {
    const comment14 = new Comment(
      14,
      10,
      "This is comment #14",
      10,
      undefined,
      new Date(),
      new Date()
    );
    comments.push(comment14);
    localCommentsDB.push(comment14);
  });

  afterAll(() => {
    comments.pop();
    localCommentsDB.pop();
  });

  test("should return an error message when text is omitted", async () => {
    const req = express.request;
    const res = mockResponse();
    req.params = { id: "14" };
    req.body = {
      text: "",
    };
    req.user = user10;

    await controller.update(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toBeCalledWith({
      message: "Please enter the updated text.",
    });

    req.body = {
      text: null,
    };

    await controller.update(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toBeCalledWith({
      message: "Please enter the updated text.",
    });

    req.body = {
      text: undefined,
    };

    await controller.update(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toBeCalledWith({
      message: "Please enter the updated text.",
    });
  });

  test("should return error message when comment to update is undefined", async () => {
    const req = express.request;
    const res = mockResponse();
    req.params = { id: "18" };
    req.body = {
      text: "hey hey",
    };
    req.user = user10;

    await controller.update(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toBeCalledWith({
      message: "The comment with the given id does not exist.",
    });
  });

  test("should return error message when service throws error", async () => {
    const req = express.request;
    const res = mockResponse();
    const spy = jest
      .spyOn(controller.commentsService, "update")
      .mockImplementation(() => {
        throw new CustomError(400, "Error while updating the comment");
      });
    req.params = { id: "14" };
    req.body = {
      text: "Wazaaaa",
    };
    req.user = user10;

    await controller.update(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toBeCalledWith({
      message: "Error while updating the comment",
    });
    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockRestore();
  });

  test("should return updated comment after succesful update", async () => {
    const req = express.request;
    const res = mockResponse();
    req.params = { id: "14" };
    req.body = {
      text: "hey hey",
    };
    req.user = user10;

    await controller.update(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    const response = await controller.CommentsService.get(14);
    expect(response?.text).toBe("hey hey");
  });
});

describe("DELETE tests", () => {
  beforeAll(() => {
    const comment14 = new Comment(
      14,
      10,
      "This is comment #14",
      10,
      undefined,
      new Date(),
      new Date()
    );
    const comment15 = new Comment(
      15,
      10,
      "This is comment #15",
      10,
      10,
      new Date(),
      new Date()
    );
    const comment16 = new Comment(
      16,
      10,
      "This is comment #16",
      10,
      15,
      new Date(),
      new Date()
    );
    // specific author
    const comment17 = new Comment(
      17,
      11,
      "This is comment #17",
      11,
      undefined,
      new Date(),
      new Date()
    );
    // specific author with replies
    const comment18 = new Comment(
      18,
      11,
      "This is comment #18",
      10,
      undefined,
      new Date(),
      new Date()
    );

    const comment19 = new Comment(
      19,
      11,
      "This is comment #19",
      12,
      18,
      new Date(),
      new Date()
    );

    const comment20 = new Comment(
      20,
      11,
      "This is comment #20",
      12,
      18,
      new Date(),
      new Date()
    );
    // specific post
    const comment21 = new Comment(
      21,
      12,
      "This is comment #20",
      12,
      undefined,
      new Date(),
      new Date()
    );

    const comment22 = new Comment(
      22,
      12,
      "This is comment #20",
      12,
      21,
      new Date(),
      new Date()
    );
    localCommentsDB.push(
      comment14,
      comment15,
      comment16,
      comment17,
      comment18,
      comment19,
      comment20,
      comment21,
      comment22
    );
    comments.push(
      comment14,
      comment15,
      comment16,
      comment17,
      comment18,
      comment19,
      comment20,
      comment21,
      comment22
    );
  });
  describe("Delete comment with specific ID", () => {
    test("should return an error message when id is undefined", async () => {
      const req = express.request;
      const res = mockResponse();
      req.params = {};
      req.user = user10;
      await controller.remove(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toBeCalledWith({
        message: "Please provide an id.",
      });
    });

    test("should return an error message when comment with input id is undefined", async () => {
      const req = express.request;
      const res = mockResponse();
      req.params = { id: "122" };
      req.user = user10;
      await controller.remove(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toBeCalledWith({
        message: "The comment with the given id does not exist.",
      });
    });

    test("should return error message when service throws error", async () => {
      const req = express.request;
      const res = mockResponse();
      const spy = jest
        .spyOn(controller.commentsService, "remove")
        .mockImplementation(() => {
          throw new CustomError(400, "Error while removing the comment");
        });
      req.params = { id: "14" };
      req.user = user10;
      await controller.remove(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toBeCalledWith({
        message: "Error while removing the comment",
      });
      expect(spy).toHaveBeenCalledTimes(1);
      spy.mockRestore();
    });

    test("should delete comment with input id", async () => {
      const req = express.request;
      const res = mockResponse();
      req.params = { id: "14" };
      req.user = user10;
      await controller.remove(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toBeCalledWith({
        message: "The comment and its replies were deleted.",
      });

      await controller.get(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toBeCalledWith({
        message: "The comment with the given id does not exist.",
      });
    });

    test("should delete comment with input id and its replies", async () => {
      const req = express.request;
      const res = mockResponse();
      req.params = { id: "15" };
      req.user = user10;
      await controller.remove(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toBeCalledWith({
        message: "The comment and its replies were deleted.",
      });

      await controller.get(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toBeCalledWith({
        message: "The comment with the given id does not exist.",
      });

      req.params = { id: "16" };
      await controller.get(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toBeCalledWith({
        message: "The comment with the given id does not exist.",
      });
    });
  });

  describe("Delete comments with specific filter", () => {
    test("should return an error message when filter or id is undefined", async () => {
      const req = express.request;
      const res = mockResponse();
      req.query = {};
      req.user = user10;
      await controller.removeAll(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toBeCalledWith({
        message: "Invalid query parameters.",
      });
    });

    test("should return error message when service throws error", async () => {
      const req = express.request;
      const res = mockResponse();
      const spy = jest
        .spyOn(controller.commentsService, "removeAll")
        .mockImplementation(() => {
          throw new CustomError(400, "Error while removing comments");
        });
      req.query = {
        filter: "post",
        id: "10",
      };
      req.user = user10;
      await controller.removeAll(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toBeCalledWith({
        message: "Error while removing comments",
      });
      expect(spy).toHaveBeenCalledTimes(1);
      spy.mockRestore();
    });

    test("should delete comments with specific author", async () => {
      const req = express.request;
      const res = mockResponse();
      req.query = {
        filter: "author",
        id: "11",
      };
      req.user = user10;
      await controller.removeAll(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toBeCalledWith({
        message: "The comments and their replies were deleted.",
      });

      req.params = {
        id: "17",
      };
      await controller.get(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toBeCalledWith({
        message: "The comment with the given id does not exist.",
      });
    });

    test("delete comments with specific author and replies", async () => {
      const req = express.request;
      const res = mockResponse();
      req.query = {
        filter: "author",
        id: "10",
      };
      req.user = user10;
      await controller.removeAll(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toBeCalledWith({
        message: "The comments and their replies were deleted.",
      });

      req.params = {
        id: "18",
      };
      await controller.get(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toBeCalledWith({
        message: "The comment with the given id does not exist.",
      });

      req.query = {
        filter: "parent",
        id: "18",
      };
      await controller.getAll(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toBeCalledWith({
        comments: [],
        primaryCommentsCount: 0,
      });
    });

    test("delete comments with specific post", async () => {
      const req = express.request;
      const res = mockResponse();
      req.query = {
        filter: "post",
        id: "12",
      };
      req.user = user10;
      await controller.removeAll(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toBeCalledWith({
        message: "The comments and their replies were deleted.",
      });

      req.query = {
        filter: "post",
        id: "12",
      };
      await controller.getAll(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toBeCalledWith({
        comments: [],
        primaryCommentsCount: 0,
      });
    });
  });
});
