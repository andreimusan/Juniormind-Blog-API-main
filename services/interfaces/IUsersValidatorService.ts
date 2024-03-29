/* eslint-disable no-unused-vars */
import User from "../../models/DTO/user";

export default interface IUserValidatorService {
  validateUser(userRequest: User, id?: string): boolean;
}
