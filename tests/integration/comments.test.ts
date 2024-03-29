import supertest from "supertest";
import app from "../../app";
import { users, posts, comments } from "../../inmemDB";
import User from "../../models/DTO/user";
import Post from "../../models/DTO/post";
import Comment from "../../models/DTO/comment";

const localCommentsDB: Comment[] = [];

function popMultipleElements(n: number, array: Comment[]) {
  for (let i: number = 0; i < n; i += 1) {
    array.pop();
  }
}

const authToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFuZHJlaSIsImVtYWlsIjoiYW5kcmVpQG1haWwuY29tIiwidXNlcklkIjo0LCJpc0FkbWluIjp0cnVlLCJhY3RpdmUiOnRydWUsImlhdCI6MTY1MTE3MTMyMC43ODcsImV4cCI6NDgzMTE3MTMyMH0.suow4Tf2RNiVGLBXvlvZY_GuVaEM0pqhs1RpwuQFilE";

beforeAll(async () => {
  await supertest(app).post("/api/setup").send({
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: "root",
    password: "root",
    database: "juniorblogapi",
  });

  const user10 = new User(
    4,
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

  const comment10 = new Comment(
    10,
    10,
    "this is comment #10",
    4,
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
    4,
    10,
    new Date(),
    new Date()
  );
  const comment13 = new Comment(
    13,
    10,
    "this is comment #13",
    4,
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
  users.pop();
});

describe("GET tests", () => {
  beforeAll(() => {
    const comment14 = new Comment(
      14,
      10,
      "This is comment #14",
      4,
      undefined,
      new Date(),
      new Date()
    );
    const comment15 = new Comment(
      15,
      10,
      "This is comment #15",
      4,
      10,
      new Date(),
      new Date()
    );
    const comment16 = new Comment(
      16,
      10,
      "This is comment #16",
      4,
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
    popMultipleElements(4, comments);
    popMultipleElements(4, localCommentsDB);
  });
  test("get comment without id", async () => {
    const response = await supertest(app).get("/api/comments/f");
    expect(response.type).toBe("application/json");
    expect(response.status).toBe(404);
    expect(response.body.message).toEqual(
      "The comment with the given id does not exist."
    );
  });
  test("get comment with id === 10", async () => {
    const response = await supertest(app).get("/api/comments/10");
    expect(response.type).toBe("application/json");
    expect(response.status).toBe(200);
    expect(response.body.data.postID).toEqual(localCommentsDB[0].postID);
    expect(response.body.data.text).toEqual(localCommentsDB[0].text);
    expect(response.body.data.author).toEqual(localCommentsDB[0].author);
  });

  test("get comments message for wrong id === 100", async () => {
    const response = await supertest(app).get("/api/comments/100");
    const commentMessage = "The comment with the given id does not exist.";
    expect(response.type).toBe("application/json");
    expect(response.status).toBe(404);
    expect(response.body.message).toEqual(commentMessage);
  });

  test("get comments with postID === 10 - default page and limit", async () => {
    const response = await supertest(app).get(
      "/api/comments/?filter=post&id=10"
    );
    expect(response.type).toBe("application/json");
    expect(response.status).toBe(200);
    expect(response.body.comments.length).toBe(5);
    expect(response.body.comments[0].id).toEqual(localCommentsDB[7].id);
    expect(response.body.comments[1].id).toEqual(localCommentsDB[6].id);
    expect(response.body.comments[2].id).toEqual(localCommentsDB[5].id);
    expect(response.body.comments[3].id).toEqual(localCommentsDB[4].id);
    expect(response.body.comments[4].id).toEqual(localCommentsDB[3].id);
  });

  test("get comments with postID === 10 - random page and limit", async () => {
    const response = await supertest(app).get(
      "/api/comments/?filter=post&id=10&previousPageLastCommentIndex=13&limit=5"
    );
    expect(response.type).toBe("application/json");
    expect(response.status).toBe(200);
    expect(response.body.comments.length).toBe(2);
    expect(response.body.comments[0].id).toEqual(localCommentsDB[2].id);
    expect(response.body.comments[1].id).toEqual(localCommentsDB[0].id);
  });

  test("get comments with postID === 10 - page and limit when page excedess number of comments", async () => {
    const response = await supertest(app).get(
      "/api/comments/?filter=post&id=10&previousPageLastCommentIndex=29&limit=5"
    );
    expect(response.type).toBe("application/json");
    expect(response.status).toBe(200);
    expect(response.body.comments.length).toBe(0);
    expect(response.body.comments).toStrictEqual([]);
  });

  test("get comments message for wrong postID === 100 should be an empty array", async () => {
    const response = await supertest(app).get(
      "/api/comments/?filter=post&id=100"
    );
    expect(response.type).toBe("application/json");
    expect(response.status).toBe(200);
    expect(response.body.comments).toEqual([]);
  });

  test("get comments with author === 4", async () => {
    const response = await supertest(app).get(
      "/api/comments/?filter=author&id=4"
    );
    expect(response.type).toBe("application/json");
    expect(response.status).toBe(200);
    expect(response.body.comments.length).toEqual(5);
    expect(response.body.comments[0].postID).toEqual(localCommentsDB[6].postID);
    expect(response.body.comments[0].text).toEqual(localCommentsDB[6].text);
    expect(response.body.comments[0].author).toEqual(localCommentsDB[6].author);
    expect(response.body.comments[1].postID).toEqual(localCommentsDB[5].postID);
    expect(response.body.comments[1].text).toEqual(localCommentsDB[5].text);
    expect(response.body.comments[1].author).toEqual(localCommentsDB[5].author);
    expect(response.body.comments[2].postID).toEqual(localCommentsDB[4].postID);
    expect(response.body.comments[2].text).toEqual(localCommentsDB[4].text);
    expect(response.body.comments[2].author).toEqual(localCommentsDB[4].author);
  });

  test("get comments message for wrong author === 119 should be an empty array", async () => {
    const response = await supertest(app).get(
      "/api/comments/?filter=author&id=119"
    );
    expect(response.type).toBe("application/json");
    expect(response.status).toBe(200);
    expect(response.body.comments).toEqual([]);
  });

  test("get comments with parentID === 10", async () => {
    const response = await supertest(app).get(
      "/api/comments/?filter=parent&id=10"
    );
    expect(response.type).toBe("application/json");
    expect(response.status).toBe(200);
    expect(response.body.comments.length).toBe(3);
    expect(response.body.comments[0].postID).toEqual(localCommentsDB[5].postID);
    expect(response.body.comments[0].text).toEqual(localCommentsDB[5].text);
    expect(response.body.comments[0].author).toEqual(localCommentsDB[5].author);
    expect(response.body.comments[1].postID).toEqual(localCommentsDB[3].postID);
    expect(response.body.comments[1].text).toEqual(localCommentsDB[3].text);
    expect(response.body.comments[1].author).toEqual(localCommentsDB[3].author);
    expect(response.body.comments[2].postID).toEqual(localCommentsDB[2].postID);
    expect(response.body.comments[2].text).toEqual(localCommentsDB[2].text);
    expect(response.body.comments[2].author).toEqual(localCommentsDB[2].author);
  });

  test("get comments message for wrong parentID === 119 should be an empty array", async () => {
    const response = await supertest(app).get(
      "/api/comments/?filter=parent&id=119"
    );
    expect(response.type).toBe("application/json");
    expect(response.status).toBe(200);
    expect(response.body.comments).toEqual([]);
  });

  test("get comments message for wrong criteria", async () => {
    const response = await supertest(app).get(
      "/api/comments/?filter=auth&id=100"
    );
    const commentMessage = "Input parameters were incomplete or incorrect.";
    expect(response.type).toBe("application/json");
    expect(response.status).toBe(400);
    expect(response.body.message).toEqual(commentMessage);
  });

  test("get comments by search filter and undefined search text - default page and limit", async () => {
    const response = await supertest(app).get(
      `/api/comments/?filter=search&id=10`
    );
    expect(response.type).toBe("application/json");
    expect(response.status).toBe(400);
    expect(response.body.message).toEqual("Invalid query parameters.");
  });

  test("get comments by search filter and empty string as search text - default page and limit", async () => {
    const response = await supertest(app).get(
      `/api/comments/?filter=search&id=10&searchText=`
    );
    expect(response.type).toBe("application/json");
    expect(response.status).toBe(400);
    expect(response.body.message).toEqual("Invalid query parameters.");
  });

  test("get comments by search filter and inexistent search text - default page and limit", async () => {
    const response = await supertest(app).get(
      `/api/comments/?filter=search&id=10&searchText=fesor`
    );
    expect(response.type).toBe("application/json");
    expect(response.status).toBe(200);
    expect(response.body.comments).toEqual([]);
    expect(response.body.primaryCommentsCount).toEqual(0);
  });

  test("get comments by search filter - default page and limit", async () => {
    const response = await supertest(app).get(
      `/api/comments/?filter=search&id=10&searchText=i`
    );
    expect(response.type).toBe("application/json");
    expect(response.status).toBe(200);
    expect(response.body.primaryCommentsCount).toEqual(7);
    expect(response.body.comments.length).toEqual(5);
    expect(response.body.comments[0].id).toEqual(localCommentsDB[7].id);
    expect(response.body.comments[1].id).toEqual(localCommentsDB[6].id);
    expect(response.body.comments[2].id).toEqual(localCommentsDB[5].id);
    expect(response.body.comments[3].id).toEqual(localCommentsDB[4].id);
    expect(response.body.comments[4].id).toEqual(localCommentsDB[3].id);
  });

  test("get comments by search filter - random page and limit", async () => {
    const response = await supertest(app).get(
      `/api/comments/?filter=search&id=10&previousPageLastCommentIndex=13&limit=4&searchText=i`
    );
    expect(response.type).toBe("application/json");
    expect(response.status).toBe(200);
    expect(response.body.primaryCommentsCount).toEqual(7);
    expect(response.body.comments.length).toEqual(2);
    expect(response.body.comments[0].id).toEqual(localCommentsDB[2].id);
    expect(response.body.comments[1].id).toEqual(localCommentsDB[0].id);
  });

  test("get comments by search filter and author name as search text - random page and limit", async () => {
    const response = await supertest(app).get(
      `/api/comments/?filter=search&id=10&previousPageLastCommentIndex=-1&limit=1&searchText=Mihai`
    );
    expect(response.type).toBe("application/json");
    expect(response.status).toBe(200);
    expect(response.body.primaryCommentsCount).toEqual(1);
    expect(response.body.comments.length).toEqual(1);
    expect(response.body.comments[0].id).toEqual(localCommentsDB[7].id);
  });
});

describe("POST tests", () => {
  beforeAll(() => {
    const comment14 = new Comment(
      14,
      10,
      "This is comment #14",
      4,
      undefined,
      new Date(),
      new Date()
    );
    const comment15 = new Comment(
      15,
      10,
      "This is comment #15",
      4,
      10,
      new Date(),
      new Date()
    );
    const comment16 = new Comment(
      16,
      1,
      "This is comment #16",
      4,
      undefined,
      new Date(),
      new Date()
    );
    localCommentsDB.push(comment14, comment15, comment16);
  });

  afterAll(() => {
    popMultipleElements(3, comments);
    popMultipleElements(3, localCommentsDB);
  });

  test("post comment without parentID", async () => {
    const response = await supertest(app)
      .post("/api/comments/")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        postID: 10,
        text: "This is comment #14",
      });
    expect(response.type).toBe("application/json");
    expect(response.status).toBe(201);
    expect(response.body.data.postID).toEqual(localCommentsDB[4].postID);
    expect(response.body.data.text).toEqual(localCommentsDB[4].text);
    expect(response.body.data.author).toEqual(localCommentsDB[4].author);
  });

  test("post comment with parentID", async () => {
    const response = await supertest(app)
      .post("/api/comments/")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        postID: 10,
        text: "This is comment #15",
        parentID: 10,
      });
    expect(response.type).toBe("application/json");
    expect(response.status).toBe(201);
    expect(response.body.data.postID).toEqual(localCommentsDB[5].postID);
    expect(response.body.data.text).toEqual(localCommentsDB[5].text);
    expect(response.body.data.author).toEqual(localCommentsDB[5].author);
    expect(response.body.data.parentID).toEqual(localCommentsDB[5].parentID);
  });

  test("post comment with parentID and different postID", async () => {
    const response = await supertest(app)
      .post("/api/comments/")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        postID: 1,
        text: "This is comment #16",
        parentID: 10,
      });
    expect(response.type).toBe("application/json");
    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      "Parent comment is not part of the same post or it does not exist"
    );
  });

  test("post comment without text", async () => {
    const response = await supertest(app)
      .post("/api/comments/")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        postID: 3,
      });
    const commentMessage = "All required comment fields must have a value.";
    expect(response.type).toBe("application/json");
    expect(response.status).toBe(400);
    expect(response.body.message).toEqual(commentMessage);
  });

  test("post comment with invalid token", async () => {
    const response = await supertest(app)
      .post("/api/comments/")
      .set("Authorization", `Bearer 123`)
      .send({
        postID: 3,
        text: "This is comment #10",
      });
    const commentMessage = "Unauthorized";
    expect(response.type).toBe("application/json");
    expect(response.status).toBe(401);
    expect(response.body.message).toEqual(commentMessage);
  });

  test("post comment with wrong postID", async () => {
    const response = await supertest(app)
      .post("/api/comments/")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        postID: 345,
        text: "This is comment #10",
      });
    const commentMessage = "The post does not exist.";
    expect(response.type).toBe("application/json");
    expect(response.status).toBe(400);
    expect(response.body.message).toEqual(commentMessage);
  });
});

