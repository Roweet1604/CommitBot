# CommitBot

CommitBot is a no-code chatbot builder for websites. Sign up, create a bot, give it a knowledge base (FAQs, policies, store hours and so on), style it, and drop one `<script>` tag on any website to get a working support chat widget.

Each bot answers in one of two modes:

- **Keyword mode** (free, no API key): replies with the best-matching sentence from the knowledge base, found with a small keyword matcher that handles stemming and synonyms.
- **AI mode** (you bring your own API key): sends the knowledge base as context to an LLM provider (Anthropic, OpenAI, Google Gemini, Groq or Mistral) and returns its answer. If the AI call fails, the bot falls back to keyword matching.

---

## Features

- Email/password accounts using JWT auth (tokens last 7 days, passwords are hashed with bcrypt)
- Several chatbots per account, each with its own name, greeting, colors, logo, avatar and display name
- A knowledge base for each bot. Entries are split into sentence chunks and keyword-indexed automatically
- Bring-your-own-key AI with a choice of provider and model. Keys are **encrypted at rest with AES-256-CBC**, and the dashboard only ever shows the last 4 characters
- An embeddable widget (`widget.js`) served by the backend, with open CORS so it works on any domain
- Embed snippets for plain HTML and for React
- Per-bot message counter (`totalMessages`)
- Abuse protection on the public chat endpoint: 30 requests per minute per IP and a 500-character message limit
- Light/dark theme in the dashboard

---

## Tech stack

| Layer    | Tech |
|----------|------|
| Frontend | React 19, Vite 8, React Router 7, Tailwind CSS 4, Axios, react-hot-toast, Vercel Analytics |
| Backend  | Node.js, Express 5, Mongoose 9 (MongoDB), jsonwebtoken, bcrypt, express-rate-limit, cors, dotenv |
| Widget   | Vanilla JS (no dependencies), injected into the host page |
| Hosting  | Frontend on Vercel (SPA rewrites in `vercel.json`), backend on Render |

---

## Project structure

```
CommitBot/
├── backend/                     # Express API + widget host
│   ├── package.json
│   └── src/
│       ├── index.js             # App entry: CORS, rate limit, routes
│       ├── config/db.js         # MongoDB connection
│       ├── middleware/
│       │   └── authMiddleware.js    # `protect` – JWT Bearer auth
│       ├── models/
│       │   ├── user.js
│       │   ├── chatbot.js       # Bot settings, appearance, encrypted API key
│       │   └── knowledge.js     # Knowledge entries + keyword chunks
│       ├── controllers/
│       │   ├── authController.js
│       │   ├── chatbotController.js
│       │   ├── knowledgeController.js
│       │   └── chatController.js    # Keyword + multi-provider AI replies
│       ├── routes/              # auth, chatbots, knowledge, chat
│       ├── utils/
│       │   └── textProcessor.js # Chunking, stemming, synonyms, scoring
│       └── widget/
│           ├── widget.js        # Embeddable chat widget
│           └── test.html        # Local widget test page
│
└── sitebot/frontend/            # React dashboard (Vite)
    ├── vercel.json
    └── src/
        ├── App.jsx              # Routes + PrivateRoute guard
        ├── api/axios.js         # Axios instance (base URL, token, 401 handling)
        ├── context/ThemeContext.jsx
        ├── components/          # Navbar, BotCard
        └── pages/
            ├── Landing.jsx
            ├── Login.jsx / Signup.jsx
            ├── Dashboard.jsx    # List / create / delete bots
            ├── BotBuilder.jsx   # Settings, appearance, response mode, API key
            ├── KnowledgeBase.jsx
            └── EmbedCode.jsx    # HTML & React embed snippets
```

---

## Getting started

### Prerequisites

- Node.js 18 or newer (the backend uses the built-in global `fetch`)
- A MongoDB database (local or MongoDB Atlas)

### 1. Backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>/<db>
JWT_SECRET=<a long random string>
ENCRYPTION_KEY=<64 hex characters = 32 bytes>
FRONTEND_URL=http://localhost:5173   # optional: extra allowed origin for dashboard CORS
```

To generate an `ENCRYPTION_KEY`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

> ⚠️ Keep `ENCRYPTION_KEY` the same once you've set it. If it changes, every saved API key becomes impossible to decrypt.

Start the server:

```bash
npm run dev     # with nodemon
# or
npm start
```

The API runs at `http://localhost:5000`. Open `GET /health` to check it's up.

### 2. Frontend

```bash
cd sitebot/frontend
npm install
npm run dev
```

The dashboard runs at `http://localhost:5173`.

