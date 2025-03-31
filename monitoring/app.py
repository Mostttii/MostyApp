from fastapi import FastAPI, Request, BackgroundTasks
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from datetime import datetime, timedelta
import firebase_admin
from firebase_admin import credentials, firestore
import json
import os
from .models import Session, Parser, ParseError, WeeklyReport
from .accuracy_checker import check_parser_accuracy
from .report_generator import generate_weekly_report

# Initialize Firebase Admin (optional)
db = None
try:
    if os.path.exists('firebase-credentials.json'):
        cred = credentials.Certificate('firebase-credentials.json')
        firebase_admin.initialize_app(cred)
        db = firestore.client()
        print("Firebase initialized successfully")
    else:
        print("Firebase credentials file not found - running without Firebase")
except Exception as e:
    print(f"Failed to initialize Firebase: {e}")

app = FastAPI(title="Recipe Parser Monitor")
app.mount("/static", StaticFiles(directory="monitoring/static"), name="static")
templates = Jinja2Templates(directory="monitoring/templates")

@app.get("/")
async def dashboard(request: Request):
    session = Session()
    try:
        # Get parser stats
        parsers = session.query(Parser).all()
        
        # Get summary stats
        total_active = len(parsers)
        recipes_this_week = sum(p.last_run_recipes for p in parsers)
        low_accuracy = [p for p in parsers if p.accuracy_score < 90]
        
        # Get latest report
        latest_report = session.query(WeeklyReport).order_by(WeeklyReport.report_date.desc()).first()
        
        return templates.TemplateResponse(
            "dashboard.html",
            {
                "request": request,
                "parsers": parsers,
                "total_active": total_active,
                "recipes_this_week": recipes_this_week,
                "low_accuracy": low_accuracy,
                "latest_report": latest_report
            }
        )
    finally:
        session.close()

@app.get("/parser/{parser_id}/errors")
async def parser_errors(parser_id: int):
    session = Session()
    try:
        errors = session.query(ParseError).filter_by(parser_id=parser_id).all()
        return {"errors": [{"url": e.url, "message": e.error_message, "timestamp": e.timestamp} for e in errors]}
    finally:
        session.close()

@app.get("/export/pdf")
async def export_pdf():
    # TODO: Implement PDF export using WeasyPrint
    pass

@app.get("/export/csv")
async def export_csv():
    session = Session()
    try:
        parsers = session.query(Parser).all()
        csv_data = []
        for p in parsers:
            csv_data.append({
                "name": p.name,
                "version": p.version,
                "total_recipes": p.total_recipes,
                "accuracy": p.accuracy_score,
                "errors": p.error_count,
                "last_run": p.last_run
            })
        # Save to CSV and return file
        return FileResponse("parser_stats.csv")
    finally:
        session.close()

@app.post("/check-accuracy")
async def check_accuracy(background_tasks: BackgroundTasks):
    """Trigger accuracy check for all parsers"""
    background_tasks.add_task(check_parser_accuracy)
    return {"message": "Accuracy check started"}

@app.post("/generate-report")
async def trigger_report(background_tasks: BackgroundTasks):
    """Manually trigger weekly report generation"""
    background_tasks.add_task(generate_weekly_report)
    return {"message": "Report generation started"} 