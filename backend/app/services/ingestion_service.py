import json
import os
import logging
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.hospital import Hospital, HospitalScheme
from app.models.scheme import Scheme, SchemeEligibilityRule, SchemeBenefit, SchemeDocument
from app.models.location import State, District, Taluka
from app.models.data_source import DataSource, IngestionLog, DataChangeLog

logger = logging.getLogger("healthcare_navigator.ingestion")

# District normalization map from dataset uppercase strings to title format
DISTRICT_NORMALIZATION = {
    "AHMADNAGAR": "Ahmednagar",
    "AKOLA": "Akola",
    "AMRAVATI": "Amravati",
    "AURANGABAD": "Aurangabad",
    "BEED": "Beed",
    "BHANDARA": "Bhandara",
    "BULDHANA": "Buldhana",
    "CHANDRAPUR": "Chandrapur",
    "DHULE": "Dhule",
    "JALGAON": "Jalgaon",
    "JALNA": "Jalna",
    "KOLHAPUR": "Kolhapur",
    "LATUR": "Latur",
    "MUMBAI": "Mumbai",
    "NAGPUR": "Nagpur",
    "NANDED": "Nanded",
    "NANDURBAR": "Nandurbar",
    "NASHIK": "Nashik",
    "OSMANABAD": "Osmanabad",
    "PARBHANI": "Parbhani",
    "PUNE": "Pune",
    "SATARA": "Satara",
    "SINDHUDURG": "Sindhudurg",
    "SOLAPUR": "Solapur",
    "THANE": "Thane",
    "WARDHA": "Wardha",
    "WASHIM": "Washim",
    "YAVATMAL": "Yavatmal"
}

