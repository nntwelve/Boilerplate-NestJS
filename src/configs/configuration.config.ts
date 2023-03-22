export interface DatabaseConfig {
  host: string;
  port: number;
  uri: string;
}

export const database_config = () => ({
  database: {
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT, 10),
    uri: process.env.DATABASE_URI,
  },
});
