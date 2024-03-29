/* eslint-disable no-unused-vars */
import OAuthServer from "express-oauth-server";

export default interface IOAuthService {
  getOAuthServer(): OAuthServer;
}
