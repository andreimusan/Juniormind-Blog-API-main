/* eslint-disable no-unused-vars */
/* eslint-disable class-methods-use-this */
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Client, ServerError, Token } from "oauth2-server";
import { getRepository } from "typeorm";
import IToken from "./IToken";
import UserEntity from "../../models/entities/userEntity";
import CustomError from "../validators/customError";

require("dotenv").config();

export default class OAuthModelService {
  private jwtSecret: string;

  constructor() {
    if (!process.env.JWT_KEY) throw new CustomError(404, "No key found.");
    this.jwtSecret = process.env.JWT_KEY;
  }

  generateModel = () => ({
    getUser: this.getUser,
    getClient: this.getClient,
    generateAccessToken: this.generateAccessToken,
    saveToken: this.saveToken,
    getAccessToken: this.getAccessToken,
    verifyScope: this.verifyScope,
  });

  private getUser = async (email: string, password: string) => {
    let users: UserEntity[] = [];
    try {
      users = await getRepository(UserEntity).find({ email });
      if (users.length === 0)
        throw new CustomError(404, "Invalid credentials.");
      if (!users[0].active) throw new CustomError(404, "Inactive user.");
      const validPassword = await bcrypt.compare(password, users[0].password);
      if (!validPassword) throw new CustomError(404, "Invalid credentials.");
    } catch (e) {
      if (e instanceof CustomError)
        throw new ServerError(e.message, { code: 404 });
    }
    return users[0];
  };

  private getClient = async (clientId: string, clientSecret: string) => {
    const client = {
      clientId,
      clientSecret,
      grants: ["password"],
      redirectUris: [],
      id: "",
    };
    return client;
  };

  private generateAccessToken = async (
    _client: Client,
    user: UserEntity,
    _scope: string
  ) => {
    const payload: IToken = {
      username: user.name,
      email: user.email,
      userId: user.id,
      userImage: user.image,
      isAdmin: user.isAdmin,
      iat: Date.now() / 1000,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
    };
    const token = jwt.sign(payload, this.jwtSecret);
    return token;
  };

  private saveToken = async (
    token: Token,
    _client: Client,
    _user: UserEntity
  ) => {
    const decoded = jwt.verify(token.accessToken, this.jwtSecret) as IToken;
    const saveToken: Token = {
      accessToken: token.accessToken,
      scope: token.scope,
      accessTokenExpiresAt: new Date(decoded.exp * 1000),
      user: await this.getUserById(decoded.userId),
      client: {
        grants: ["password"],
        redirectUris: [],
        id: "",
      },
    };
    return saveToken;
  };

  private getAccessToken = async (accessToken: string) => {
    const decoded = jwt.verify(accessToken, this.jwtSecret) as IToken;
    const token: Token = {
      accessToken,
      accessTokenExpiresAt: new Date(decoded.exp * 1000),
      user: await this.getUserById(decoded.userId),
      client: {
        grants: ["password"],
        redirectUris: [],
        id: "",
      },
    };
    return token;
  };

  private verifyScope = async (_accessToken: Token, _scope: string) => true;

  private getUserById = async (id: number) => {
    let user;
    try {
      user = await getRepository(UserEntity).findOne({ id });
    } catch (e) {
      if (e instanceof CustomError) throw e;
    }
    if (!user)
      throw new ServerError("The user with the given id was not found.", {
        code: 404,
      });
    return user;
  };
}
