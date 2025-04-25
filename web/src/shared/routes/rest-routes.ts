const ENDPOINTS =  {
    'login': 'google/login',
    'logout': 'logout',
} as const;

export const ROOT_ENDPOINT = process.env.NEXT_PUBLIC_API_URL || "https://localhost:8080"

export function routeTo(endpoint: keyof typeof ENDPOINTS) {
    return `${ROOT_ENDPOINT}/${ENDPOINTS[endpoint]}`
}