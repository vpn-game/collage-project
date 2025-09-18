import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Serve static frontend
const FRONTEND_DIR = path.resolve(__dirname, '../fornted');
app.use(express.static(FRONTEND_DIR));

// Health check API
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Users store with file persistence (simple demo)
const DATA_DIR = path.resolve(__dirname, './data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function loadUsersFromFile() {
  try {
    ensureDataDir();
    if (!fs.existsSync(USERS_FILE)) {
      fs.writeFileSync(USERS_FILE, JSON.stringify({ users: [] }, null, 2));
      return new Map();
    }
    const raw = fs.readFileSync(USERS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    const map = new Map();
    for (const u of parsed.users || []) {
      map.set(String(u.email).toLowerCase(), u);
    }
    return map;
  } catch (e) {
    console.error('Failed to load users.json:', e);
    return new Map();
  }
}

function saveUsersToFile(usersMap) {
  try {
    ensureDataDir();
    const usersArr = Array.from(usersMap.values());
    fs.writeFileSync(USERS_FILE, JSON.stringify({ users: usersArr }, null, 2));
  } catch (e) {
    console.error('Failed to save users.json:', e);
  }
}

const users = loadUsersFromFile(); // key: email, value: { name, email, password }

// Register
app.post('/api/register', (req, res) => {
  const { name, email, password } = req.body || {};
  console.log('POST /api/register body:', req.body);
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'name, email, password required' });
  }
  const normalizedEmail = String(email).toLowerCase();
  if (users.has(normalizedEmail)) {
    return res.status(409).json({ error: 'Email already registered' });
  }
  users.set(normalizedEmail, { name, email: normalizedEmail, password });
  saveUsersToFile(users);
  res.status(201).json({ message: 'Registered', user: { name, email: normalizedEmail } });
});

// Login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body || {};
  console.log('POST /api/login body:', req.body);
  if (!email || !password) {
    return res.status(400).json({ error: 'email, password required' });
  }
  const normalizedEmail = String(email).toLowerCase();
  const user = users.get(normalizedEmail);
  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  // For demo, return user (no tokens)
  res.json({ message: 'Logged in', user: { name: user.name, email: user.email } });
});

// Current user (mock)
app.get('/api/user', (req, res) => {
  const email = String(req.query.email || '').toLowerCase();
  if (!email) return res.status(400).json({ error: 'email query required' });
  const user = users.get(email);
  if (!user) return res.status(404).json({ error: 'Not found' });
  res.json({ user: { name: user.name, email: user.email } });
});

// Debug: list all users (do not use in production)
app.get('/api/_debug/users', (req, res) => {
  try {
    const list = Array.from(users.values()).map(u => ({ name: u.name, email: u.email }));
    res.json({ count: list.length, users: list });
  } catch (e) {
    res.status(500).json({ error: 'debug failed' });
  }
});

// Ensure API 404s return JSON, not HTML
app.use('/api', (req, res, next) => {
  res.status(404).json({ error: 'Not found' });
});

// Centralized error handler for APIs
app.use((err, req, res, next) => {
  console.error('API error:', err);
  if (req.path.startsWith('/api')) {
    res.status(500).json({ error: 'Server error' });
  } else {
    next(err);
  }
});

// Root -> serve index.html from frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(FRONTEND_DIR, 'index.html'));
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server at http://localhost:${PORT}`);
});