> **Note:** the API base URL is currently hardcoded in `src/api/axios.js` to the deployed Render backend (`https://commitbot-ws0p.onrender.com/api`). To develop against a local backend, change it to `http://localhost:5000/api`, or switch it to `import.meta.env.VITE_API_URL`.

Other scripts: `npm run build`, `npm run preview`, `npm run lint`.

---

## Embedding the widget

The **Embed** page in the dashboard generates a snippet for each bot. For a plain HTML site:

```html
<script
  src="https://<your-backend>/widget/widget.js"
  data-bot-id="<BOT_ID>"
  data-api-url="https://<your-backend>">
</script>
```

For pages that load scripts dynamically, such as React or other SPAs, set these globals before you inject the script:

```js
window.__commitbot_id__  = '<BOT_ID>';
window.__commitbot_api__ = 'https://<your-backend>';
```

When the widget loads, it fetches `GET /api/chat/:botId/config` to get its appearance and greeting. After that, it sends each user message to `POST /api/chat/:botId`.

To test locally, open `backend/src/widget/test.html` with a static server on port 5500 (for example, VS Code Live Server). That origin is already allowed.

---

## API reference

All private routes need the header `Authorization: Bearer <token>`.

### Auth

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/signup` | `{ name, email, password }` | Create an account → `{ token, user }` |
| POST | `/api/auth/login`  | `{ email, password }` | Log in → `{ token, user }` |
| GET  | `/api/me` | – | Return the current user 🔒 |

### Chatbots 🔒

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| POST   | `/api/chatbots` | `{ name, greetingMessage?, responseMode?, appearance? }` | Create a bot |
| GET    | `/api/chatbots` | – | List your bots |
| GET    | `/api/chatbots/:id` | – | Get one bot |
| PUT    | `/api/chatbots/:id` | Any of the create fields | Update a bot |
| DELETE | `/api/chatbots/:id` | – | Delete a bot and its knowledge |
| POST   | `/api/chatbots/:id/apikey` | `{ apiKey, provider, model? }` | Save an encrypted API key |
| DELETE | `/api/chatbots/:id/apikey` | – | Remove the API key |

`provider` is one of `anthropic`, `openai`, `google`, `groq`, `mistral` or `other`. `other` uses the OpenAI-compatible call.

`appearance` fields: `backgroundColor`, `bubbleColor`, `fontColor`, `logoUrl`, `avatarUrl`, `botDisplayName`.

### Knowledge base 🔒

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| POST   | `/api/chatbots/:id/knowledge` | `{ title, content }` | Add an entry (chunked automatically) |
| GET    | `/api/chatbots/:id/knowledge` | – | List entries |
| PUT    | `/api/knowledge/:knowledgeId` | `{ title?, content? }` | Update an entry (re-chunked) |
| DELETE | `/api/knowledge/:knowledgeId` | – | Delete an entry |

### Public chat (open CORS, used by the widget)

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| GET  | `/api/chat/:botId/config` | – | Bot name, greeting and appearance |
| POST | `/api/chat/:botId` | `{ message }` (≤ 500 chars) | Send a message → `{ reply, botName, mode }`. Limited to 30 requests per minute |

### Misc

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API status message |
| GET | `/health` | `{ status: 'ok', timestamp }` |
| GET | `/widget/widget.js` | Embeddable widget script |

---

## How the answers are produced

**Keyword mode** (`utils/textProcessor.js`)

1. When a knowledge entry is saved, its text is split into sentences (each longer than 10 characters). The keywords of each sentence are stored with stop words removed.
2. When a message arrives, its keywords are stemmed and expanded with a built-in synonym map. For example, *shipping* also matches *delivery* and *courier*, and *hours* also matches *open* and *schedule*.
3. Every chunk gets a score: +3 for a match after stemming or synonym expansion, and +2 when the first 4 characters match. The chunk with the highest score is returned if it scores at least 2. Otherwise the bot sends a polite fallback message.

**AI mode** (`controllers/chatController.js`)

The bot's whole knowledge base goes into a system prompt that tells the model to answer **only** from that information. Replies are capped at 300 tokens. These default models are used when you don't pick one:

| Provider  | Default model |
|-----------|---------------|
| Anthropic | `claude-haiku-5-5` |
| OpenAI    | `gpt-3.5-turbo` |
| Google    | `gemini-2.5-flash` |
| Groq      | `openai/gpt-oss-20b` |
| Mistral   | `mistral-small-latest` |

---

## Security notes

- Dashboard routes use strict CORS: only `localhost` dev ports and `FRONTEND_URL` are allowed. The widget and public chat routes accept requests from any origin.
- Bot owners' API keys are encrypted with AES-256-CBC, using a random IV for each key, and are never sent back to the client.
- Never commit `.env`. It's already listed in `backend/.gitignore`.

---

## License

ISC