describe("PUT tests", () => {
  beforeAll(() => {
    const comment14 = new Comment(
      14,
      10,
      "This is comment #14",
      4,
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

  test("update comment", async () => {
    const response = await supertest(app)
      .put("/api/comments/14")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        text: "This is comment #14 updated",
      });
    const addedComment = localCommentsDB[localCommentsDB.length - 1];
    expect(response.type).toBe("application/json");
    expect(response.status).toBe(200);
    expect(response.body.data.postID).toEqual(addedComment.postID);
    expect(response.body.data.text).toEqual("This is comment #14 updated");
    expect(response.body.data.author).toEqual(addedComment.author);
  });

  test("update comment with incorrect id", async () => {
    const response = await supertest(app)
      .put("/api/comments/100")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        text: "This is comment #100 updated",
      });
    const commentMessage = "The comment with the given id does not exist.";
    expect(response.type).toBe("application/json");
    expect(response.status).toBe(404);
    expect(response.body.message).toEqual(commentMessage);
  });

  test("update comment without text", async () => {
    const response = await supertest(app)
      .put("/api/comments/10")
      .set("Authorization", `Bearer ${authToken}`)
      .send({});
    const commentMessage = "Please enter the updated text.";
    expect(response.type).toBe("application/json");
    expect(response.status).toBe(400);
    expect(response.body.message).toEqual(commentMessage);
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

  test("delete comment", async () => {
    const response = await supertest(app)
      .delete("/api/comments/14")
      .set("Authorization", `Bearer ${authToken}`);
    const commentMessage = "The comment and its replies were deleted.";
    expect(response.type).toBe("application/json");
    expect(response.status).toBe(200);
    expect(response.body.message).toEqual(commentMessage);
  });

  test("delete comment with replies", async () => {
    const response = await supertest(app)
      .delete("/api/comments/15")
      .set("Authorization", `Bearer ${authToken}`);
    const commentMessage = "The comment and its replies were deleted.";
    expect(response.type).toBe("application/json");
    expect(response.status).toBe(200);
    expect(response.body.message).toEqual(commentMessage);
  });

  test("delete comment message response due to wrong ID", async () => {
    const response = await supertest(app)
      .delete("/api/comments/200")
      .set("Authorization", `Bearer ${authToken}`);
    const commentMessage = "The comment with the given id does not exist.";
    expect(response.type).toBe("application/json");
    expect(response.status).toBe(404);
    expect(response.body.message).toEqual(commentMessage);
  });

  test("delete comments with specific author", async () => {
    let response = await supertest(app)
      .delete("/api/comments/?filter=author&id=11")
      .set("Authorization", `Bearer ${authToken}`);
    let commentMessage = "The comments and their replies were deleted.";
    expect(response.type).toBe("application/json");
    expect(response.status).toBe(200);
    expect(response.body.message).toEqual(commentMessage);

    response = await supertest(app).get("/api/comments/17");
    commentMessage = "The comment with the given id does not exist.";
    expect(response.type).toBe("application/json");
    expect(response.status).toBe(404);
    expect(response.body.message).toEqual(commentMessage);
  });

  test("delete comments with specific author and replies", async () => {
    let response = await supertest(app)
      .delete("/api/comments/?filter=author&id=10")
      .set("Authorization", `Bearer ${authToken}`);
    let commentMessage = "The comments and their replies were deleted.";
    expect(response.type).toBe("application/json");
    expect(response.status).toBe(200);
    expect(response.body.message).toEqual(commentMessage);

    response = await supertest(app).get("/api/comments/18");
    commentMessage = "The comment with the given id does not exist.";
    expect(response.type).toBe("application/json");
    expect(response.status).toBe(404);
    expect(response.body.message).toEqual(commentMessage);

    response = await supertest(app).get("/api/comments/?filter=parent&id=18");
    expect(response.type).toBe("application/json");
    expect(response.status).toBe(200);
    expect(response.body.comments).toEqual([]);
  });

  test("delete comments with specific post", async () => {
    let response = await supertest(app)
      .delete("/api/comments/?filter=post&id=12")
      .set("Authorization", `Bearer ${authToken}`);
    const commentMessage = "The comments and their replies were deleted.";
    expect(response.type).toBe("application/json");
    expect(response.status).toBe(200);
    expect(response.body.message).toEqual(commentMessage);

    response = await supertest(app).get("/api/comments/?filter=post&id=12");
    expect(response.type).toBe("application/json");
    expect(response.status).toBe(200);
    expect(response.body.comments).toEqual([]);
  });
});
