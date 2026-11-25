# Patient Admission Management System

A web-based Hospital Patient Admission Management System developed using React and FastAPI. The application helps hospital administrators manage patient records, admissions, wards, and departments through a centralized dashboard.

## Live Application

- **Frontend:** https://patient-admission-management-gamma.vercel.app
- **Backend API:** https://patient-admission-management-bktu.onrender.com/api
- **API Documentation:** https://patient-admission-management-bktu.onrender.com/docs

> Note: Frontend and backend deployment are available, but production API connectivity is pending CORS verification.

## Technology Stack

### Frontend
- React.js
- Vite
- JavaScript
- CSS

### Backend
- Python
- FastAPI
- SQLAlchemy
- SQLite

### Deployment
- GitHub – Source code management
- Vercel – Frontend hosting
- Render – Backend hosting

## Features

- Hospital dashboard with patient statistics
- Patient registration and management
- Patient directory
- Patient admission management
- Ward management
- Department management
- Ward and department details
- Patient record search and management
- Dashboard statistics

## Project Structure

```text
patient-admission-management/
│
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   └── ...
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   └── ...
│
├── README.md
└── .gitignore
```

## Installation and Setup

### Prerequisites

- Python 3.10 or later
- Node.js and npm
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR-USERNAME/patient-admission-management.git
cd patient-admission-management
```

### 2. Setup Backend

```bash
cd backend
python -m venv .venv
```

Activate the virtual environment on Windows:

```powershell
.venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start the backend:

```bash
uvicorn main:app --reload --port 8000
```

Backend URL:

http://127.0.0.1:8000

API documentation:

http://127.0.0.1:8000/docs

### 3. Setup Frontend

Open another terminal:

```bash
cd frontend
npm install
```

Create a `.env` file inside the frontend folder:

```env
VITE_API_URL=http://127.0.0.1:8000/api
```

Start the frontend:

```bash
npm run dev
```

Frontend URL:

http://localhost:5173

## Deployment Information

| Component | Hosting Platform |
|---|---|
| Frontend | Vercel |
| Backend | Render |
| Source Code | GitHub |

## Application Screenshots

Add your application screenshots in a folder named `screenshots`.

```text
screenshots/
├── dashboard.png
├── patient-directory.png
├── patient-registration.png
├── ward-management.png
└── department-management.png
```


### Dashboard
![Dashboard](screenshots/dashboard.png)

### Patient Directory
![Patient Directory](screenshots/patient-directory.png)

### Patient Registration
![Patient Registration](screenshots/patient-registration.png)

### Ward Management
![Ward Management](screenshots/ward-management.png)

### Department Management
![Department Management](screenshots/department-management.png)

## Author

Developed as a Patient Admission Management System project.

---

**Note:** Do not commit passwords, secret keys, `.env` files, or databases containing real patient information to GitHub.

# CareFlow — Patient Admission Management App

A responsive full-stack patient admission management application built for the DScribe Software Engineer Intern Round 1 task.


The backend is Python (not Node.js), as required. SQLite stores records in `backend/patients.db`, which is created automatically and persists across backend restarts.

## Features
- Add, list, edit and delete patient records (delete requires confirmation)
- Mark an admitted patient as discharged (confirmation required)
- Search by patient name
- Filter by ward, department and doctor
- Status tabs and dashboard statistics
- Export the currently visible patient list as CSV
- Responsive layout for desktop, tablet and mobile
- Frontend and backend validation

## Patient fields
Name, age, gender, ward, department, doctor, admission date and status (Admitted / Discharged).

## Validation (frontend and backend)
- Name is required and accepts letters and spaces only.
- Age is required and must be an integer from 0 through 120.
- Gender, ward, department and doctor must be selected from the backend-provided option lists.
- Admission date is required and cannot be in the future.
- Status must be `Admitted` or `Discharged`.
- The backend returns clear validation errors for invalid requests.

## Run locally
You need Python 3.10+ and Node.js 18+ (Node is used only for the React/Vite frontend tooling; the backend is Python).

### 1. Start the backend
```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
API docs: http://localhost:8000/docs

### 2. Start the frontend (new terminal)
```bash
cd frontend
npm install
npm run dev
```
Open http://localhost:5173

### Configure deployed API
Set `VITE_API_URL` to the deployed backend API base URL including `/api`, for example `https://your-api.example.com/api`, before building the frontend. For production, update the backend CORS allowlist in `backend/main.py` to include your deployed frontend origin. Deploy the backend with a persistent disk/volume for `patients.db`.

## API endpoints
| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/options` | Select-list values |
| GET | `/api/patients` | List/search/filter patients |
| POST | `/api/patients` | Add patient |
| PUT | `/api/patients/{id}` | Edit patient |
| PATCH | `/api/patients/{id}/discharge` | Mark discharged |
| DELETE | `/api/patients/{id}` | Delete patient |

Query parameters for list: `search`, `ward`, `department`, `doctor`, `status`.

## Select-list values
The PDF requires select lists but does not specify their contents. This project provides editable starter options in `backend/main.py` for gender, wards, departments and doctors. Update these lists to match the target hospital's actual configuration. Both the UI and backend validation use the same options endpoint/constants.

## Submission checklist
- [ ] Push this project to a **public GitHub repository**.
- [ ] Deploy the React frontend and Python backend, connecting them with `VITE_API_URL`.
- [ ] Configure persistent storage for SQLite in the backend deployment.
- [ ] Add screenshots and the live URL to this README.
- [ ] Email the GitHub repository and live URL to the addresses in the task PDF, using your full name in the subject.

No login/signup is included, as the task explicitly says it is not required. Never commit database files, passwords or secret keys.
