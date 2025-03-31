from datetime import datetime, timedelta
from monitoring.models import Session, Parser

def init_database():
    """Initialize the database with the AllRecipes parser"""
    session = Session()
    
    try:
        # Check if AllRecipes parser already exists
        parser = session.query(Parser).filter_by(name='allrecipes').first()
        
        if not parser:
            # Create AllRecipes parser
            parser = Parser(
                name='allrecipes',
                version='1.0.0',
                total_recipes=29,  # From the last run
                last_run_recipes=29,
                accuracy_score=100.0,  # Will be updated by accuracy checker
                error_count=0,
                error_logs={},
                avg_parse_time=0.0,
                last_run=datetime.utcnow(),
                next_run=datetime.utcnow() + timedelta(days=7)  # Next Sunday
            )
            session.add(parser)
            session.commit()
            print("AllRecipes parser initialized")
        else:
            print("AllRecipes parser already exists")
            
    except Exception as e:
        print(f"Error initializing database: {str(e)}")
    finally:
        session.close()

if __name__ == '__main__':
    init_database() 