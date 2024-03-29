import express from "express";
import { users, posts, comments } from "../../inmemDB";
import UsersController from "../../controllers/usersController";
import User from "../../models/DTO/user";
import Post from "../../models/DTO/post";
import Comment from "../../models/DTO/comment";
import ServicesRegister from "../../services/servicesRegister";

let usersController: UsersController;
const mockResponse = () => {
  const res = express.response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const lastUserId = users[users.length - 1].id;
const lastPostId = posts[posts.length - 1].id;
const lastCommentId = comments[comments.length - 1].id;

const usersLengthBeforeTestSeed = users.length;

let user1: User;
let user2: User;
let user3: User;
let post1: Post;
let post2: Post;
let post3: Post;
let comment1: Comment;
let comment2: Comment;
let comment3: Comment;
let comment4: Comment;
let comment5: Comment;
let comment6: Comment;
let comment7: Comment;
function addTestDBSeed() {
  user1 = new User(
    lastUserId + 1,
    "Denis",
    "denis@mail.com",
    "password",
    true,
    new Date(),
    new Date()
  );
  user2 = new User(
    lastUserId + 2,
    "Andrei",
    "andrei@mail.com",
    "password",
    false,
    new Date(),
    new Date()
  );
  user3 = new User(
    lastUserId + 3,
    "Adrian",
    "adrian@mail.com",
    "password",
    false,
    new Date(),
    new Date()
  );

  post1 = new Post(
    lastPostId + 1,
    "postTest1",
    "post1 text",
    user1.id,
    new Date(),
    new Date()
  );
  post2 = new Post(
    lastPostId + 2,
    "postTest2",
    "post2 text",
    user2.id,
    new Date(),
    new Date()
  );
  post3 = new Post(
    lastPostId + 3,
    "postTest3",
    "post3 text",
    user2.id,
    new Date(),
    new Date()
  );

  // first level comments
  comment1 = new Comment(
    lastCommentId + 1,
    post1.id,
    "this is TEST comment #1",
    user1.id,
    undefined,
    new Date(2021, 12, 19),
    new Date(2021, 12, 19)
  );
  comment2 = new Comment(
    lastCommentId + 2,
    post2.id,
    "this is TEST comment #2",
    user1.id,
    undefined,
    new Date(2021, 12, 20),
    new Date(2021, 12, 20)
  );
  comment3 = new Comment(
    lastCommentId + 3,
    post3.id,
    "this is TEST comment #3",
    user2.id,
    undefined,
    new Date(2021, 12, 20),
    new Date(2021, 12, 20)
  );
  comment4 = new Comment(
    lastCommentId + 4,
    post3.id,
    "this is TEST comment #4",
    user3.id,
    undefined,
    new Date(2021, 12, 20),
    new Date(2021, 12, 20)
  );

  // replies
  comment5 = new Comment(
    lastCommentId + 5,
    post2.id,
    "this is TEST comment #5 - reply",
    user1.id,
    comment2.id,
    new Date(2021, 12, 19),
    new Date(2021, 12, 19)
  );
  comment6 = new Comment(
    lastCommentId + 6,
    post2.id,
    "this is TEST comment #6 - reply",
    user2.id,
    comment2.id,
    new Date(2021, 12, 20),
    new Date(2021, 12, 20)
  );
  comment7 = new Comment(
    lastCommentId + 7,
    post3.id,
    "this is TEST comment #7 - reply",
    user2.id,
    comment4.id,
    new Date(2021, 12, 20),
    new Date(2021, 12, 20)
  );
  users.push(user1, user2, user3);
  posts.push(post1, post2, post3);
  comments.push(
    comment1,
    comment2,
    comment3,
    comment4,
    comment5,
    comment6,
    comment7
  );
}

function removeTestDBSeed() {
  for (let i = 0; i < users.length; i += 1) {
    if (users[i].id > lastUserId) {
      users.splice(i, 1);
      i -= 1;
    }
  }
}

beforeAll(() => {
  ServicesRegister.RegisterServices();
  usersController = new UsersController();
  addTestDBSeed();
});

afterAll(() => {
  removeTestDBSeed();
});

describe("GET tests", () => {
  test("usersController.getAll should return all users", async () => {
    const req = express.request;
    req.params = {};
    req.query = { page: "1", limit: "10" };
    const res = mockResponse();

    await usersController.getAll(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      data: { users, count: users.length },
      message: "Users successfully retrieved.",
    });
  });

  test("usersController.get should return user with id = 4", async () => {
    const req = express.request;
    req.params = { id: `${lastUserId + 1}` };
    req.user = user1;
    const res = mockResponse();

    await usersController.get(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      data: users[usersLengthBeforeTestSeed],
      message: "User successfully retrieved.",
    });
  });

  test("usersController.get should return an error message when an user doesn't exist", async () => {
    const req = express.request;
    req.params = { id: "100" };
    req.user = user1;
    const res = mockResponse();

    await usersController.get(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "The user with the given id does not exist.",
    });
  });

  test("usersController.get should return an error message when the user id is not in the correct format", async () => {
    const req = express.request;
    req.params = { id: "a" };
    req.user = user1;
    const res = mockResponse();

    await usersController.get(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "The user with the given id does not exist.",
    });
  });

  test("usersController.getAll should return user with email=vlad@mail.com", async () => {
    const req = express.request;
    req.query = { email: "vlad@mail.com" };
    const res = mockResponse();

    await usersController.getAll(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      data: { users: [users[1]], count: 1 },
      message: "Users successfully retrieved.",
    });
  });

  test("usersController.getAll should return an empty array if user email doesn't exist", async () => {
    const req = express.request;
    req.query = { email: "vlad1@mail.com" };
    const res = mockResponse();

    await usersController.getAll(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      data: { users: [], count: 0 },
      message: "Users successfully retrieved.",
    });
  });
});

