from datetime import date
from typing import Optional
import re
from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator
from sqlalchemy import create_engine, Column, Integer, String, Date, select
from sqlalchemy.orm import declarative_base, sessionmaker, Session

DATABASE_URL = "sqlite:///./patients.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()

GENDERS = ["Female", "Male", "Other"]
WARDS = ["General Ward", "ICU", "Emergency", "Maternity", "Pediatrics", "Private Ward"]
DEPARTMENTS = ["Cardiology", "Neurology", "Orthopedics", "Pediatrics", "General Medicine", "Gynecology", "Oncology", "Emergency"]
DOCTORS = ["Dr. Ananya Rao", "Dr. Arjun Mehta", "Dr. Priya Sharma", "Dr. Rahul Nair", "Dr. Sneha Iyer", "Dr. Vikram Patel"]

class Patient(Base):
    __tablename__ = "patients"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    age = Column(Integer, nullable=False)
    gender = Column(String(20), nullable=False)
    ward = Column(String(80), nullable=False)
    department = Column(String(80), nullable=False)
    doctor = Column(String(100), nullable=False)
    admission_date = Column(Date, nullable=False)
    status = Column(String(20), nullable=False, default="Admitted")

Base.metadata.create_all(bind=engine)
app = FastAPI(title="Patient Admission Management API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://patient-admission-management-9bdyn5ojv.vercel.app"
],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

def get_db():
    db = SessionLocal()
    try: yield db
    finally: db.close()

class PatientInput(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    age: int = Field(..., ge=0, le=120)
    gender: str
    ward: str
    department: str
    doctor: str
    admission_date: date
    status: str = "Admitted"

    @field_validator("name")
    @classmethod
    def valid_name(cls, value):
        value = value.strip()
        if not value or not re.fullmatch(r"[A-Za-z ]+", value):
            raise ValueError("Name is required and must contain letters only.")
        return value

    @field_validator("gender")
    @classmethod
    def valid_gender(cls, value):
        if value not in GENDERS: raise ValueError("Please select a valid gender.")
        return value

    @field_validator("ward")
    @classmethod
    def valid_ward(cls, value):
        if value not in WARDS: raise ValueError("Please select a valid ward.")
        return value

    @field_validator("department")
    @classmethod
    def valid_department(cls, value):
        if value not in DEPARTMENTS: raise ValueError("Please select a valid department.")
        return value

    @field_validator("doctor")
    @classmethod
    def valid_doctor(cls, value):
        if value not in DOCTORS: raise ValueError("Please select a valid doctor.")
        return value

    @field_validator("admission_date")
    @classmethod
    def valid_date(cls, value):
        if value > date.today(): raise ValueError("Admission date cannot be in the future.")
        return value

    @field_validator("status")
    @classmethod
    def valid_status(cls, value):
        if value not in ["Admitted", "Discharged"]: raise ValueError("Status must be Admitted or Discharged.")
        return value

class PatientOut(BaseModel):
    id: int
    name: str
    age: int
    gender: str
    ward: str
    department: str
    doctor: str
    admission_date: date
    status: str
    class Config: from_attributes = True

@app.get("/api/health")
def health(): return {"status": "ok"}

@app.get("/api/options")
def options():
    return {"genders": GENDERS, "wards": WARDS, "departments": DEPARTMENTS, "doctors": DOCTORS}

@app.get("/api/patients", response_model=list[PatientOut])
def list_patients(search: Optional[str] = None, ward: Optional[str] = None, department: Optional[str] = None, doctor: Optional[str] = None, status: Optional[str] = None, db: Session = Depends(get_db)):
    stmt = select(Patient)
    if search: stmt = stmt.where(Patient.name.ilike(f"%{search.strip()}%"))
    if ward: stmt = stmt.where(Patient.ward == ward)
    if department: stmt = stmt.where(Patient.department == department)
    if doctor: stmt = stmt.where(Patient.doctor == doctor)
    if status: stmt = stmt.where(Patient.status == status)
    return list(db.scalars(stmt.order_by(Patient.id.desc())).all())

@app.post("/api/patients", response_model=PatientOut, status_code=201)
def create_patient(payload: PatientInput, db: Session = Depends(get_db)):
    patient = Patient(**payload.model_dump())
    db.add(patient); db.commit(); db.refresh(patient)
    return patient

@app.put("/api/patients/{patient_id}", response_model=PatientOut)
def update_patient(patient_id: int, payload: PatientInput, db: Session = Depends(get_db)):
    patient = db.get(Patient, patient_id)
    if not patient: raise HTTPException(status_code=404, detail="Patient not found.")
    for key, value in payload.model_dump().items(): setattr(patient, key, value)
    db.commit(); db.refresh(patient)
    return patient

@app.patch("/api/patients/{patient_id}/discharge", response_model=PatientOut)
def discharge_patient(patient_id: int, db: Session = Depends(get_db)):
    patient = db.get(Patient, patient_id)
    if not patient: raise HTTPException(status_code=404, detail="Patient not found.")
    patient.status = "Discharged"; db.commit(); db.refresh(patient)
    return patient

@app.delete("/api/patients/{patient_id}")
def delete_patient(patient_id: int, db: Session = Depends(get_db)):
    patient = db.get(Patient, patient_id)
    if not patient: raise HTTPException(status_code=404, detail="Patient not found.")
    db.delete(patient); db.commit()
    return {"message": "Patient deleted successfully."}
