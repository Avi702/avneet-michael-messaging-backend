// TODO: update required environment variables after making the manager
export const REQUIRED_ENVIRONMENT_VARIABLES: string[] = [
    "JWT_ACCESS_SECRET",
    "JWT_REFRESH_SECRET",
    "JWT_ACCESS_TOKEN_LIFETIME", // format: XXm (minutes)
    "JWT_REFRESH_TOKEN_LIFETIME", // format: XXd (days)
];
