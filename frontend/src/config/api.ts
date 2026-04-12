/**
 * URL base de la API — se resuelve automáticamente según el entorno:
 *   npm start  → .env.development → localhost:8000
 *   npm build  → .env.production  → 147.93.176.210:8083
 */
export const API_URL = process.env.REACT_APP_API_URL as string;
