export const API_URL = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production'
    ? 'https://mateluxy-backend-5p27.onrender.com'
    : 'http://localhost:3001');
