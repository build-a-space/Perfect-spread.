'use strict';

// Vercel serverless entry point: every non-static request is handled by the
// Express app (static files in /public are served directly by Vercel's CDN).
module.exports = require('../server');
