# PCOS Health Portal - Early Detection & Clinical Support

An AI-powered healthcare platform designed to help with early detection of Polycystic Ovary Syndrome (PCOS) and reduce the risk of misdiagnosis with Endometriosis.

## 🎯 Project Overview

### For Patients
- Complete a comprehensive symptom-based health screening
- Receive a personalized risk score indicating likelihood of PCOS or Endometriosis
- Access health information and medical recommendations
- Encourage early detection and medical consultation if high-risk

### For Healthcare Professionals
- Access patient assessments and health screening data
- Use clinical decision support tools to analyze patient symptoms
- Compare probability of PCOS vs Endometriosis diagnosis
- Review clinical guidelines for management and referral criteria
- Make faster and more accurate diagnoses

## 📁 Project Structure

```
PCOS_woman_matters/
├── backend/                      # Node.js/Express API
│   ├── server.js                # Main server with all API endpoints
│   ├── routes/
│   │   └── assessment.js         # Assessment route module
│   ├── package.json              # Backend dependencies
│   └── .env                      # Environment variables
├── frontend/                     # React/Vite application
│   ├── index.html                # Entry point
│   ├── vite.config.js            # Vite configuration
│   ├── src/
│   │   ├── main.jsx              # React entry point
│   │   ├── App.jsx               # Main App component with routing
│   │   ├── pages/
│   │   │   ├── home.jsx          # Home page with role selection
│   │   │   ├── login.jsx         # Login page
│   │   │   ├── patientDashboard.jsx  # Patient screening & results
│   │   │   └── doctorDashboard.jsx   # Doctor patient overview
│   │   ├── services/
│   │   │   └── api.js            # API service with Axios
│   │   ├── components/           # Reusable components
│   │   ├── assets/               # Images and static files
│   │   └── styles/
│   │       └── global.css        # Global styling
│   └── package.json              # Frontend dependencies
└── package.json                  # Root package for scripts
```

## 🚀 Quick Start

### Prerequisites
- Node.js 14+ and npm installed
- Git (optional)

### Installation

1. **Install all dependencies:**
   ```bash
   cd PCOS_woman_matters
   npm run install-all
   ```

   This installs dependencies for:
   - Root project
   - Backend (`/backend`)
   - Frontend (`/frontend`)

### Running the Application

**Option 1: Run both backend and frontend concurrently**
```bash
npm run dev
```

**Option 2: Run backend and frontend separately**