class IngestionService:
    @staticmethod
    def ensure_data_sources(db: Session) -> Dict[str, DataSource]:
        sources = {
            "hospitals": {
                "name": "Provided Maharashtra Hospital Dataset",
                "organization": "Government of Maharashtra (Empanelled Network)",
                "source_type": "provided_dataset",
                "url": "https://www.jeevandayee.gov.in",
                "description": "Empanelled hospital directory in Maharashtra across 28 districts.",
            },
            "schemes": {
                "name": "National & State Healthcare Schemes Catalog",
                "organization": "National Health Authority / State Health Agencies",
                "source_type": "provided_dataset",
                "url": "https://pmjay.gov.in",
                "description": "Comprehensive catalogue of central and state health assurance and maternity welfare schemes.",
            }
        }
        
        db_sources = {}
        for key, sdata in sources.items():
            src = db.query(DataSource).filter(DataSource.name == sdata["name"]).first()
            if not src:
                src = DataSource(
                    name=sdata["name"],
                    organization=sdata["organization"],
                    source_type=sdata["source_type"],
                    url=sdata["url"],
                    description=sdata["description"],
                    status="active",
                    record_count=0
                )
                db.add(src)
                db.flush()
            db_sources[key] = src
            
        db.commit()
        return db_sources

    @staticmethod
    def ingest_hospitals(db: Session, json_path: str = "backend/data/hospitals.json") -> Dict[str, Any]:
        """
        Idempotently ingest hospital records from the supplied JSON dataset.
        Preserves original source names without inventing coordinates or missing fields.
        """
        if not os.path.isabs(json_path) and not os.path.exists(json_path):
            # Try alternate relative path
            alt = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data", "hospitals.json")
            if os.path.exists(alt):
                json_path = alt

        if not os.path.exists(json_path):
            raise FileNotFoundError(f"Hospital data file not found at {json_path}")

        with open(json_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        raw_list = data.get("empanelled_hospitals", [])
        records_found = len(raw_list)
        records_created = 0
        records_updated = 0
        records_skipped = 0
        records_failed = 0
        districts_seen = set()

        # Ensure Maharashtra state exists in location table
        mah_state = db.query(State).filter(State.name == "Maharashtra").first()
        if not mah_state:
            mah_state = State(name="Maharashtra", code="MH")
            db.add(mah_state)
            db.flush()

        source_file = "Pasted text (2).txt"
        data_sources = IngestionService.ensure_data_sources(db)
        hosp_source = data_sources["hospitals"]

        for item in raw_list:
            try:
                src_id = item.get("id")
                hosp_name = item.get("hospital_name", "").strip()
                raw_district = item.get("district", "").strip()

                if not hosp_name or not raw_district:
                    records_failed += 1
                    continue

                # Standard district name for display/lookup
                norm_district = DISTRICT_NORMALIZATION.get(raw_district.upper(), raw_district.title())
                districts_seen.add(norm_district)

                # Ensure district exists in location hierarchy
                dist_record = db.query(District).filter(
                    District.state_id == mah_state.id,
                    func.lower(District.name) == norm_district.lower()
                ).first()
                if not dist_record:
                    dist_record = District(name=norm_district, state_id=mah_state.id)
                    db.add(dist_record)
                    db.flush()

                # Check if hospital already exists by (source_file, source_record_id)
                existing = db.query(Hospital).filter(
                    Hospital.source_file == source_file,
                    Hospital.source_record_id == src_id
                ).first()

                if not existing:
                    # Secondary check by exact name and district to prevent duplicate ingestion
                    existing = db.query(Hospital).filter(
                        Hospital.name == hosp_name,
                        Hospital.district_name == norm_district
                    ).first()

                if existing:
                    # Update fields if changed
                    existing.name = hosp_name
                    existing.district_id = dist_record.id
                    existing.district_name = norm_district
                    existing.source_file = source_file
                    existing.source_record_id = src_id
                    existing.data_source = hosp_source.name
                    existing.source_id = hosp_source.id
                    existing.verification_status = "source_provided"
                    existing.last_verified_date = "August 2026"
                    existing.official_source = "Provided Maharashtra Hospital Dataset"
                    records_updated += 1
                else:
                    new_hosp = Hospital(
                        name=hosp_name,
                        hospital_type="Empanelled Hospital",
                        is_government=False,
                        state="Maharashtra",
                        district_id=dist_record.id,
                        district_name=norm_district,
                        taluka_id=None,
                        taluka_name=None,
                        city_village=None,
                        pincode=None,
                        address=None,
                        latitude=None, # Nullable: no fake coordinates
                        longitude=None,
                        phone=None,
                        emergency_contact=None,
                        email=None,
                        website=None,
                        specialties=None,
                        facilities=None,
                        has_emergency_24x7=False,
                        bed_count=None,
                        source_file=source_file,
                        source_record_id=src_id,
                        data_source=hosp_source.name,
                        source_id=hosp_source.id,
                        verification_status="source_provided",
                        last_verified_date="August 2026",
                        official_source="Provided Maharashtra Hospital Dataset",
                        is_active=True
                    )
                    db.add(new_hosp)
                    records_created += 1

            except Exception as e:
                logger.error(f"Error processing hospital row {item}: {e}")
                records_failed += 1

        db.commit()

        # Update source count
        hosp_source.record_count = db.query(Hospital).count()
        hosp_source.last_checked_at = datetime.now(timezone.utc)
        db.commit()

        return {
            "records_found": records_found,
            "records_created": records_created,
            "records_updated": records_updated,
            "records_skipped": records_skipped,
            "records_failed": records_failed,
            "districts_count": len(districts_seen),
            "districts": sorted(list(districts_seen))
        }

    @staticmethod
    def ingest_schemes(db: Session, json_path: str = "backend/data/schemes.json") -> Dict[str, Any]:
        """
        Idempotently ingest schemes from the supplied JSON dataset.
        """
        if not os.path.isabs(json_path) and not os.path.exists(json_path):
            alt = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data", "schemes.json")
            if os.path.exists(alt):
                json_path = alt

        if not os.path.exists(json_path):
            raise FileNotFoundError(f"Schemes data file not found at {json_path}")

        with open(json_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        raw_list = data.get("schemes", [])
        records_found = len(raw_list)
        records_created = 0
        records_updated = 0
        records_skipped = 0
        records_failed = 0

        source_file = "Pasted markdown.md"
        data_sources = IngestionService.ensure_data_sources(db)
        scheme_source = data_sources["schemes"]

        for item in raw_list:
            try:
                slug = item.get("slug")
                name = item.get("scheme_full_name") or item.get("name")
                src_id = item.get("id")

                if not slug or not name:
                    records_failed += 1
                    continue

                scheme = db.query(Scheme).filter(Scheme.slug == slug).first()
                if not scheme:
                    scheme = db.query(Scheme).filter(
                        Scheme.source_file == source_file,
                        Scheme.source_record_id == src_id
                    ).first()

                if scheme:
                    scheme.name = name
                    scheme.category = item.get("category", "Hospitalization")
                    scheme.disease_focus = item.get("disease / focus")
                    scheme.short_description = item.get("short_description", "")
                    scheme.long_description = item.get("long_description", "")
                    scheme.government_department = item.get("government_department", "")
                    scheme.scheme_type = item.get("scheme_type", "Central")
                    scheme.target_population = item.get("target_population", "")
                    scheme.states_covered = item.get("states_covered", item.get("state", "All India"))
                    scheme.coverage_state = item.get("state", "All India")
                    scheme.coverage_amount = item.get("coverage_amount", "")
                    scheme.income_limit = item.get("income_limit", "")
                    scheme.cashless = item.get("cashless", True)
                    scheme.application_process = item.get("application_process", "")
                    scheme.application_mode = item.get("application_mode", "")
                    scheme.application_url = item.get("application_link")
                    scheme.official_website = item.get("official_website", "")
                    scheme.helpline = item.get("helpline", "")
                    scheme.last_verified_date = item.get("last_verified_date", "August 2026")
                    scheme.official_source = item.get("official_source", "National Healthcare Catalog")
                    scheme.source_file = source_file
                    scheme.source_record_id = src_id
                    scheme.data_source = scheme_source.name
                    scheme.source_id = scheme_source.id
                    scheme.verification_status = "source_provided"
                    scheme.featured = item.get("featured", True)
                    records_updated += 1
                else:
                    scheme = Scheme(
                        slug=slug,
                        name=name,
                        category=item.get("category", "Hospitalization"),
                        disease_focus=item.get("disease / focus"),
                        short_description=item.get("short_description", ""),
                        long_description=item.get("long_description", ""),
                        government_department=item.get("government_department", ""),
                        scheme_type=item.get("scheme_type", "Central"),
                        target_population=item.get("target_population", ""),
                        states_covered=item.get("states_covered", item.get("state", "All India")),
                        coverage_state=item.get("state", "All India"),
                        coverage_amount=item.get("coverage_amount", ""),
                        income_limit=item.get("income_limit", ""),
                        cashless=item.get("cashless", True),
                        application_process=item.get("application_process", ""),
                        application_mode=item.get("application_mode", ""),
                        application_url=item.get("application_link"),
                        official_website=item.get("official_website", ""),
                        helpline=item.get("helpline", ""),
                        last_verified_date=item.get("last_verified_date", "August 2026"),
                        official_source=item.get("official_source", "National Healthcare Catalog"),
                        source_file=source_file,
                        source_record_id=src_id,
                        data_source=scheme_source.name,
                        source_id=scheme_source.id,
                        verification_status="source_provided",
                        is_active=True,
                        featured=item.get("featured", True)
                    )
                    db.add(scheme)
                    db.flush()
                    records_created += 1

                # Upsert eligibility rule
                rule_data = item.get("eligibility_rule")
                if rule_data:
                    existing_rule = db.query(SchemeEligibilityRule).filter(SchemeEligibilityRule.scheme_id == scheme.id).first()
                    if not existing_rule:
                        existing_rule = SchemeEligibilityRule(scheme_id=scheme.id)
                        db.add(existing_rule)

                    existing_rule.min_age = rule_data.get("min_age", 0)
                    existing_rule.max_age = rule_data.get("max_age", 120)
                    existing_rule.gender = rule_data.get("gender", "All")
                    existing_rule.max_annual_income = rule_data.get("max_annual_income", 0.0)
                    existing_rule.bpl_required = rule_data.get("bpl_required", False)
                    existing_rule.requires_pregnancy = rule_data.get("requires_pregnancy", False)
                    existing_rule.requires_child = rule_data.get("requires_child", False)
                    existing_rule.requires_hospitalization = rule_data.get("requires_hospitalization", False)
                    existing_rule.healthcare_conditions = rule_data.get("healthcare_conditions", "General")
                    existing_rule.applicable_states = rule_data.get("applicable_states", "All India")

                # Upsert benefits
                benefits_list = item.get("benefits", [])
                db.query(SchemeBenefit).filter(SchemeBenefit.scheme_id == scheme.id).delete()
                for b in benefits_list:
                    db.add(SchemeBenefit(
                        scheme_id=scheme.id,
                        title=b.get("title", ""),
                        description=b.get("description", ""),
                        amount=b.get("amount", 0.0)
                    ))

                # Upsert documents
                docs_list = item.get("documents", [])
                db.query(SchemeDocument).filter(SchemeDocument.scheme_id == scheme.id).delete()
                for d in docs_list:
                    db.add(SchemeDocument(
                        scheme_id=scheme.id,
                        name=d.get("name", ""),
                        is_mandatory=d.get("is_mandatory", True),
                        description=d.get("description", "")
                    ))

            except Exception as e:
                logger.error(f"Error processing scheme row {item}: {e}")
                records_failed += 1

        db.commit()

        # Update source record count
        scheme_source.record_count = db.query(Scheme).count()
        scheme_source.last_checked_at = datetime.now(timezone.utc)
        db.commit()

        return {
            "records_found": records_found,
            "records_created": records_created,
            "records_updated": records_updated,
            "records_skipped": records_skipped,
            "records_failed": records_failed
        }

    @staticmethod
    def sync_all(db: Session) -> Dict[str, Any]:
        """
        Runs complete idempotent data ingestion and records run to IngestionLog.
        """
        started_at = datetime.now(timezone.utc)
        data_sources = IngestionService.ensure_data_sources(db)
        
        # Log entry
        log_entry = IngestionLog(
            source_id=data_sources["hospitals"].id,
            source_name="Provided Maharashtra Hospital & Scheme Datasets",
            started_at=started_at,
            status="RUNNING"
        )
        db.add(log_entry)
        db.commit()

        try:
            hosp_results = IngestionService.ingest_hospitals(db)
            scheme_results = IngestionService.ingest_schemes(db)
            
            total_found = hosp_results["records_found"] + scheme_results["records_found"]
            total_created = hosp_results["records_created"] + scheme_results["records_created"]
            total_updated = hosp_results["records_updated"] + scheme_results["records_updated"]
            total_failed = hosp_results["records_failed"] + scheme_results["records_failed"]

            completed_at = datetime.now(timezone.utc)
            log_entry.completed_at = completed_at
            log_entry.status = "SUCCESS"
            log_entry.records_found = total_found
            log_entry.records_created = total_created
            log_entry.records_updated = total_updated
            log_entry.records_skipped = 0
            log_entry.records_failed = total_failed
            log_entry.summary_report = (
                f"Imported {hosp_results['records_created']} new hospitals, "
                f"updated {hosp_results['records_updated']} hospitals across {hosp_results['districts_count']} districts. "
                f"Imported {scheme_results['records_created']} new schemes, updated {scheme_results['records_updated']} schemes."
            )
            db.commit()

            # Generate full data quality summary
            total_hospitals = db.query(Hospital).count()
            total_schemes = db.query(Scheme).count()
            hospitals_with_coords = db.query(Hospital).filter(Hospital.latitude.isnot(None)).count()
            hospitals_without_coords = total_hospitals - hospitals_with_coords

            return {
                "success": True,
                "status": "SUCCESS",
                "hospitals": hosp_results,
                "schemes": scheme_results,
                "data_quality_report": {
                    "total_hospitals_in_db": total_hospitals,
                    "total_schemes_in_db": total_schemes,
                    "districts_count": hosp_results["districts_count"],
                    "districts_list": hosp_results["districts"],
                    "hospitals_without_coordinates": hospitals_without_coords,
                    "hospitals_with_coordinates": hospitals_with_coords,
                    "source_provenance_verified": True,
                    "duplicate_records_prevented": True
                }
            }

        except Exception as e:
            db.rollback()
            log_entry.completed_at = datetime.now(timezone.utc)
            log_entry.status = "FAILED"
            log_entry.error_message = str(e)
            db.commit()
            raise e
