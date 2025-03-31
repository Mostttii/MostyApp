from fastapi import FastAPI, Request, Depends, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session
from .models import SessionLocal, Parser, ParseError, WeeklyReport
from .accuracy_checker import check_parser_accuracy
from .report_generator import generate_weekly_report
import firebase_admin
from firebase_admin import credentials, firestore
import os
from datetime import datetime, timedelta

# Initialize Firebase Admin
try:
    cred = credentials.Certificate(os.getenv('FIREBASE_CREDENTIALS'))
    firebase_admin.initialize_app(cred)
    db = firestore.client()
    print("Firebase initialized successfully")
except Exception as e:
    print(f"Firebase initialization failed: {e}")
    db = None

app = FastAPI(title="Recipe Parser Monitor")

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Templates
templates = Jinja2Templates(directory="monitoring/templates")

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/", response_class=HTMLResponse)
async def dashboard(request: Request, db: Session = Depends(get_db)):
    # Get parser stats
    parser = db.query(Parser).first()
    if not parser:
        parser = Parser(
            name="AllRecipes Parser",
            version="1.0",
            total_recipes=0,
            accuracy_score=0.0,
            error_count=0,
            last_run=datetime.utcnow(),
            last_run_recipes=0,
            avg_parse_time=0.0
        )
        db.add(parser)
        db.commit()

    # Get recent errors
    recent_errors = db.query(ParseError).order_by(ParseError.timestamp.desc()).limit(5).all()

    # Get weekly reports
    weekly_reports = db.query(WeeklyReport).order_by(WeeklyReport.report_date.desc()).limit(4).all()

    return templates.TemplateResponse(
        "dashboard.html",
        {
            "request": request,
            "parser": parser,
            "recent_errors": recent_errors,
            "weekly_reports": weekly_reports
        }
    )

@app.post("/check-accuracy")
async def trigger_accuracy_check(db: Session = Depends(get_db)):
    try:
        accuracy_score = await check_parser_accuracy()
        parser = db.query(Parser).first()
        if parser:
            parser.accuracy_score = accuracy_score
            db.commit()
        return {"status": "success", "accuracy_score": accuracy_score}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/generate-report")
async def trigger_report_generation(db: Session = Depends(get_db)):
    try:
        report_data = await generate_weekly_report()
        report = WeeklyReport(
            report_date=datetime.utcnow(),
            total_recipes=report_data["total_recipes"],
            success_rate=report_data["success_rate"],
            avg_accuracy=report_data["avg_accuracy"],
            error_count=report_data["error_count"],
            report_data=str(report_data)
        )
        db.add(report)
        db.commit()
        return {"status": "success", "report_data": report_data}
    except Exception as e:
        return {"status": "error", "message": str(e)} 