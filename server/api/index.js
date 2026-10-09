// Vercel Serverless Entry Point
// Vercel automatically picks up files in /api as serverless functions.
// We re-export the Express app from server.js so all routes work.
module.exports = require('../server');
