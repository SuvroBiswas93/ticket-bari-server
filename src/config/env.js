import dotenv from 'dotenv';
dotenv.config();

export const env = {
    clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
    port: process.env.PORT || 3000,
};