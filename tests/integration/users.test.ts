import request from "supertest";
import fs from "fs";
import app from "../../app";
import { users, posts, comments } from "../../inmemDB";
import User from "../../models/DTO/user";
import Post from "../../models/DTO/post";
import Comment from "../../models/DTO/comment";

const authToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwiZW1haWwiOiJhZG1pbkBsb2NhbGhvc3QuY29tIiwidXNlcklkIjoxLCJpc0FkbWluIjp0cnVlLCJhY3RpdmUiOnRydWUsImlhdCI6MTY1MDk2MjkxOS44NywiZXhwIjo2MDE2NTA5NjI4NTl9.0EXynilyaf5Xi_xOytKQPAuqDJTi1rPph-Ao2ffIluo";
const lastUserId = users[users.length - 1].id;
const lastPostId = posts[posts.length - 1].id;
const lastCommentId = comments[comments.length - 1].id;

const usersLengthBeforeTestSeed = users.length;
const postsLengthBeforeTestSeed = posts.length;

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
    false,
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
    new Date(),
    true,
    "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"
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
    new Date(2021, 12, 19),
    new Date(2021, 12, 19)
  );
  comment3 = new Comment(
    lastCommentId + 3,
    post3.id,
    "this is TEST comment #3",
    user2.id,
    undefined,
    new Date(2021, 12, 19),
    new Date(2021, 12, 19)
  );
  comment4 = new Comment(
    lastCommentId + 4,
    post3.id,
    "this is TEST comment #4",
    user3.id,
    undefined,
    new Date(2021, 12, 19),
    new Date(2021, 12, 19)
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
  for (let i = 0; i < posts.length; i += 1) {
    if (posts[i].id > lastPostId) {
      posts.splice(i, 1);
      i -= 1;
    }
  }
  for (let i = 0; i < comments.length; i += 1) {
    if (comments[i].id > lastCommentId) {
      comments.splice(i, 1);
      i -= 1;
    }
  }
}

beforeAll(async () => {
  await request(app).post("/api/setup").send({
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: "root",
    password: "root",
    database: "juniorblogapi",
  });
  addTestDBSeed();
});
afterAll(() => {
  removeTestDBSeed();
});

