/* eslint-disable global-require */
import request from "supertest";

describe("DB Setup tests", () => {
  let app: typeof import("../../app").default;

  beforeEach(async () => {
    import("../../app").then((module) => {
      app = module.default;
      // jest.resetModules();
    });
  });
  test("Other routes should not work when DB is not configured", async () => {
    let response = await request(app)
      .get("/api/users")
      .expect("Content-Type", "application/json; charset=utf-8")
      .expect(500);
    expect(response.body.message).toBe(
      "Database is not configured. Please use the setup route."
    );

    response = await request(app)
      .get("/api/posts")
      .expect("Content-Type", "application/json; charset=utf-8")
      .expect(500);
    expect(response.body.message).toBe(
      "Database is not configured. Please use the setup route."
    );

    response = await request(app)
      .get("/api/comments")
      .expect("Content-Type", "application/json; charset=utf-8")
      .expect(500);
    expect(response.body.message).toBe(
      "Database is not configured. Please use the setup route."
    );
  });

  test.each([
    {
      sentData: {
        type: "msql",
        host: "localhost",
        port: 3306,
        username: "root",
        password: "root",
        database: "juniorblogapi",
      },
      receivedData:
        '"type" must be one of [aurora-data-api, aurora-data-api-pg, better-sqlite3, capacitor, cockroachdb, cordova, expo, mariadb, mongodb, mssql, mysql, nativescript, oracle, postgres, react-native, sap, sqlite, sqljs]',
      status: 400,
    },
    {
      sentData: {
        type: "mysql",
        host: "",
        port: 3306,
        username: "root",
        password: "root",
        database: "juniorblogapi",
      },
      receivedData: '"host" is not allowed to be empty',
      status: 400,
    },
    {
      sentData: {
        type: "mysql",
        host: "localhost",
        password: "root",
        database: "juniorblogapi",
      },
      receivedData: '"username" is required',
      status: 400,
    },
    {
      sentData: {
        type: "mysql",
        host: "localhost",
        port: "3306",
        username: "root",
        password: "root",
        database: "juniorblogapi",
        synchronize: "fghfg",
      },
      receivedData: '"synchronize" must be a boolean',
      status: 400,
    },
  ])(
    "Setup route should return an error message when input config is not valid",
    async ({ sentData, receivedData, status }) => {
      const response = await request(app)
        .post("/api/setup")
        .send(sentData)
        .expect("Content-Type", "application/json; charset=utf-8")
        .expect(status);
      expect(response.body.message).toBe(receivedData);
    }
  );

  test("Setup route should generate new ormconfig file and return a success message", async () => {
    const response = await request(app)
      .post("/api/setup")
      .send({
        username: "root",
        password: "root",
        database: "juniorblogapi",
      })
      .expect("Content-Type", "application/json; charset=utf-8")
      .expect(200);
    expect(response.body.message).toBe("Database configured sucessfully!");
  });

  test("Setup route should return an error message when DB is already configured", async () => {
    await request(app).post("/api/setup").send({
      type: "mysql",
      host: "localhost",
      port: 3306,
      username: "root",
      password: "root",
      database: "juniorblogapi",
    });
    const response = await request(app)
      .post("/api/setup")
      .send({
        type: "mysql",
        host: "localhost",
        port: 3306,
        username: "root",
        password: "root",
        database: "juniorblogapi",
      })
      .expect("Content-Type", "application/json; charset=utf-8")
      .expect(500);
    expect(response.body.message).toBe("Database is already configured.");
  });
});