describe("GET with search and pagination tests", () => {
  let user4: User;
  let user5: User;
  let user6: User;
  beforeAll(() => {
    user4 = new User(
      lastUserId + 4,
      "Ene",
      "ene@mail.com",
      "password",
      true,
      new Date(),
      new Date()
    );
    user5 = new User(
      lastUserId + 5,
      "Mihaela",
      "mihaela@mail.com",
      "password",
      false,
      new Date(),
      new Date()
    );
    user6 = new User(
      lastUserId + 6,
      "Elena",
      "elena@mail.com",
      "password",
      false,
      new Date(),
      new Date()
    );

    users.push(user4, user5, user6);
  });

  afterAll(() => {
    for (let i = 0; i < 3; i += 1) {
      users.pop();
    }
  });

  test("usersController.getAll page=2, limit=3 should return [user1, user2, user3]", async () => {
    const req = express.request;
    req.params = {};
    req.query = { page: "2", limit: "3" };
    const res = mockResponse();

    await usersController.getAll(req, res);

    const expectedUsers = [user1, user2, user3];
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      data: { users: expectedUsers, count: 9 },
      message: "Users successfully retrieved.",
    });
  });

  test("usersController.getAll page=3, limit=3 should return [user4, user5, user6]", async () => {
    const req = express.request;
    req.params = {};
    req.query = { page: "3", limit: "3" };
    const res = mockResponse();

    await usersController.getAll(req, res);

    const expectedUsers = [user4, user5, user6];
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      data: { users: expectedUsers, count: 9 },
      message: "Users successfully retrieved.",
    });
  });

  test("usersController.getAll page=4, limit=2 should return [user4, user5]", async () => {
    const req = express.request;
    req.params = {};
    req.query = { page: "4", limit: "2" };
    const res = mockResponse();

    await usersController.getAll(req, res);

    const expectedUsers = [user4, user5];
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      data: { users: expectedUsers, count: 9 },
      message: "Users successfully retrieved.",
    });
  });

  test("usersController.getAll search=denis should return [user1]", async () => {
    const req = express.request;
    req.query = { search: "denis" };
    const res = mockResponse();

    await usersController.getAll(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      data: { users: [users[3]], count: 1 },
      message: "Users successfully retrieved.",
    });
  });

  test("usersController.getAll search=an should return [user2, user3]", async () => {
    const req = express.request;
    req.query = { search: "an" };
    const res = mockResponse();

    await usersController.getAll(req, res);

    const expectedUsers = [user2, user3];
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      data: { users: expectedUsers, count: 2 },
      message: "Users successfully retrieved.",
    });
  });

  test("usersController.getAll search=e, page=2, limit=2 should return [user4, user5]", async () => {
    const req = express.request;
    req.query = { page: "2", limit: "2", search: "e" };
    const res = mockResponse();

    await usersController.getAll(req, res);

    const expectedUsers = [user4, user5];
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      data: { users: expectedUsers, count: 5 },
      message: "Users successfully retrieved.",
    });
  });
});

