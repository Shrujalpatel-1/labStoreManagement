const baseUrl = import.meta.env.PROD
  ? import.meta.env.VITE_API_URL // This is the live URL from Render
  : "http://localhost:8000/api"; // This is for local development

export default baseUrl;
