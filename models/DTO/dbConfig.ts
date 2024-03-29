export default class DBConfig {
  type?: string;

  host?: string;

  port?: number;

  username: string;

  password: string;

  database: string;

  synchronize?: boolean;

  logging?: boolean;

  entities?: string[];

  constructor(
    username: string,
    password: string,
    database: string,
    type: string = "mysql",
    host: string = "localhost",
    port: number = 3306,
    synchronize: boolean = true,
    logging: boolean = false,
    entities: string[] = ["models/entities/*.ts"]
  ) {
    this.type = type;
    this.host = host;
    this.port = port;
    this.username = username;
    this.password = password;
    this.database = database;
    this.synchronize = synchronize;
    this.logging = logging;
    this.entities = entities;
  }
}
