import Joi from "joi";
import IDBConfigValidatorService from "../interfaces/IDatabaseConfigValidator";

export default class DBConfigValidatorService
  implements IDBConfigValidatorService
{
  // eslint-disable-next-line class-methods-use-this
  validate(credentials: JSON) {
    const schema = Joi.object({
      type: Joi.string()
        .min(1)
        .valid(
          "aurora-data-api",
          "aurora-data-api-pg",
          "better-sqlite3",
          "capacitor",
          "cockroachdb",
          "cordova",
          "expo",
          "mariadb",
          "mongodb",
          "mssql",
          "mysql",
          "nativescript",
          "oracle",
          "postgres",
          "react-native",
          "sap",
          "sqlite",
          "sqljs"
        ),
      host: Joi.string().min(1),
      port: Joi.number().min(1),
      username: Joi.string(),
      password: Joi.string(),
      database: Joi.string().min(1).required(),
      synchronize: Joi.boolean(),
      logging: Joi.boolean(),
      entities: Joi.array().items(Joi.string().min(1)),
    });

    const validation = schema.validate(credentials);
    if (validation.error) throw new Error(validation.error.details[0].message);
  }
}
