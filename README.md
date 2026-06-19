# Campus Event Management System

A modern, full-stack event management platform for universities, featuring role-based access control, QR-based attendance tracking, automatic certificate generation, and an AI-powered assistant.

## Tech Stack
- **Backend**: Python 3.9+, FastAPI, SQLAlchemy, SQLite (Development) / PostgreSQL (Production)
- **Frontend**: React 18, Vite, Context API, CSS Variables (Light/Dark Mode, Glassmorphism)
- **Features**: JWT Authentication, QR Code Generation (qrcode.react), PDF Certificates (ReportLab), AI Chatbot Integration.

## Project Structure
```
.
├── backend/            # FastAPI Backend
│   ├── app/            # Application logic (API, Models, Schemas, Core)
│   ├── main.py         # Entry point
│   ├── requirements.txt
│   └── venv/           # Python Virtual Environment
├── frontend/           # React + Vite Frontend
│   ├── src/            # Source code (Components, Pages, Services)
│   ├── index.html
│   └── package.json
└── README.md
```

## Setup & Installation

### Backend
1. Navigate to the backend directory: `cd backend`
2. Activate the virtual environment: `.\venv\Scripts\activate` (Windows) or `source venv/bin/activate` (Mac/Linux)
3. Install dependencies: `pip install -r requirements.txt`
4. Initialize the Database and Admin user: `python -m app.db.init_db`
5. Start the backend server: `uvicorn main:app --reload`
6. API Docs available at: `http://127.0.0.1:8000/api/v1/docs`

### Frontend
1. Navigate to the frontend directory: `cd frontend`
2. Install Node dependencies: `npm install`
3. Start the Vite development server: `npm run dev`
4. Application available at: `http://localhost:5173`

## Usage
- **Admin Account**: login with `admin@campus.edu` and password `admin123`.
- **Student Account**: Register a new account via the frontend portal.
- **Admin Capabilities**: Create events, scan QR codes to mark attendance.
- **Student Capabilities**: Browse events, register, view QR tickets, download certificates after attending, chat with AI assistant.
