from datetime import datetime, timedelta
import json
from collections import Counter
import firebase_admin
from firebase_admin import firestore
from .models import Session, Parser, ParseError, WeeklyReport

async def generate_weekly_report():
    """Generate weekly report for all parsers"""
    session = Session()
    db = firestore.client()
    
    try:
        # Calculate date range
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=7)
        
        # Get all parsers
        parsers = session.query(Parser).all()
        
        # Initialize report data
        report_data = {
            'recipes_added': 0,
            'failing_parsers': [],
            'accuracy_breakdown': {},
            'top_issues': []
        }
        
        # Get recipes added this week
        recipes = db.collection('test_parsed_recipes')\
            .where('dateAdded', '>=', start_date.isoformat())\
            .where('dateAdded', '<=', end_date.isoformat())\
            .get()
        
        report_data['recipes_added'] = len(list(recipes))
        
        # Analyze parsers
        for parser in parsers:
            # Check accuracy
            if parser.accuracy_score < 90:
                report_data['failing_parsers'].append({
                    'name': parser.name,
                    'accuracy': parser.accuracy_score,
                    'error_count': parser.error_count
                })
            
            # Add to accuracy breakdown
            report_data['accuracy_breakdown'][parser.name] = {
                'accuracy': parser.accuracy_score,
                'total_recipes': parser.total_recipes,
                'errors': parser.error_count
            }
            
            # Get recent errors
            errors = session.query(ParseError)\
                .filter_by(parser_id=parser.id)\
                .filter(ParseError.timestamp >= start_date)\
                .all()
            
            # Count error types
            error_counts = Counter(error.error_message for error in errors)
            for error_msg, count in error_counts.most_common(5):
                report_data['top_issues'].append({
                    'parser': parser.name,
                    'error': error_msg,
                    'count': count
                })
        
        # Store report
        weekly_report = WeeklyReport(
            report_date=end_date,
            recipes_added=report_data['recipes_added'],
            failing_parsers=report_data['failing_parsers'],
            accuracy_breakdown=report_data['accuracy_breakdown'],
            top_issues=report_data['top_issues']
        )
        session.add(weekly_report)
        session.commit()
        
        # Save report to file
        report_file = f"reports/weekly_report_{end_date.strftime('%Y%m%d')}.json"
        with open(report_file, 'w') as f:
            json.dump(report_data, f, indent=2)
            
    except Exception as e:
        print(f"Error generating report: {str(e)}")
    finally:
        session.close()
        
    return report_data 