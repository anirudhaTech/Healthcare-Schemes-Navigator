import pytest

def test_root_endpoint(client):
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_list_schemes(client):
    response = client.get("/api/schemes")
    assert response.status_code == 200
    schemes = response.json()
    assert len(schemes) >= 5
    slugs = [s["slug"] for s in schemes]
    assert "pm-jay" in slugs
    assert "mjpjay" in slugs

def test_scheme_detail(client):
    response = client.get("/api/schemes/pm-jay")
    assert response.status_code == 200
    data = response.json()
    assert data["slug"] == "pm-jay"
    assert "coverage_amount" in data
    assert len(data["benefits"]) > 0
    assert len(data["documents"]) > 0

def test_eligibility_check_api(client):
    payload = {
        "age": 62,
        "gender": "Male",
        "state": "Maharashtra",
        "district": "Kolhapur",
        "taluka": "Karvir",
        "annual_income": 120000.0,
        "bpl_status": True,
        "ration_card_type": "BPL / Yellow",
        "healthcare_requirement": "Hospitalization",
        "hospitalization_needed": True
    }
    response = client.post("/api/eligibility/check", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["eligible_count"] >= 1
    assert len(data["recommendations"]) > 0
    top = data["recommendations"][0]
    assert top["match_score"] >= 80.0
    rec_names = [r["scheme"]["name"] for r in data["recommendations"]]
    assert any("PM-JAY" in n or "MJPJAY" in n or "Charitable" in n for n in rec_names)

def test_hospital_search_api(client):
    response = client.get("/api/hospitals?district=Kolhapur")
    assert response.status_code == 200
    hospitals = response.json()
    assert len(hospitals) >= 3
    names = [h["name"] for h in hospitals]
    assert any("APPLE HOSPITALS" in n or "CPR" in n or "Pramila" in n or "Athaayu" in n for n in names)

def test_chat_assistant_api(client):
    payload = {
        "message": "What documents are required for PM-JAY?"
    }
    response = client.post("/api/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "Aadhaar" in data["message"] or "Ration" in data["message"]
    assert "disclaimer" in data