Backend only (runs on http://localhost:3001):
```bash
npm run backend
```

Frontend only (runs on http://localhost:3000):
```bash
npm run frontend
```

After starting the servers, open http://localhost:3000 in your browser.

## 🔐 Demo Credentials

### Patient Account
- **Username:** `patient1`
- **Password:** `password123`

### Doctor Account
- **Username:** `doctor1`
- **Password:** `password123`

## 📊 User Flow

```
User visits site
    ↓
Home page (choose role: Patient or Doctor)
    ↓
Login with credentials
    ↓
Patient Dashboard              Doctor Dashboard
├── Start Screening            ├── View all patient assessments
├── View Results               ├── Analyze specific patient
├── Health Information         ├── Compare PCOS vs Endometriosis
    ↓                              ↓
    Assessment submitted       Diagnosis comparison analyzed
    ↓                              ↓
    Risk score calculated      Clinical recommendations provided
```

## 🎨 Features

### Patient Features
- **Health Screening Tool:** Interactive form to select symptoms
  - Irregular periods
  - Excessive hair growth
  - Acne
  - Weight gain
  - Infertility
  - Pelvic pain
  - Fatigue
  - Mood changes

- **Risk Assessment:** AI-powered risk scoring based on symptoms
- **Medical History:** Optional field for additional context
- **Results Display:** Clear risk level (Low/Moderate/High) with recommendations
- **Health Education:** Information about PCOS and Endometriosis

### Doctor Features
- **Patient Assessment List:** Grid view of all patient assessments
  - Patient name and age
  - Risk score with color coding
  - Assessment date
  - Quick action button

- **Clinical Analysis:** Detailed patient information and symptom review
- **Diagnosis Comparison:**
  - PCOS probability percentage
  - Endometriosis probability percentage
  - Key characteristics for each condition
  - Clinical recommendation

- **Clinical Guidelines:** Evidence-based management and referral criteria

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/login` - User login

### Assessments
- `GET /api/assessments` - Get all assessments
- `GET /api/assessments/:id` - Get specific assessment
- `POST /api/assessments` - Create new assessment
- `PUT /api/assessments/:id` - Update assessment

### Diagnosis
- `POST /api/diagnosis/compare` - Compare PCOS vs Endometriosis probability

## 📡 Risk Score Calculation

The risk score is calculated using weighted symptom analysis:

| Symptom | Weight |
|---------|--------|
| Infertility | 30% |
| Irregular Periods | 25% |
| Weight Gain | 20% |
| Excessive Hair Growth | 20% |
| Acne | 15% |
| Pelvic Pain | 15% |
| Mood Changes | 12% |
| Fatigue | 10% |

**Risk Levels:**
- **0-40%:** Low Risk - Continue monitoring
- **40-60%:** Moderate Risk - Schedule consultation
- **60-100%:** High Risk - Immediate medical consultation recommended

## 🎨 Styling

The application uses a modern, responsive design with:
- **Color Scheme:** 
  - Primary: Purple (#6200ea)
  - Secondary: Teal (#03dac6)
  - Danger: Red (#d32f2f)
  - Warning: Orange (#f57c00)
  - Success: Green (#388e3c)

- **Responsive Design:** Mobile-friendly layout that adapts to all screen sizes
- **Animations:** Smooth transitions and page load animations
- **Accessibility:** Semantic HTML and proper contrast ratios

## 🔒 Security Considerations

**Current Implementation (Demo):**
- Simple credential matching (not suitable for production)
- Mock user database

**For Production, implement:**
- JWT token authentication
- Bcrypt password hashing
- HTTPS/SSL encryption
- CORS configuration
- Rate limiting
- Input validation and sanitization
- Database integration (PostgreSQL, MongoDB)
- Environment-based configuration

## 📦 Dependencies

### Backend
- **express:** Web framework
- **cors:** Cross-origin resource sharing
- **dotenv:** Environment variable management
- **bcryptjs:** Password hashing
- **jsonwebtoken:** JWT authentication

### Frontend
- **react:** UI library
- **react-dom:** React DOM rendering
- **react-router-dom:** Client-side routing
- **axios:** HTTP client
- **vite:** Build tool

## 🧪 Testing

To test the application:

1. Start both servers
2. Navigate to http://localhost:3000
3. Choose Patient or Doctor login
4. Use demo credentials to login
5. Try the different features:
   - Patient: Complete screening → View results
   - Doctor: View assessments → Analyze patient data

## 🐛 Troubleshooting

### Port Already in Use
If port 3000 or 3001 is already in use, modify the configuration in `frontend/vite.config.js` and `backend/.env`.

### Dependencies Installation Issues
```bash
# Clear node_modules and reinstall
rm -rf node_modules backend/node_modules frontend/node_modules
npm run install-all
```

### API Connection Issues
Ensure the Vite proxy in `frontend/vite.config.js` correctly points to `http://localhost:3001`.

## 📚 Documentation

### Frontend Architecture
- React components organized by feature
- React Router for navigation
- Axios for API calls with request interceptors
- Local Storage for authentication token storage

### Backend Architecture
- Express.js server with middleware
- RESTful API design
- Risk calculation algorithms
- Diagnosis comparison logic

## 🚀 Future Enhancements

- [ ] Real database integration
- [ ] User registration system
- [ ] Advanced machine learning models for risk assessment
- [ ] Data visualization (charts and graphs)
- [ ] Email notifications
- [ ] PDF report generation
- [ ] Multi-language support
- [ ] Mobile app version
- [ ] Integration with electronic health records (EHR)

## ⚖️ Disclaimer

This platform is for **educational purposes only** and is **not a substitute for professional medical advice**. Always consult with a qualified healthcare provider for proper diagnosis and treatment of PCOS or Endometriosis.

## 📄 License

ISC License - See package.json for details

## 👨‍💻 Development Notes

### Adding New Routes
1. Add endpoint to `backend/server.js`
2. Create corresponding API call in `frontend/src/services/api.js`
3. Use in components via `import { assessmentAPI } from '../services/api'`

### Styling New Components
- Use CSS classes following the naming convention in `global.css`
- Reference color variables via CSS custom properties (e.g., `var(--primary-color)`)

### Form State Management
- Use React `useState` hooks for form data
- Handle input changes with `handleInputChange` pattern
- Submit via async function with error handling

---

**Need help?** Check the component files for detailed implementation examples.
