# OliveTrace

A full-stack app powered by **Ollama + Phi3** — run it locally or with Docker.

---

## Prerequisites

### For Local Setup
- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/try/download/community) running locally
- [Ollama](https://ollama.com/download)

### For Docker Setup
- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- [Ollama](https://ollama.com/download)

---

## Step 1 — Install Ollama

### Windows
Download and run the installer from → https://ollama.com/download/windows

### Mac
```bash
brew install ollama
```
Or download from → https://ollama.com/download/mac

### Linux
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

Verify installation:
```bash
ollama --version
```

---

## Step 2 — Pull and Run Phi3

```bash
ollama run phi3
```

This downloads Phi3 the first time (may take a few minutes).

Verify it's available:
```bash
ollama list
```

Keep Ollama running in this terminal.

---

## Step 3 — Clone the Repository

Open a new terminal:

```bash
git clone 
cd <your-repo-folder>
```

---

## Option A — Run Locally (No Docker)

### 1. Set up the Backend

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` folder:

```env
MONGO_URI=mongodb://localhost:27017/olivetrace
OLLAMA_URL=http://localhost:11434
MODEL=phi3
PORT=5000
```

Start the backend:

```bash
npm run dev
```

Backend runs at → `http://localhost:5000`

---

### 2. Set up the Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at → `http://localhost:5173`

---

### You Need 3 Terminals

| Terminal | Command | What it does |
|----------|---------|--------------|
| 1 | `ollama run phi3` | Runs the AI model |
| 2 | `cd backend && npm run dev` | Starts the API server |
| 3 | `cd frontend && npm run dev` | Starts the UI |

---

## Option B — Run with Docker

### 1. Create the .env file

In the root of the project create a `.env` file:

```env
MONGO_URI=mongodb://mongo:27017/olivetrace
OLLAMA_URL=http://host.docker.internal:11434
MODEL=phi3
PORT=5000
```

> **Linux users only** — `host.docker.internal` doesn't work on Linux by default.
> Add this under the `backend` service in `docker-compose.yml`:
> ```yaml
> extra_hosts:
>   - "host.docker.internal:host-gateway"
> ```

### 2. Start Everything

```bash
docker-compose up --build
```

Docker will start MongoDB, Backend, and Frontend automatically.

### You Need 2 Terminals

| Terminal | Command | What it does |
|----------|---------|--------------|
| 1 | `ollama run phi3` | Runs the AI model on your machine |
| 2 | `docker-compose up --build` | Starts MongoDB + Backend + Frontend |

---

## Open the App

Once everything is running open your browser at:

```
http://localhost:5173
```

---

## Environment Variables

| Variable | Description | Local Value | Docker Value |
|----------|-------------|-------------|--------------|
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/olivetrace` | `mongodb://mongo:27017/olivetrace` |
| `OLLAMA_URL` | Ollama API URL | `http://localhost:11434` | `http://host.docker.internal:11434` |
| `MODEL` | Ollama model to use | `phi3` | `phi3` |
| `PORT` | Backend port | `5000` | `5000` |

---

## Stopping the App

### Local
Just press `Ctrl+C` in each terminal.

### Docker
```bash
# Stop all containers
docker-compose down

# Stop and remove all data (MongoDB volume)
docker-compose down -v
```

---

## Troubleshooting

**Ollama not reachable from Docker?**
Make sure Ollama is running in a separate terminal before starting Docker.
On Linux add `extra_hosts` as mentioned above.

**Port already in use?**
```bash
docker-compose down
docker-compose up --build
```

**MongoDB connection failed?**
Wait a few seconds after starting — MongoDB takes a moment to be ready.

**Model not found?**
```bash
ollama list        # check phi3 is downloaded
ollama run phi3    # re-run if missing
```
