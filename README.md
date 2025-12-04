## SunTrace AI

Full-stack rooftop solar verification project.

### Project Structure

- **client**: React + Vite + TailwindCSS frontend
- **server**: Node.js + Express + MongoDB backend

---

### Backend (`server/`)

- **Tech**: Node.js, Express, MongoDB (Mongoose), Multer, CORS, dotenv
- **Entry file**: `server.js`

#### Setup

```bash
cd server
npm install
```

Create a `.env` file in `server/`:

```bash
MONGO_URI=<your-mongodb-connection-string>
PORT=5000
```

#### Run backend

```bash
cd server
npm start
```

The server will:

- Enable **CORS**
- Use **JSON body parsing**
- Load environment variables from `.env`
- Connect to MongoDB using `MONGO_URI`

---

### Frontend (`client/`)

- **Tech**: React, Vite, TailwindCSS

#### Setup

```bash
cd client
npm install
```

#### Run frontend

```bash
cd client
npm run dev
```

Then open the printed local URL in your browser (default: `http://localhost:5173`).

The UI includes:

- **Navbar title**: `SunTrace AI – Rooftop Solar Verification`
- **Placeholder text** in the main dashboard: `Dashboard loading…`

---

### Environment Variables

#### Required (backend)

- **MONGO_URI**: MongoDB connection string
- **PORT** (optional): Port for the Express server (defaults to `5000` if not set)

#### Frontend

- No required environment variables yet. Future API URLs can be configured using Vite-style `VITE_` prefixed variables in `.env` inside `client/`.


