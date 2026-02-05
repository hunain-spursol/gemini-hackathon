# MCP Forge

MCP Forge is a platform for building and managing Model Context Protocol (MCP) servers with ease. It features a modern React frontend and a robust Python backend powered by Google Gemini.

## Architecture

The project is split into two main directories:

- **`client/`**: React application built with Vite. Handles the UI, Dashboard, and Chat Interface.
- **`server/`**: Python application built with FastAPI. Handles API requests, Gemini integration, and documentation analysis.

## Prerequisites

- **Node.js** (v18+)
- **Python** (v3.10+)
- **Google Gemini API Key**

## Getting Started

### 1. Backend Setup

Navigate to the server directory and set up the Python environment.

```bash
cd server
```

Install the required dependencies:

```bash
pip install -r requirements.txt
```

Create a `.env` file in the `server/` directory and add your API key:

```env
API_KEY=your_gemini_api_key_here
```

Start the backend server:

```bash
# Using Python directly
python main.py

# OR using Uvicorn
uvicorn main:app --reload --port 8000
```

The server will start at `http://localhost:8000`.

### 2. Frontend Setup

Open a new terminal and navigate to the client directory.

```bash
cd client
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The application will be accessible at `http://localhost:3000` (or whichever port Vite selects).

## Features

- **Project Management**: Organize your MCP work into specific projects.
- **Integration Discovery**: Search and analyze documentation for potential integrations.
- **Gemini Powered**: Uses Google's Gemini models for intelligent analysis and chat.
- **Client-Server Separation**: Secure handling of API keys and logic on the backend.

## Troubleshooting

- **CORS Errors**: Ensure the backend allows calls from your frontend port (default configured for localhost:3000 and localhost:5173).
- **API Key**: Make sure the `API_KEY` is correctly set in `server/.env`.
- **Module Not Found**: Ensure you have activated your virtual environment (if using one) and installed `requirements.txt`.