describe("POST tests", () => {
  afterAll(() => {
    removeTestDBSeed();
  });
  test("usersController.post should return the new user and a confirmation message when a new user was added successfully", async () => {
    const req = express.request;
    req.body = {
      name: "Sarah",
      email: "sarah@mail.com",
      password: "password",
    };
    const res = mockResponse();

    await usersController.post(req, res);
    const userResponse = await usersController.usersService.get(lastUserId + 4);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(userResponse?.name).toBe("Sarah");
    expect(userResponse?.email).toBe("sarah@mail.com");

    await usersController.post(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "An user with the specified email already exists.",
    });
  });

  test.each([
    { sentData: { name: "Sarah" }, receivedData: '"email" is required' },
    {
      sentData: { name: "Sarah", email: "sarah@mail.com" },
      receivedData: '"password" is required',
    },
    {
      sentData: { name: "Sarah", password: "password" },
      receivedData: '"email" is required',
    },
    {
      sentData: { name: "Sarah", email: "sarah@mail", password: "password" },
      receivedData: '"email" must be a valid email',
    },
    {
      sentData: {
        name: "Sarah",
        email: "sarah@mail.mail",
        password: "password",
      },
      receivedData: '"email" must be a valid email',
    },
  ])(
    "usersController.post should return an error message for request with invalid data",
    async ({ sentData, receivedData }) => {
      const req = express.request;
      req.body = {
        name: sentData.name,
        email: sentData.email,
        password: sentData.password,
      };
      const res = mockResponse();

      await usersController.post(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: receivedData,
      });
    }
  );
});

describe("PUT tests", () => {
  beforeAll(() => {
    addTestDBSeed();
  });
  afterAll(() => {
    removeTestDBSeed();
  });
  test("usersController.update should update the user with id = x and return the updated user", async () => {
    const req = express.request;
    req.params = { id: `${user1.id}` };
    req.body = {
      name: "Denis",
      email: "denis@mail.com",
      password: "password",
    };
    req.user = user1;
    const res = mockResponse();

    await usersController.update(req, res);
    const userResponse = await usersController.usersService.get(user1.id);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      data: user1,
      message: "User updated.",
    });
    expect(userResponse?.name).toBe("Denis");
    expect(userResponse?.email).toBe("denis@mail.com");
  });

  test("usersController.update should return an error message for request if the user doesn't exist", async () => {
    const req = express.request;
    req.params = { id: "8" };
    req.body = {
      name: "Sarah1",
      email: "sarah1@mail.com",
      password: "password",
    };
    req.user = user1;
    const res = mockResponse();

    await usersController.update(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "The user with the given id does not exist.",
    });
  });

  test("usersController.update should return an error message when the user id is not in the correct format", async () => {
    const req = express.request;
    req.params = { id: "abc" };
    req.body = {
      name: "Sarah1",
      email: "sarah1@mail.com",
      password: "password",
    };
    req.user = user1;
    const res = mockResponse();

    await usersController.update(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "The user with the given id does not exist.",
    });
  });

  test.each([
    {
      sentData: { name: "S" },
      receivedData: '"name" length must be at least 3 characters long',
    },
    {
      sentData: { name: "Sarah", password: "pass" },
      receivedData: '"password" length must be at least 6 characters long',
    },
    {
      sentData: { name: "Sarah", email: "sarah@mail", password: "password" },
      receivedData: '"email" must be a valid email',
    },
    {
      sentData: {
        name: "Sarah",
        email: "sarah@mail.mail",
        password: "password",
      },
      receivedData: '"email" must be a valid email',
    },
  ])(
    "usersController.update should return an error message for request with invalid data",
    async ({ sentData, receivedData }) => {
      const req = express.request;
      req.params = { id: `${user2.id}` };
      req.body = {
        name: sentData.name,
        email: sentData.email,
        password: sentData.password,
      };
      req.user = user2;
      const res = mockResponse();

      await usersController.update(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: receivedData,
      });
    }
  );

  test("usersController.update should update all or less fields from a user", async () => {
    const req = express.request;
    req.params = { id: `${user3.id}` };
    req.body = {
      name: "Florin",
    };
    req.user = user3;
    const res = mockResponse();

    await usersController.update(req, res);
    const userResponse = await usersController.usersService.get(user3.id);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      data: user3,
      message: "User updated.",
    });
    expect(userResponse?.name).toBe("Florin");
    expect(userResponse?.email).toBe("adrian@mail.com");
  });
});

