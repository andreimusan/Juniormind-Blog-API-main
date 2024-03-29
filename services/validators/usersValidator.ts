import Joi from "joi";
import User from "../../models/DTO/user";
import IUserValidatorService from "../interfaces/IUsersValidatorService";
import CustomError from "./customError";

export default class UsersValidator implements IUserValidatorService {
  // eslint-disable-next-line class-methods-use-this
  validateUser = (userRequest: User, id?: string) => {
    if (userRequest !== undefined) {
      const userObj = {
        name: userRequest.name,
        email: userRequest.email,
        password: userRequest.password,
      };
      if (id !== undefined) {
        UsersValidator.validateUpdateUserData(userObj);
        return true;
      }
      UsersValidator.validateNewUserData(userObj);
      return true;
    }

    return false;
  };

  private static validateNewUserData(user: object) {
    const schema = Joi.object({
      name: Joi.string().min(3).required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required(),
    });
    const validation = schema.validate(user);
    if (!validation.error) return;
    throw new CustomError(400, validation.error.details[0].message);
  }

  private static validateUpdateUserData(user: object) {
    const schema = Joi.object({
      name: Joi.string().min(3),
      email: Joi.string().email(),
      password: Joi.string().min(6),
    });
    const validation = schema.validate(user);
    if (!validation.error) return;
    throw new CustomError(400, validation.error.details[0].message);
  }
}
