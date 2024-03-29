import { request, response } from "express";
import PostsController from "../../controllers/postsController";
import { posts, comments } from "../../inmemDB";
import Post from "../../models/DTO/post";
import Comment from "../../models/DTO/comment";
import ServiceInjector from "../../services/serviceInjector";
import ServicesRegister from "../../services/servicesRegister";
import ICommentService from "../../services/interfaces/ICommentsService";
import IPostsService from "../../services/interfaces/IPostsService";

let postsController: PostsController;
let postsService: IPostsService;
let commentsService: ICommentService;
beforeAll(() => {
  ServicesRegister.RegisterServices();
  postsService = ServiceInjector.getService<IPostsService>("IPostsService");
  commentsService =
    ServiceInjector.getService<ICommentService>("ICommentsService");
  postsController = new PostsController();
});

describe("get and getByID", () => {
  beforeAll(() => {
    const post4 = new Post(
      4,
      "post4 title",
      "post4 text",
      1,
      new Date(),
      new Date()
    );
    const post5 = new Post(
      5,
      "post5 title",
      "post5 text",
      2,
      new Date(),
      new Date()
    );
    const post6 = new Post(
      6,
      "post6 title",
      "post6 text",
      2,
      new Date(),
      new Date()
    );
    const post7 = new Post(
      7,
      "post7 title",
      "post7 text",
      1,
      new Date(),
      new Date()
    );
    posts.push(post4, post5, post6, post7);
  });

  afterAll(() => {
    posts.splice(3, 4);
  });

  test("should respond with first 6 posts if page and limit are undefined", async () => {
    const req = request;
    const res = response;
    let responseObj = {};
    req.params = {};
    req.query = {};
    res.json = jest.fn().mockImplementation((result) => {
      responseObj = result.data.posts;
    });
    res.status = jest.fn().mockReturnValue(res);

    await postsController.getAll(req, res);
    expect(responseObj).toEqual(posts.slice(0, 6));
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("should respond with first 2 posts when page=1&limit=2", async () => {
    const req = request;
    const res = response;
    let responseObj = {};
    req.params = {};
    req.query = { page: "1", limit: "2" };
    res.json = jest.fn().mockImplementation((result) => {
      responseObj = result.data.posts;
    });
    res.status = jest.fn().mockReturnValue(res);

    await postsController.getAll(req, res);
    expect(responseObj).toEqual([posts[0], posts[1]]);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("should respond with first 2 posts when page=undefined&limit=2", async () => {
    const req = request;
    const res = response;
    let responseObj = {};
    req.params = {};
    req.query = { limit: "2" };
    res.json = jest.fn().mockImplementation((result) => {
      responseObj = result.data.posts;
    });
    res.status = jest.fn().mockReturnValue(res);

    await postsController.getAll(req, res);
    expect(responseObj).toEqual([posts[0], posts[1]]);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("should respond with empty array when page=3&limit=6", async () => {
    const req = request;
    const res = response;
    let responseObj = {};
    req.params = {};
    req.query = { page: "3", limit: "6" };
    res.json = jest.fn().mockImplementation((result) => {
      responseObj = result.data.posts;
    });
    res.status = jest.fn().mockReturnValue(res);

    await postsController.getAll(req, res);
    expect(responseObj).toEqual([]);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("should respond with first max 6 posts matching post title search", async () => {
    const req = request;
    const res = response;
    let responseObj = {};
    req.params = {};
    req.query = { search: "title" };
    res.json = jest.fn().mockImplementation((result) => {
      responseObj = result.data.posts;
    });
    res.status = jest.fn().mockReturnValue(res);

    await postsController.getAll(req, res);
    expect(responseObj).toEqual([posts[3], posts[4], posts[5], posts[6]]);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("should respond with first max 6 posts matching post content search", async () => {
    const req = request;
    const res = response;
    let responseObj = {};
    req.params = {};
    req.query = { search: "text" };
    res.json = jest.fn().mockImplementation((result) => {
      responseObj = result.data.posts;
    });
    res.status = jest.fn().mockReturnValue(res);

    await postsController.getAll(req, res);
    expect(responseObj).toEqual([
      posts[0],
      posts[1],
      posts[2],
      posts[3],
      posts[4],
      posts[5],
    ]);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("should respond with error if no post matches the search", async () => {
    const req = request;
    const res = response;
    let responseObj = {};
    req.params = {};
    req.query = { search: "aaaaaa" };
    res.json = jest.fn().mockImplementation((result) => {
      responseObj = result.message;
    });
    res.status = jest.fn().mockReturnValue(res);

    await postsController.getAll(req, res);
    expect(responseObj).toEqual(
      "There are no posts with given filter criteria."
    );
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("should respond with post with given title", async () => {
    const req = request;
    const res = response;
    let resObj = {};
    req.params = {};
    req.query = { type: "title", title: "post2" };
    res.json = jest.fn().mockImplementation((result) => {
      resObj = result.data.posts;
    });
    res.status = jest.fn().mockReturnValue(res);

    await postsController.getAll(req, res);
    expect(resObj).toEqual([posts[1]]);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("should respond with post with given author", async () => {
    const req = request;
    const res = response;
    let resObj = {};
    req.params = {};
    req.query = { type: "author", author: "2" };
    res.json = jest.fn().mockImplementation((result) => {
      resObj = result.data.posts;
    });
    res.status = jest.fn().mockReturnValue(res);

    await postsController.getAll(req, res);
    expect(resObj).toEqual([posts[1], posts[2], posts[4], posts[5]]);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("should respond with post with corresponding ID", async () => {
    const req = request;
    const res = response;
    let responseObject = {};
    req.params = { id: "1" };
    req.query = {};
    res.json = jest.fn().mockImplementation((result) => {
      responseObject = result.data;
    });
    res.status = jest.fn().mockReturnValue(res);

    await postsController.get(req, res);
    expect(responseObject).toEqual(posts[0]);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("should respond with error if given ID doesn't exist", async () => {
    const req = request;
    const res = response;
    let responseObject = {};
    req.params = { id: "10" };
    req.query = {};
    res.json = jest.fn().mockImplementation((result) => {
      responseObject = result;
    });
    res.status = jest.fn().mockReturnValue(res);

    await postsController.get(req, res);
    expect(responseObject).toEqual({
      message: "The post with the given ID does not exist.",
    });
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("should respond with error if given ID is not a number", async () => {
    const req = request;
    const res = response;
    let responseObject = {};
    req.params = { id: "a" };
    req.query = {};
    res.json = jest.fn().mockImplementation((result) => {
      responseObject = result;
    });
    res.status = jest.fn().mockReturnValue(res);

    await postsController.get(req, res);
    expect(responseObject).toEqual({
      message: "The post with the given ID does not exist.",
    });
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("should respond with error if given author has no posts", async () => {
    const req = request;
    const res = response;
    let responseObject = {};
    req.params = {};
    req.query = { type: "author", author: "10" };
    res.json = jest.fn().mockImplementation((result) => {
      responseObject = result;
    });
    res.status = jest.fn().mockReturnValue(res);

    await postsController.getAll(req, res);
    expect(responseObject).toEqual({
      message: "There are no posts with given filter criteria.",
    });
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("should respond with error if there is no post with given title", async () => {
    const req = request;
    const res = response;
    let responseObject = {};
    req.params = {};
    req.query = { type: "title", title: "test" };
    res.json = jest.fn().mockImplementation((result) => {
      responseObject = result;
    });
    res.status = jest.fn().mockReturnValue(res);

    await postsController.getAll(req, res);
    expect(responseObject).toEqual({
      message: "There are no posts with given filter criteria.",
    });
    expect(res.status).toHaveBeenCalledWith(404);
  });
});

describe("add", () => {
  afterEach(() => {
    posts.splice(3, 1);
  });

  test("should respond with error if required elements are not provided", async () => {
    const req = request;
    const res = response;
    let responseObject = {};
    req.params = {};
    req.query = {};
    req.body = {
      title: "new post",
      author: 2,
    };
    req.user = {
      name: "admin",
      email: "admin@localhost.com",
      password: "123456",
      id: 2,
      isAdmin: false,
      active: true,
      image: "",
    };
    res.json = jest.fn().mockImplementation((result) => {
      responseObject = result;
    });
    res.status = jest.fn().mockReturnValue(res);

    await postsController.add(req, res);
    expect(responseObject).toEqual({
      message: "The post elements should have a value.",
    });
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("should add new post", async () => {
    const req = request;
    const res = response;
    let responseObject = {};
    req.params = {};
    req.query = {};
    req.body = {
      title: "new post",
      content: "new content",
      author: 3,
    };
    req.user = {
      name: "admin",
      email: "admin@localhost.com",
      password: "123456",
      id: 3,
      isAdmin: false,
      active: true,
      image: "",
    };
    res.json = jest.fn().mockImplementation((result) => {
      responseObject = result.data;
    });
    res.status = jest.fn().mockReturnValue(res);

    await postsController.add(req, res);
    expect((responseObject as Post).title).toEqual("new post");
    expect((responseObject as Post).content).toEqual("new content");
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe("update", () => {
  beforeEach(() => {
    posts.push(new Post(4, "post4", "post4 text", 3, new Date(), new Date()));
  });
  afterEach(() => {
    posts.splice(3, 1);
  });

  test("should respond with error if given ID is wrong", async () => {
    const req = request;
    const res = response;
    let responseObject = {};
    req.params = { id: "10" };
    req.query = {};
    req.body = {
      title: "updated title",
      content: "updated content",
      author: 1,
    };
    req.user = {
      name: "admin",
      email: "admin@localhost.com",
      password: "123456",
      id: 1,
      isAdmin: false,
      active: true,
      image: "",
    };
    res.json = jest.fn().mockImplementation((result) => {
      responseObject = result;
    });
    res.status = jest.fn().mockReturnValue(res);

    await postsController.update(req, res);
    expect(responseObject).toEqual({
      message: "The post with the given ID does not exist.",
    });
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("should respond with error if given ID is not a number", async () => {
    const req = request;
    const res = response;
    let responseObject = {};
    req.params = { id: "a" };
    req.query = {};
    req.body = {
      title: "updated title",
      content: "updated content",
      author: 1,
    };
    req.user = {
      name: "admin",
      email: "admin@localhost.com",
      password: "123456",
      id: 1,
      isAdmin: false,
      active: true,
      image: "",
    };
    res.json = jest.fn().mockImplementation((result) => {
      responseObject = result;
    });
    res.status = jest.fn().mockReturnValue(res);

    await postsController.update(req, res);
    expect(responseObject).toEqual({
      message: "The post with the given ID does not exist.",
    });
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("should respond with error if required fields have no value.", async () => {
    const req = request;
    const res = response;
    let responseObject = {};
    req.params = { id: "1" };
    req.query = {};
    req.body = {
      title: "",
      content: "",
      author: 1,
    };
    req.user = {
      name: "admin",
      email: "admin@localhost.com",
      password: "123456",
      id: 1,
      isAdmin: false,
      active: true,
      image: "",
    };
    res.json = jest.fn().mockImplementation((result) => {
      responseObject = result;
    });
    res.status = jest.fn().mockReturnValue(res);

    await postsController.update(req, res);
    expect(responseObject).toEqual({
      message: "The post elements should have a value.",
    });
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("should only update the field requested to change", async () => {
    const req = request;
    const res = response;
    let responseObject = {};
    req.params = { id: "1" };
    req.query = {};
    req.body = {
      title: "new title for post #1",
    };
    res.json = jest.fn().mockImplementation((result) => {
      responseObject = result.data;
    });
    res.status = jest.fn().mockReturnValue(res);

    await postsController.update(req, res);
    expect((responseObject as Post).title).toEqual("new title for post #1");
    expect((responseObject as Post).content).toEqual("post1 text");
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("should update all the fields requested to change", async () => {
    const req = request;
    const res = response;
    let responseObject = {};
    req.params = { id: "1" };
    req.query = {};
    req.body = {
      title: "new title for post #1",
      content: "new content for post #1",
    };
    res.json = jest.fn().mockImplementation((result) => {
      responseObject = result.data;
    });
    res.status = jest.fn().mockReturnValue(res);

    await postsController.update(req, res);
    expect((responseObject as Post).title).toEqual("new title for post #1");
    expect((responseObject as Post).content).toEqual("new content for post #1");
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe("delete", () => {
  beforeEach(() => {
    posts.push(new Post(4, "post4", "post4 text", 3, new Date(), new Date()));
    comments.push(
      new Comment(
        5,
        4,
        "this coment is related to post #4",
        2,
        undefined,
        new Date(),
        new Date()
      ),
      new Comment(
        6,
        4,
        "this coment is related to post #4 and comment #5",
        1,
        5,
        new Date(),
        new Date()
      )
    );
  });
  afterEach(() => {
    posts.splice(3, 1);
    comments.splice(4, 2);
  });

  test("should respond with error if given ID doesn't exist", async () => {
    const req = request;
    const res = response;
    let responseObject = {};
    req.params = { id: "10" };
    req.query = {};
    res.json = jest.fn().mockImplementation((result) => {
      responseObject = result;
    });
    res.status = jest.fn().mockReturnValue(res);

    await postsController.delete(req, res);
    expect(responseObject).toEqual({
      message: "The post with the given ID does not exist.",
    });
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("should respond with error if given ID is not a number", async () => {
    const req = request;
    const res = response;
    let responseObject = {};
    req.params = { id: "a" };
    req.query = {};
    res.json = jest.fn().mockImplementation((result) => {
      responseObject = result;
    });
    res.status = jest.fn().mockReturnValue(res);

    await postsController.delete(req, res);
    expect(responseObject).toEqual({
      message: "The post with the given ID does not exist.",
    });
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("delete the post with given ID and all corresponding comments", async () => {
    const req = request;
    const res = response;
    let responseObject = {};
    req.params = { id: "4" };
    req.query = {};
    req.user = {
      name: "admin",
      email: "admin@localhost.com",
      password: "123456",
      id: 3,
      isAdmin: false,
      active: true,
      image: "",
    };
    res.json = jest.fn().mockImplementation((result) => {
      responseObject = result;
    });
    res.status = jest.fn().mockReturnValue(res);

    await postsController.delete(req, res);
    try {
      await postsService.get(4);
    } catch (error) {
      expect((error as Error).message).toEqual(
        "The post with the given ID does not exist."
      );
    }
    try {
      await commentsService.get(5);
    } catch (error) {
      expect((error as Error).message).toEqual(
        "The comment with the given id does not exist."
      );
    }
    try {
      await commentsService.get(6);
    } catch (error) {
      expect((error as Error).message).toEqual(
        "The comment with the given id does not exist."
      );
    }
    expect(responseObject).toEqual({
      message: "The post and its corresponding comments were deleted.",
      postId: 4,
    });
    expect(res.status).toHaveBeenLastCalledWith(200);
  });
});
