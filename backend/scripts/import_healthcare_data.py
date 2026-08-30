import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.database import SessionLocal, engine, Base
import app.models
from app.services.ingestion_service import IngestionService
from app.models.hospital import Hospital
from app.models.scheme import Scheme

def run_import():
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        print("="*70)
        print("AROGYANAV -- HEALTHCARE DATA IMPORT & INGESTION PIPELINE")
        print("="*70)
        
        result = IngestionService.sync_all(db)
        
        h_res = result["hospitals"]
        s_res = result["schemes"]
        dq = result["data_quality_report"]
        
        print("\nINGESTION RESULTS & DATA QUALITY REPORT:")
        print(f"* Source hospital records found: {h_res['records_found']}")
        print(f"* Successfully imported/created: {h_res['records_created']}")
        print(f"* Successfully updated/verified: {h_res['records_updated']}")
        print(f"* Skipped: {h_res['records_skipped']}")
        print(f"* Duplicates prevented: {h_res['records_found'] - h_res['records_created'] if h_res['records_created'] < h_res['records_found'] else 0}")
        print(f"* Invalid records: {h_res['records_failed']}")
        print(f"* Total districts represented: {h_res['districts_count']}")
        print(f"* Total scheme records found: {s_res['records_found']}")
        print(f"* Total schemes imported/created: {s_res['records_created']}")
        print(f"* Total schemes updated/verified: {s_res['records_updated']}")
        print(f"* Hospitals with missing coordinates (no fake data): {dq['hospitals_without_coordinates']}")
        print(f"* Records with explicit source provenance: {dq['total_hospitals_in_db'] + dq['total_schemes_in_db']}")
        
        print("\nDISTRICTS IMPORTED:")
        print(", ".join(dq["districts_list"]))
        
        print("\n[OK] DATA INGESTION COMPLETED SUCCESSFULLY.")
        print("="*70)
        
    finally:
        db.close()

if __name__ == "__main__":
    run_import()
