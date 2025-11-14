interface EnvironmentConfig {
    NODE_ENV: string;
    PORT: number;
    DATABASE_URL: string;
    REDIS_URL: string;
    JWT_SECRET: string;
    JWT_EXPIRES_IN: string;
    FRONTEND_URL: string;
    AI_SERVICE_URL: string;
    RAZORPAY_KEY_ID?: string;
    RAZORPAY_KEY_SECRET?: string;
    AZURE_STORAGE_CONNECTION_STRING?: string;
}
export declare const config: EnvironmentConfig;
export {};
//# sourceMappingURL=env.d.ts.map