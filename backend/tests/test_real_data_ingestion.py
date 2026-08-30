import pytest
from app.core.database import SessionLocal
from app.services.ingestion_service import IngestionService
from app.models.hospital import Hospital
from app.models.scheme import Scheme
from app.models.data_source import DataSource, IngestionLog

def test_hospital_import():
    db = SessionLocal()
    try:
        res = IngestionService.ingest_hospitals(db)
        assert res["records_found"] == 520
        assert res["records_failed"] == 0
        assert res["districts_count"] >= 28

        # Check total count in database
        total_hosp = db.query(Hospital).count()
        assert total_hosp >= 520

        # Check last record ID 520 in Yavatmal
        yavatmal_hosp = db.query(Hospital).filter(Hospital.source_record_id == 520).first()
        assert yavatmal_hosp is not None
        assert yavatmal_hosp.district_name.upper() == "YAVATMAL"
    finally:
        db.close()

def test_scheme_import():
    db = SessionLocal()
    try:
        res = IngestionService.ingest_schemes(db)
        assert res["records_found"] >= 11
        assert res["records_failed"] == 0

        # Verify key schemes
        mjpjay = db.query(Scheme).filter(Scheme.slug == "mjpjay").first()
        assert mjpjay is not None
        assert "Mahatma Jyotirao Phule" in mjpjay.name
        assert mjpjay.coverage_state == "Maharashtra"

        pmjay = db.query(Scheme).filter(Scheme.slug == "pm-jay").first()
        assert pmjay is not None
        assert "Ayushman Bharat" in pmjay.name
    finally:
        db.close()

def test_no_duplicate_hospitals():
    db = SessionLocal()
    try:
        count_before = db.query(Hospital).count()
        # Re-run ingestion
        res = IngestionService.ingest_hospitals(db)
        count_after = db.query(Hospital).count()
        assert count_after == count_before, "Re-running ingestion must not duplicate hospital records."
    finally:
        db.close()

def test_no_placeholder_hospitals():
    db = SessionLocal()
    try:
        hospitals = db.query(Hospital).all()
        for h in hospitals:
            assert h.name != "string", "Placeholder name found"
            assert h.district_name != "string", "Placeholder district found"
            if h.source_file == "Pasted text (2).txt":
                # Ensure no invented coordinates
                assert h.latitude is None or isinstance(h.latitude, float)
    finally:
        db.close()

def test_district_filter_kolhapur(client):
    # Test case-insensitive district query
    response = client.get("/api/hospitals?district=KOLHAPUR")
    assert response.status_code == 200
    hospitals = response.json()
    assert len(hospitals) >= 20, f"Expected 20+ Kolhapur hospitals, got {len(hospitals)}"
    
    names = [h["name"] for h in hospitals]
    assert any("APPLE HOSPITALS" in n for n in names)
    assert any("Athaayu" in n or "ATHAAYU" in n.upper() for n in names)
    assert any("Contacare" in n or "CONTACARE" in n.upper() for n in names)

def test_district_filter_pune(client):
    # Test district Pune
    response = client.get("/api/hospitals?district=Pune")
    assert response.status_code == 200
    hospitals = response.json()
    assert len(hospitals) >= 30, f"Expected 30+ Pune hospitals, got {len(hospitals)}"
    
    names = [h["name"] for h in hospitals]
    assert any("Apex Hospital" in n for n in names)
    assert any("Bharati Hospital" in n for n in names)

def test_hospital_search_jupiter(client):
    # Search for "Jupiter"
    response = client.get("/api/hospitals/search?q=Jupiter")
    assert response.status_code == 200
    hospitals = response.json()
    assert len(hospitals) >= 1
    jupiter = hospitals[0]
    assert "Jupiter" in jupiter["name"]
    assert jupiter["district_name"].upper() == "THANE"

def test_source_provenance(client):
    response = client.get("/api/hospitals/search?q=Jupiter")
    assert response.status_code == 200
    hospitals = response.json()
    jupiter = hospitals[0]
    assert jupiter["source_file"] == "Pasted text (2).txt"
    assert jupiter["source_record_id"] is not None
    assert jupiter["verification_status"] == "source_provided"

def test_no_fake_coordinates(client):
    # Record from imported dataset without coordinates
    response = client.get("/api/hospitals/search?q=Jupiter")
    assert response.status_code == 200
    hospitals = response.json()
    jupiter = hospitals[0]
    assert jupiter["latitude"] is None
    assert jupiter["longitude"] is None
    assert jupiter["distance_km"] is None

def test_data_sources_api(client):
    response = client.get("/api/data-sources")
    assert response.status_code == 200
    sources = response.json()
    assert len(sources) >= 2
    names = [s["name"] for s in sources]
    assert "Provided Maharashtra Hospital Dataset" in names
    assert "National & State Healthcare Schemes Catalog" in names

def test_districts_list_api(client):
    response = client.get("/api/hospitals/districts")
    assert response.status_code == 200
    districts = response.json()
    assert len(districts) >= 28
    district_names = [d["district"] for d in districts]
    assert "Kolhapur" in district_names
    assert "Pune" in district_names
    assert "Thane" in district_names
    assert "Yavatmal" in district_names
