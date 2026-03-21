// const express = require('express');
// const cors = require('cors');


// const app = express();
// app.use(cors({origin:"http://localhost:5173",
//     credentials:true
// }))
// app.use(express.json())
// const dotenv =require('dotenv');


// const resumeRouter = require('./routes/resume.routes');
// app.use("api/resume",resumeRouter)


// module.exports   = app
// src/app.js     (recommended location if using src/ folder)

require('dotenv').config();   // ← MUST be at the VERY TOP

const express = require('express');
const cors = require('cors');

const resumeRouter = require('./routes/resume.routes');   // adjust path if needed

const app = express();

// ──────────────── Middleware ────────────────
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));        // good to have limit for resume images
app.use(express.urlencoded({ extended: true }));

// ──────────────── Routes ────────────────
app.use('/api/resumes', resumeRouter);           // ← fixed: added / + plural (convention)

// Optional but very useful during development
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

module.exports = app;