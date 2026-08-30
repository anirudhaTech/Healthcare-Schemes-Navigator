import pytest
from app.services.eligibility_engine import EligibilityEngine
from app.schemas.eligibility import EligibilityInput
from app.models.scheme import Scheme, SchemeEligibilityRule

def test_pmjay_eligible_user():
    scheme = Scheme(
        slug="pm-jay",
        name="Ayushman Bharat PM-JAY",
        short_description="Free hospitalization cover",
        long_description="Ayushman Bharat",
        government_department="NHA",
        states_covered="All India",
        coverage_amount="₹5 Lakh",
        cashless=True,
        application_process="Visit hospital",
        application_mode="Hospital Desk",
        official_website="https://pmjay.gov.in",
        helpline="14555",
        last_verified_date="August 2026",
        official_source="NHA",
        target_population="BPL families"
    )
    scheme.eligibility_rule = SchemeEligibilityRule(
        min_age=0,
        max_age=120,
        gender="All",
        max_annual_income=250000.0,
        bpl_required=True,
        healthcare_conditions="Hospitalization, Secondary Care, Surgery"
    )

    user_input = EligibilityInput(
        age=62,
        gender="Male",
        state="Maharashtra",
        district="Kolhapur",
        annual_income=120000.0,
        bpl_status=True,
        ration_card_type="BPL / Yellow",
        healthcare_requirement="Hospitalization",
        hospitalization_needed=True
    )

    result = EligibilityEngine.evaluate(user_input, scheme)
    assert result.status == "ELIGIBLE"
    assert len(result.matched_criteria) >= 3
    assert len(result.unmatched_criteria) == 0

def test_pmsma_maternal_eligibility():
    scheme = Scheme(
        slug="pmsma",
        name="Pradhan Mantri Surakshit Matritva Abhiyan",
        short_description="Antenatal care",
        long_description="Antenatal care",
        government_department="MoHFW",
        states_covered="All India",
        coverage_amount="Free ANC",
        cashless=True,
        application_process="Walk in",
        application_mode="Walk in",
        official_website="https://pmsma.nhp.gov.in",
        helpline="1800-180-1104",
        last_verified_date="August 2026",
        official_source="MoHFW",
        target_population="Pregnant women"
    )
    scheme.eligibility_rule = SchemeEligibilityRule(
        min_age=15,
        max_age=50,
        gender="Female",
        requires_pregnancy=True,
        healthcare_conditions="Maternal / Child, Pregnancy, Antenatal Care"
    )

    # Eligible pregnant female
    pregnant_user = EligibilityInput(
        age=26,
        gender="Female",
        state="Maharashtra",
        annual_income=180000.0,
        is_pregnant=True,
        healthcare_requirement="Maternal / Child"
    )
    res_preg = EligibilityEngine.evaluate(pregnant_user, scheme)
    assert res_preg.status == "ELIGIBLE"

    # Ineligible male user
    male_user = EligibilityInput(
        age=30,
        gender="Male",
        state="Maharashtra",
        annual_income=180000.0,
        is_pregnant=False,
        healthcare_requirement="Maternal / Child"
    )
    res_male = EligibilityEngine.evaluate(male_user, scheme)
    assert res_male.status == "NOT_ELIGIBLE"
    assert any("gender restriction" in u.lower() for u in res_male.unmatched_criteria)

def test_state_specific_scheme_filtering():
    scheme = Scheme(
        slug="mjpjay",
        name="MJPJAY",
        short_description="Maharashtra state health scheme",
        long_description="MJPJAY",
        government_department="SHAS",
        states_covered="Maharashtra",
        coverage_amount="₹5 Lakh",
        cashless=True,
        application_process="Hospital",
        application_mode="Hospital",
        official_website="https://jeevandayee.gov.in",
        helpline="155388",
        last_verified_date="August 2026",
        official_source="SHAS",
        target_population="MH Residents"
    )
    scheme.eligibility_rule = SchemeEligibilityRule(
        min_age=0,
        max_age=120,
        gender="All",
        max_annual_income=500000.0,
        healthcare_conditions="Hospitalization, Critical Illness"
    )

    # Maharashtra user -> ELIGIBLE
    mh_user = EligibilityInput(
        age=45,
        gender="Male",
        state="Maharashtra",
        annual_income=200000.0,
        healthcare_requirement="Hospitalization"
    )
    res_mh = EligibilityEngine.evaluate(mh_user, scheme)
    assert res_mh.status == "ELIGIBLE"

    # User from another state -> NOT_ELIGIBLE
    ka_user = EligibilityInput(
        age=45,
        gender="Male",
        state="Karnataka",
        annual_income=200000.0,
        healthcare_requirement="Hospitalization"
    )
    res_ka = EligibilityEngine.evaluate(ka_user, scheme)
    assert res_ka.status == "NOT_ELIGIBLE"
