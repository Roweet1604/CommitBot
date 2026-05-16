const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');
const knowledgeRoutes = require('./routes/knowledgeRoutes');
const { protect } = require('./middleware/authMiddleware');

dotenv.config();
connectDB();

const app = express();

// ─── CORS ────────────────────────────────────────────────────────────────────

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'http://localhost:3000',
  process.env.FRONTEND_URL,
].filter(Boolean);

const strictCors = cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
});

// Open CORS for public widget/chat routes — embeddable on ANY website
const openCors = cors({ origin: '*' });

// ─────────────────────────────────────────────────────────────────────────────

app.use(express.json());

// Rate limit for chat endpoint only
const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { message: 'Too many messages, please slow down.' }
});

// ── Widget static files (open) ───────────────────────────────────────────────
app.use('/widget', openCors, express.static('src/widget'));

// ── Public chat routes (open) — MUST come before /api strictCors block ───────
app.options('/api/chat/:botId', openCors);          // preflight for POST
app.options('/api/chat/:botId/config', openCors);   // preflight for GET
app.use('/api/chat', openCors);
require('./routes/chatRoutes')(app, chatLimiter);

// ── Private routes (strict) ──────────────────────────────────────────────────
app.use('/api/auth', strictCors, authRoutes);
app.use('/api/chatbots', strictCors, chatbotRoutes);
app.use('/api', strictCors, knowledgeRoutes);       // /api but NOT /api/chat (already handled above)

app.get('/api/me', strictCors, protect, (req, res) => {
  res.json({ message: 'You are logged in!', user: req.user });
});

// ── Health / root ─────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: 'CommitBot API is running!' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});