/* eslint-disable class-methods-use-this */
import fs from "fs";
import { createConnection } from "typeorm";
import IDBService from "../interfaces/IDBService";
import DBConfig from "../../models/DTO/dbConfig";
import IUsersService from "../interfaces/IUsersService";
import ServiceInjector from "../serviceInjector";
import User from "../../models/DTO/user";
import IPostsService from "../interfaces/IPostsService";
import Post from "../../models/DTO/post";

export default class DBService implements IDBService {
  private usersService: IUsersService;

  private postsService: IPostsService;

  constructor(
    usersService: IUsersService = ServiceInjector.getService("IUsersService"),
    postsService: IPostsService = ServiceInjector.getService("IPostsService")
  ) {
    this.usersService = usersService;
    this.postsService = postsService;
    if (this.checkDBConfig()) createConnection();
  }

  public saveDBConfig(dbConfig: DBConfig) {
    const configContent = {
      type: dbConfig.type === undefined ? "mysql" : dbConfig.type,
      host: dbConfig.host === undefined ? "localhost" : dbConfig.host,
      port: dbConfig.port === undefined ? 3306 : dbConfig.port,
      username: dbConfig.username,
      password: dbConfig.password,
      database: dbConfig.database,
      synchronize:
        dbConfig.synchronize === undefined ? true : dbConfig.synchronize,
      logging: dbConfig.logging === undefined ? false : dbConfig.logging,
      entities:
        dbConfig.entities === undefined
          ? ["models/entities/*.ts"]
          : dbConfig.entities,
    };

    fs.appendFileSync("ormconfig.json", JSON.stringify(configContent));
  }

  public checkDBConfig() {
    try {
      fs.accessSync("ormconfig.json", fs.constants.F_OK);
      return true;
    } catch {
      return false;
    }
  }

  public async connectToDB(): Promise<void> {
    await createConnection();
  }

  public async seedDB(): Promise<void> {
    await this.usersService.add(
      new User(
        1,
        "admin",
        "admin@localhost.com",
        "123456",
        true,
        new Date(),
        new Date(),
        true
      )
    );
    await this.postsService.add(
      new Post(
        1,
        "Lorem ipsum",
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Amet nisl purus in mollis nunc. Pretium fusce id velit ut tortor pretium. Ac felis donec et odio pellentesque diam volutpat commodo. Massa tincidunt nunc pulvinar sapien. Eros in cursus turpis massa tincidunt dui ut. Risus commodo viverra maecenas accumsan lacus. Nisl nunc mi ipsum faucibus vitae aliquet nec ullamcorper sit. Facilisi nullam vehicula ipsum a arcu cursus vitae congue mauris. Diam ut venenatis tellus in metus vulputate eu scelerisque felis. Nisi porta lorem mollis aliquam ut porttitor leo a diam. In vitae turpis massa sed. Auctor eu augue ut lectus. Tellus in metus vulputate eu scelerisque felis imperdiet. Mauris in aliquam sem fringilla ut morbi. Sem nulla pharetra diam sit. Vitae tortor condimentum lacinia quis vel eros. Tincidunt ornare massa eget egestas purus viverra accumsan. Viverra orci sagittis eu volutpat odio facilisis mauris. Orci phasellus egestas tellus rutrum tellus pellentesque eu tincidunt. Dolor sit amet consectetur adipiscing elit pellentesque habitant morbi tristique. Viverra vitae congue eu consequat ac felis. Risus pretium quam vulputate dignissim suspendisse in est ante. Enim tortor at auctor urna nunc. Nibh sed pulvinar proin gravida hendrerit. Rhoncus est pellentesque elit ullamcorper dignissim cras tincidunt lobortis feugiat. Ut sem viverra aliquet eget sit. Sollicitudin aliquam ultrices sagittis orci a scelerisque.",
        1,
        new Date(),
        new Date(),
        "defaultPostImage.png"
      )
    );
  }
}
