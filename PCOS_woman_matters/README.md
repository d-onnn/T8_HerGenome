# PCOS Health Portal - Early Detection & Clinical Support

An AI-assisted women’s health platform for early PCOS and endometriosis risk screening, with separate patient and doctor experiences.

## 🎯 Project Overview

This repository contains a full-stack application with:
- a Node.js/Express backend that authenticates users, stores assessments in memory, and calls a Python prediction service
- a React/Vite frontend for patients and doctors
- machine learning model integration through `backend/models/prediction_service.py`

## 📁 Project Structure

```
PCOS_woman_matters/
├── backend/                     # Node.js/Express backend
│   ├── models/                  # Python prediction service and model files
│   ├── routes/                  # (empty placeholder route folder)
│   ├── server.js               # API server and prediction orchestration
│   └── package.json            # backend dependency manifest
├── frontend/                    # React/Vite frontend
│   ├── src/
│   │   ├── App.jsx             # router and app routes
│   │   ├── main.jsx            # React app entry point
│   │   ├── pages/              # UI pages for landing, login, patient and doctor dashboards
│   │   ├── services/api.js     # Axios API client
│   │   └── styles/             # frontend CSS styles
│   ├── package.json            # frontend dependency manifest
│   └── vite.config.js          # Vite configuration
├── package.json                # root scripts for install/run
└── README.md                   # project documentation
```

## 🚀 Quick Start

### Prerequisites
- Node.js 14+ and npm
- Python 3 installed and available as `python`

### Install dependencies

From the repository root:
```bash
npm run install-all
```

### Start the app

Run both backend and frontend together:
```bash
npm run dev
```

Or start them separately:
```bash
npm run backend
npm run frontend
```

Open `http://localhost:3000` in your browser.

## 🔐 Demo Credentials

### Patient
- Username: `patient1`
- Password: `password123`

### Doctor
- Username: `doctor1`
- Password: `password123`

## 🧠 App Workflow

1. Visit the landing page.
2. Click `Get Started` to go to the home screen.
3. Choose a role and log in as either a patient or a doctor.
4. Patients complete a screening form and view risk results.
5. Doctors review submitted assessments, compare diagnoses, and save feedback.

## 🧩 Core Features

### Patient Experience
- Multi-part screening form
- Symptom selection and medical history input
- Automatic BMI calculation
- AI-backed PCOS and endometriosis risk scores
- Result summary with overlap and recommendation metrics

### Doctor Experience
- Assessment list of submitted patient cases
- Detailed review of patient data
- PCOS vs endometriosis comparison endpoint
- Save clinical feedback and notes to assessment records
- Doctor-mode feature injection for scenario testing

## 🔧 Backend API Endpoints

- `POST /api/auth/login` — login with `username`, `password`, and `role`
- `GET /api/assessments` — get all patient assessments
- `GET /api/assessments/:id` — get assessment details by ID
- `POST /api/assessments` — create a new screening assessment
- `PUT /api/assessments/:id` — update assessment metadata and doctor feedback
- `POST /api/diagnosis/compare` — compare PCOS vs endometriosis model predictions

## 💻 Implementation Notes

- The backend runs on `http://localhost:3001` by default and calls the Python subprocess at `backend/models/prediction_service.py`.
- The frontend communicates with the backend via `frontend/src/services/api.js`.
- Assessment data is stored in memory for the running session only.
- If Python model prediction fails, the backend uses fallback symptom-based scoring.

## 📦 Package Scripts

- `npm run install-all` — install dependencies for root, backend, and frontend
- `npm run dev` — start both backend and frontend concurrently
- `npm run backend` — launch backend server only
- `npm run frontend` — launch frontend only

## ⚠️ Important

This project is a prototype/demo and is not intended for clinical or production use.