describe("GET tests", () => {
  test("'GET /api/users' should return all users", async () => {
    const response = await request(app)
      .get("/api/users?page=1&limit=10")
      .set("Authorization", `Bearer ${authToken}`)
      .expect("Content-Type", "application/json; charset=utf-8")
      .expect(200);
    expect(response.body.data.count).toBe(usersLengthBeforeTestSeed + 3);
    expect(response.body.data.users[usersLengthBeforeTestSeed - 1].name).toBe(
      "Maria"
    );
    expect(response.body.data.users[usersLengthBeforeTestSeed].name).toBe(
      "Denis"
    );
    expect(response.body.data.users[usersLengthBeforeTestSeed + 1].name).toBe(
      "Andrei"
    );
    expect(response.body.data.users[usersLengthBeforeTestSeed + 2].name).toBe(
      "Adrian"
    );
  });

  test("'GET /api/users/1' should return user with id = 1", async () => {
    const res = await request(app)
      .get("/api/users/1")
      .set("Authorization", `Bearer ${authToken}`)
      .expect("Content-Type", "application/json; charset=utf-8")
      .expect(200);
    expect(res.body.data.id).toBe(1);
    expect(res.body.data.name).toBe("Mihai");
    expect(res.body.data.email).toBe("mihai@mail.com");
  });

  test("GET should return an error message when an user doesn't exist", async () => {
    const res = await request(app)
      .get("/api/users/8")
      .set("Authorization", `Bearer ${authToken}`)
      .expect("Content-Type", "application/json; charset=utf-8")
      .expect(404);
    expect(res.body.message).toBe("The user with the given id does not exist.");
  });

  test("'GET /api/users?email=vlad@mail.com' should return user with specific email", async () => {
    const res = await request(app)
      .get("/api/users?email=vlad@mail.com")
      .set("Authorization", `Bearer ${authToken}`)
      .expect("Content-Type", "application/json; charset=utf-8")
      .expect(200);
    expect(res.body.data.users[0].name).toBe("Vlad");
    expect(res.body.data.users[0].id).toBe(2);
  });

  test("'GET /api/users?email=vlad1@mail.com' should return an empty array if user email doesn't exist", async () => {
    const res = await request(app)
      .get("/api/users?email=vlad1@mail.com")
      .set("Authorization", `Bearer ${authToken}`)
      .expect("Content-Type", "application/json; charset=utf-8")
      .expect(200);
    expect(res.body.data.users).toEqual([]);
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
    users.pop();
    users.pop();
    users.pop();
  });

  test("'GET /api/users?page=2&limit=3' should return [user1, user2, user3]", async () => {
    const response = await request(app)
      .get("/api/users?page=2&limit=3")
      .set("Authorization", `Bearer ${authToken}`)
      .expect("Content-Type", "application/json; charset=utf-8")
      .expect(200);
    expect(response.body.data.count).toBe(9);
    expect(response.body.data.users[0].name).toBe("Denis");
    expect(response.body.data.users[1].name).toBe("Andrei");
    expect(response.body.data.users[2].name).toBe("Adrian");
  });

  test("'GET /api/users?page=3&limit=3' should return [user4, user5, user6]", async () => {
    const response = await request(app)
      .get("/api/users?page=3&limit=3")
      .set("Authorization", `Bearer ${authToken}`)
      .expect("Content-Type", "application/json; charset=utf-8")
      .expect(200);
    expect(response.body.data.count).toBe(9);
    expect(response.body.data.users[0].name).toBe("Ene");
    expect(response.body.data.users[1].name).toBe("Mihaela");
    expect(response.body.data.users[2].name).toBe("Elena");
  });

  test("'GET /api/users?page=4&limit=2' should return [user4, user5]", async () => {
    const response = await request(app)
      .get("/api/users?page=4&limit=2")
      .set("Authorization", `Bearer ${authToken}`)
      .expect("Content-Type", "application/json; charset=utf-8")
      .expect(200);
    expect(response.body.data.count).toBe(9);
    expect(response.body.data.users[0].name).toBe("Ene");
    expect(response.body.data.users[1].name).toBe("Mihaela");
  });

  test("'GET /api/users?search=denis' should return [user1]", async () => {
    const response = await request(app)
      .get("/api/users?search=denis")
      .set("Authorization", `Bearer ${authToken}`)
      .expect("Content-Type", "application/json; charset=utf-8")
      .expect(200);
    expect(response.body.data.count).toBe(1);
    expect(response.body.data.users[0].name).toBe("Denis");
  });

  test("'GET /api/users?search=an' should return [user2, user3]", async () => {
    const response = await request(app)
      .get("/api/users?search=an")
      .set("Authorization", `Bearer ${authToken}`)
      .expect("Content-Type", "application/json; charset=utf-8")
      .expect(200);
    expect(response.body.data.count).toBe(2);
    expect(response.body.data.users[0].name).toBe("Andrei");
    expect(response.body.data.users[1].name).toBe("Adrian");
  });

  test("'GET /api/users?search=e&page=2&limit=2' should return [user4, user5]", async () => {
    const response = await request(app)
      .get("/api/users?search=e&page=2&limit=2")
      .set("Authorization", `Bearer ${authToken}`)
      .expect("Content-Type", "application/json; charset=utf-8")
      .expect(200);
    expect(response.body.data.count).toBe(5);
    expect(response.body.data.users[0].name).toBe("Ene");
    expect(response.body.data.users[1].name).toBe("Mihaela");
  });
});

