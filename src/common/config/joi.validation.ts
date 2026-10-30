import * as Joi from 'joi';

export const JoiValidationSchema = Joi.object({
  STAGE: Joi.string()
    .valid('dev', 'prod', 'test')
    .default('dev'),

  DB_HOST: Joi.string()
    .hostname()
    .required(),

  DB_PORT: Joi.number()
    .port()
    .default(5432),

  DB_NAME: Joi.string()
    .min(1)
    .required(),

  DB_USERNAME: Joi.string()
    .min(1)
    .required(),

  DB_PASSWORD: Joi.string()
    .min(8)
    .pattern(/[A-Z]/, 'uppercase letter')
    .pattern(/[a-z]/, 'lowercase letter')
    .pattern(/[0-9]/, 'number')
    .required(),

  PORT: Joi.number()
    .port()
    .default(3000),

  HOST_API: Joi.string()
    .uri({ scheme: ['http', 'https'] })
    .default((context) => {
      const port = context.PORT || 3000;
      return `http://localhost:${port}`;
    }),

  JWT_SECRET: Joi.string()
    .min(8)
    .pattern(/[a-z]/, 'lowercase letter')
    .pattern(/[0-9]/, 'number')
    .required(),

  PAYMENT_PROVIDER: Joi.string()
    .valid('stripe', 'mock')
    .default('stripe'),

  STRIPE_SECRET_KEY: Joi.string()
    .when('PAYMENT_PROVIDER', {
      is: 'stripe',
      then: Joi.required(),
      otherwise: Joi.optional().allow(''),
    }),

  STRIPE_WEBHOOK_SECRET: Joi.string()
    .when('PAYMENT_PROVIDER', {
      is: 'stripe',
      then: Joi.required(),
      otherwise: Joi.optional().allow(''),
    }),

  ALLOWED_ORIGIN: Joi.string()
    .uri({ scheme: ['http', 'https'] })
    .default('http://localhost:5173'),
});