describe("DELETE tests", () => {
  describe("DELETE specific user", () => {
    beforeAll(() => {
      addTestDBSeed();
    });
    afterAll(() => {
      removeTestDBSeed();
    });
    test("usersController.delete should set the status of user with id = x to 'Inactive' and send a confirmation message", async () => {
      const req = express.request;
      req.params = { id: `${user1.id}` };
      req.user = user1;
      const res = mockResponse();

      await usersController.delete(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        data: user1,
        message: "User status set to inactive.",
      });

      await usersController.get(req, res);
      const allUsersResponse = await usersController.usersService.getAll(1, 10);
      const userResponse1 = await usersController.usersService.get(user1.id);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        data: user1,
        message: "User successfully retrieved.",
      });
      expect(allUsersResponse.users.length).toBe(usersLengthBeforeTestSeed + 3);
      expect(userResponse1?.active).toBe(false);
    });

    test("usersController.delete id should return an error message for request if the user doesn't exist", async () => {
      const req = express.request;
      req.params = { id: "8" };
      req.user = user1;
      const res = mockResponse();

      await usersController.delete(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "The user with the given id does not exist.",
      });
    });

    test("usersController.delete id should return an error message when the user id is not in the correct format", async () => {
      const req = express.request;
      req.params = { id: "abc" };
      req.user = user1;
      const res = mockResponse();

      await usersController.delete(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "The user with the given id does not exist.",
      });
    });
  });

  describe("DELETE tests for user and coresponding posts (and coresponding comments and replies)", () => {
    beforeAll(() => {
      addTestDBSeed();
    });
    afterAll(() => {
      removeTestDBSeed();
    });
    test("usersController.delete should set the status of user with id = x to 'Inactive', delete its posts (and coresponding comments)", async () => {
      const req = express.request;
      req.params = { id: `${user2.id}` };
      req.query = { deletePosts: "yes" };
      req.user = user2;
      const res = mockResponse();

      await usersController.delete(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        data: user2,
        message: "User status set to inactive and posts deleted.",
      });

      await usersController.get(req, res);
      const allUsersResponse = await usersController.usersService.getAll(1, 10);
      const userResponse2 = await usersController.usersService.get(user2.id);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        data: user2,
        message: "User successfully retrieved.",
      });
      expect(allUsersResponse.users.length).toBe(usersLengthBeforeTestSeed + 3);
      expect(userResponse2?.name).toBe("Andrei");
      expect(userResponse2?.active).toBe(false);
    });
  });

  describe("DELETE tests for user and coresponding comments(and replies)", () => {
    beforeAll(() => {
      addTestDBSeed();
    });
    afterAll(() => {
      removeTestDBSeed();
    });
    test("usersController.delete should set the status of user with id = x to 'Inactive' and delete its comments(and coresponding replies)", async () => {
      const req = express.request;
      req.params = { id: `${user2.id}` };
      req.query = { deleteComments: "yes" };
      req.user = user2;
      const res = mockResponse();

      await usersController.delete(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        data: user2,
        message: "User status set to inactive and comments deleted.",
      });
    });
  });

  describe("DELETE tests for user and coresponding posts and comments(and replies)", () => {
    beforeAll(() => {
      addTestDBSeed();
    });
    afterAll(() => {
      removeTestDBSeed();
    });
    test("usersController.delete should set the status of user with id = x to 'Inactive' and delete its posts and comments(and coresponding replies)", async () => {
      const req = express.request;
      req.user = user2;
      req.params = { id: `${user2.id}` };
      req.query = {
        deletePosts: "yes",
        deleteComments: "yes",
      };
      const res = mockResponse();

      await usersController.delete(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        data: user2,
        message:
          "User status set to inactive and posts deleted and comments deleted.",
      });
    });
  });
});
