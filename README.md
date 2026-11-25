# CareFlow — Patient Admission Management App

A responsive full-stack patient admission management application built for the DScribe Software Engineer Intern Round 1 task.

## Tech stack
- **Frontend:** React.js, Vite, JavaScript, CSS
- **Backend:** Python, FastAPI, Pydantic
- **Database:** SQLite with SQLAlchemy ORM

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
