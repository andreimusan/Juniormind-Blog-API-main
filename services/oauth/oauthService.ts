/* eslint-disable class-methods-use-this */
import OAuthServer from "express-oauth-server";
import IOAuthService from "./IOAuthService";
import OAuthModel from "./oauthModelService";

export default class OAuthService implements IOAuthService {
  private server: OAuthServer;

  constructor() {
    this.server = this.createOAuthServer();
  }

  private createOAuthServer = () =>
    new OAuthServer({
      model: new OAuthModel().generateModel(),
      requireClientAuthentication: { password: false },
      continueMiddleware: true,
    });

  getOAuthServer = () => this.server;
}