describe("POST tests", () => {
  afterAll(() => {
    removeTestDBSeed();
  });
  test("'POST /api/users' should return the new user and a confirmation message when a new user was added successfully", async () => {
    let res = await request(app)
      .post("/api/users")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        name: "Sarah",
        email: "sarah@mail.com",
        password: "password",
      })
      .expect("Content-Type", "application/json; charset=utf-8")
      .expect(201);
    expect(res.body.data.name).toBe("Sarah");
    expect(res.body.data.email).toBe("sarah@mail.com");
    expect(res.body.message).toBe("User added.");

    res = await request(app)
      .post("/api/users")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        name: "Sarah",
        email: "sarah@mail.com",
        password: "password",
      })
      .expect("Content-Type", "application/json; charset=utf-8")
      .expect(400);
    expect(res.body.message).toBe(
      "An user with the specified email already exists."
    );
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
    "POST request with invalid data should return an error message",
    async ({ sentData, receivedData }) => {
      const response = await request(app)
        .post("/api/users")
        .set("Authorization", `Bearer ${authToken}`)
        .expect("Content-type", "application/json; charset=utf-8")
        .send(sentData)
        .expect(400);
      expect(response.body.message).toBe(receivedData);
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
  test("'PUT /api/users/x' should update the user with id = x and return the updated user", async () => {
    const res = await request(app)
      .put(`/api/users/${user1.id}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        name: "Denis",
        email: "denis@mail.com",
        password: "password",
      })
      .expect("Content-Type", "application/json; charset=utf-8")
      .expect(200);
    expect(res.body.data.id).toBe(user1.id);
    expect(res.body.data.name).toBe("Denis");
    expect(res.body.data.email).toBe("denis@mail.com");
    expect(res.body.message).toBe("User updated.");
  });

  test("PUT request for an absent user should return an error message", async () => {
    const res = await request(app)
      .put("/api/users/8")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        name: "Sarah1",
        email: "sarah1@mail.com",
        password: "password1",
      })
      .expect("Content-Type", "application/json; charset=utf-8")
      .expect(404);
    expect(res.body.message).toBe("The user with the given id does not exist.");
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
    "PUT request with invalid data should return an error message",
    async ({ sentData, receivedData }) => {
      const response = await request(app)
        .put(`/api/users/${user2.id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect("Content-type", "application/json; charset=utf-8")
        .send(sentData)
        .expect(400);
      expect(response.body.message).toBe(receivedData);
    }
  );

  test("PUT request should update all or less fields from a user", async () => {
    const res = await request(app)
      .put(`/api/users/${user3.id}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        name: "Florin",
      })
      .expect("Content-Type", "application/json; charset=utf-8")
      .expect(200);
    expect(res.body.data.name).toBe("Florin");
    expect(res.body.data.email).toBe("adrian@mail.com");
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
    test("'DELETE /api/users/x' should set the status of user with id = x to 'Inactive' and send a confirmation message", async () => {
      let res = await request(app)
        .delete(`/api/users/${user1.id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect("Content-Type", "application/json; charset=utf-8")
        .expect(200);
      expect(res.body.message).toBe("User status set to inactive.");

      res = await request(app)
        .get("/api/users?page=1&limit=10")
        .set("Authorization", `Bearer ${authToken}`)
        .expect("Content-Type", "application/json; charset=utf-8")
        .expect(200);
      expect(res.body.data.count).toBe(usersLengthBeforeTestSeed + 3);
      expect(res.body.data.users[usersLengthBeforeTestSeed].id).toBe(user1.id);
      expect(res.body.data.users[usersLengthBeforeTestSeed].active).toBe(false);
      expect(res.body.data.users[usersLengthBeforeTestSeed + 1].active).toBe(
        true
      );
      expect(res.body.data.users[usersLengthBeforeTestSeed + 2].active).toBe(
        true
      );
    });

    test("DELETE request with inexistent id should return an error message", async () => {
      const res = await request(app)
        .delete("/api/users/8")
        .set("Authorization", `Bearer ${authToken}`)
        .expect("Content-Type", "application/json; charset=utf-8")
        .expect(404);
      expect(res.body.message).toBe(
        "The user with the given id does not exist."
      );
    });
  });

  describe("DELETE tests for user and coresponding posts (and coresponding comments and replies)", () => {
    beforeAll(() => {
      addTestDBSeed();
    });
    afterAll(() => {
      removeTestDBSeed();
    });
    test("'DELETE /api/users/x?deletePosts=yes' should set the status of user with id = x to 'Inactive', delete its posts (and coresponding comments)", async () => {
      let res = await request(app)
        .delete(`/api/users/${user2.id}?deletePosts=yes`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect("Content-Type", "application/json; charset=utf-8")
        .expect(200);
      expect(res.body.message).toBe(
        "User status set to inactive and posts deleted."
      );

      res = await request(app)
        .get("/api/users?page=1&limit=10")
        .set("Authorization", `Bearer ${authToken}`)
        .expect("Content-Type", "application/json; charset=utf-8")
        .expect(200);
      expect(res.body.data.count).toBe(usersLengthBeforeTestSeed + 3);
      expect(res.body.data.users[usersLengthBeforeTestSeed - 1].name).toBe(
        "Maria"
      );
      expect(res.body.data.users[usersLengthBeforeTestSeed].name).toBe("Denis");
      expect(res.body.data.users[usersLengthBeforeTestSeed + 1].name).toBe(
        "Andrei"
      );
      expect(res.body.data.users[usersLengthBeforeTestSeed + 1].active).toBe(
        false
      );
      expect(res.body.data.users[usersLengthBeforeTestSeed + 2].name).toBe(
        "Adrian"
      );
      expect(res.body.data.users[usersLengthBeforeTestSeed + 2].active).toBe(
        true
      );

      res = await request(app)
        .get("/api/posts")
        .expect("Content-Type", "application/json; charset=utf-8")
        .expect(200);
      expect(res.body.data.posts.length).toBe(postsLengthBeforeTestSeed + 1);
      expect(res.body.data.posts[postsLengthBeforeTestSeed].id).toBe(post1.id);

      res = await request(app)
        .get(`/api/comments?filter=post&id=${post2.id}`)
        .expect("Content-Type", "application/json; charset=utf-8")
        .expect(200);
      expect(res.body.comments).toEqual([]);

      res = await request(app)
        .get(`/api/comments?filter=post&id=${post3.id}`)
        .expect("Content-Type", "application/json; charset=utf-8")
        .expect(200);
      expect(res.body.comments).toEqual([]);

      res = await request(app)
        .get(`/api/comments?filter=post&id=${post1.id}`)
        .expect("Content-Type", "application/json; charset=utf-8")
        .expect(200);
      expect(res.body.comments[0].id).toBe(comment1.id);
      expect(res.body.comments[0].postID).toBe(post1.id);
      expect(res.body.comments.length).toBe(1);
    });
  });

  describe("DELETE tests for user and coresponding comments(and replies)", () => {
    beforeAll(() => {
      addTestDBSeed();
    });
    afterAll(() => {
      removeTestDBSeed();
    });
    test("'DELETE /api/users/x?deleteComments=yes' should set the status of user with id = x to 'Inactive' and delete its comments(and coresponding replies)", async () => {
      let res = await request(app)
        .delete(`/api/users/${user2.id}?deleteComments=yes`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect("Content-Type", "application/json; charset=utf-8")
        .expect(200);
      expect(res.body.message).toBe(
        "User status set to inactive and comments deleted."
      );

      res = await request(app)
        .get(`/api/comments?filter=author&id=${user2.id}`)
        .expect("Content-Type", "application/json; charset=utf-8")
        .expect(200);
      expect(res.body.comments).toEqual([]);
    });
  });
});

describe("Image tests", () => {
  beforeAll(() => {
    addTestDBSeed();
  });
  afterAll(() => {
    removeTestDBSeed();
  });

  test("add Image to user image", async () => {
    const image = Buffer.from(
      fs.readFileSync("images/testUserImage.png")
    ).toString("base64");

    const imageRes = await request(app)
      .post("/api/images")
      .set("Authorization", `Bearer ${authToken}`)
      .set("Content-Type", "multipart/form-data")
      .attach("file", "images/testUserImage.png");

    const res = await request(app)
      .put(`/api/users/${user1.id}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        image: imageRes.body.data,
      })
      .expect("Content-Type", "application/json; charset=utf-8")
      .expect(200);

    expect(res.body.data.image).toBe(image);
    expect(res.body.message).toBe("User updated.");
  });

  test("remove Image from user", async () => {
    const res = await request(app)
      .put(`/api/users/${user2.id}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        image: "",
      })
      .expect("Content-Type", "application/json; charset=utf-8")
      .expect(200);

    expect(res.body.data.image).toBe("");
    expect(res.body.message).toBe("User updated.");
  });

  test("add user with image", async () => {
    const image = Buffer.from(
      fs.readFileSync("images/testUserImage.png")
    ).toString("base64");

    const imageRes = await request(app)
      .post("/api/images")
      .set("Authorization", `Bearer ${authToken}`)
      .set("Content-Type", "multipart/form-data")
      .attach("file", "images/testUserImage.png");

    const res = await request(app)
      .post("/api/users")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        name: "Sarah",
        email: "sarah@mail.com",
        password: "password",
        image: imageRes.body.data,
      })
      .expect("Content-Type", "application/json; charset=utf-8")
      .expect(201);
    expect(res.body.data.name).toBe("Sarah");
    expect(res.body.data.email).toBe("sarah@mail.com");
    expect(res.body.data.image).toBe(image);
    expect(res.body.message).toBe("User added.");
  });
});
