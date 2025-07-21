const isLocal = window.location.hostname === 'localhost';

export const BACKEND_URL = isLocal
  ? 'http://localhost:3000'
  : 'https://univote-gfvv.onrender.com';


