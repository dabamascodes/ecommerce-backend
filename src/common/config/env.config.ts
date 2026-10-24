export const EnvConfiguration = () => ({
    environment: process.env.STAGE || 'dev',
    dbPassword: process.env.DB_PASSWORD,
    dbName: process.env.DB_NAME,
    dbHost: process.env.DB_HOST,
    dbPort: parseInt(process.env.DB_PORT || '5432', 10),
    dbUsername: process.env.DB_USERNAME,
    port: parseInt(process.env.PORT || '3000', 10),
});