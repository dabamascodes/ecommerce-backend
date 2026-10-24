export const EnvConfiguration = () => {
  const isProduction = process.env.STAGE === 'prod';

  return {
    app: {
      port: Number(process.env.PORT),
      hostApi: process.env.HOST_API,
      environment: process.env.NODE_ENV,
      isProduction,
      isDevelopment: !isProduction,
      jwtSecret: process.env.JWT_SECRET,
    },

    database: {
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      name: process.env.DB_NAME,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      synchronize: !isProduction,
      logging: !isProduction,
      ssl: isProduction,
    },
  };
};