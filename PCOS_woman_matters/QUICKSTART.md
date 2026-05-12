# PCOS Health Portal - Quick Start Guide

## Installation (One-Time Setup)

```bash
cd PCOS_woman_matters
npm run install-all
```

## Running the Application

```bash
npm run dev
```

Then open http://localhost:3000 in your browser.

## Demo Login Credentials

**Patient:**
- Username: `patient1`
- Password: `password123`

**Doctor:**
- Username: `doctor1`
- Password: `password123`

## Project Structure

- **Backend:** `npm run backend` (runs on port 3001)
- **Frontend:** `npm run frontend` (runs on port 3000)
- **Both together:** `npm run dev`

## Key Files

### Backend
- `backend/server.js` - All API endpoints and business logic
- `backend/.env` - Environment variables

### Frontend
- `frontend/src/App.jsx` - Main application and routing
- `frontend/src/pages/` - All page components
- `frontend/src/services/api.js` - API calls
- `frontend/src/styles/global.css` - All styling

## Available Features

### Patient Dashboard
1. **Health Screening** - Complete symptom assessment
2. **My Results** - View risk score and recommendations
3. **Health Information** - Learn about PCOS and Endometriosis

### Doctor Dashboard
1. **Patient List** - View all assessments with risk scores
2. **Clinical Analysis** - Detailed patient information and diagnosis comparison
3. **Clinical Guidelines** - Management and referral recommendations

## Next Steps

1. Test with demo accounts
2. Try submitting an assessment as a patient
3. View the assessment as a doctor
4. Review the diagnosis comparison and clinical analysis
5. Check out the comprehensive README.md for more details

## Troubleshooting

If ports are in use or you encounter issues, see README.md for detailed troubleshooting steps.
