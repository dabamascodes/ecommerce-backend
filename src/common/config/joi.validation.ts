import * as Joi from 'joi';

export const JoiValidationSchema = Joi.object({
  STAGE: Joi.string().valid('dev', 'prod', 'test').default('dev'),
  DB_PASSWORD: Joi.required(),
  DB_NAME: Joi.required(),
  DB_HOST: Joi.string().default('localhost'),
  DB_PORT: Joi.number().default(5432),
  DB_USERNAME: Joi.required(),
  PORT: Joi.number().default(3000),
});