export const API_URL = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production'
    ? 'https://crm.mateluxy.com/api'
    : 'http://localhost:6001');
