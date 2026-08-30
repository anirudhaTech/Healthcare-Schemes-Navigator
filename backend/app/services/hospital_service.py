import math
import csv
import io
import logging
from typing import List, Optional, Tuple, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import or_, func

from app.models.hospital import Hospital, HospitalScheme
from app.models.scheme import Scheme
from app.schemas.hospital import (
    HospitalResponse,
    HospitalSchemeMappingResponse,
    DistrictCountResponse
)
from app.schemas.scheme import SchemeResponse

logger = logging.getLogger("healthcare_navigator.hospital_service")

class HospitalService:
    @staticmethod
    def calculate_haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """
        Calculates great-circle distance between two points in kilometers.
        """
        R = 6371.0
        d_lat = math.radians(lat2 - lat1)
        d_lon = math.radians(lon2 - lon1)
        
        a = (math.sin(d_lat / 2) ** 2 +
             math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
             math.sin(d_lon / 2) ** 2)
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return round(R * c, 2)

    @classmethod
    def get_hospitals(
        cls,
        db: Session,
        state: Optional[str] = None,
        district: Optional[str] = None,
        taluka: Optional[str] = None,
        pincode: Optional[str] = None,
        scheme_slug: Optional[str] = None,
        hospital_type: Optional[str] = None,
        is_government: Optional[bool] = None,
        has_emergency: Optional[bool] = None,
        search: Optional[str] = None,
        user_lat: Optional[float] = None,
        user_lng: Optional[float] = None,
        max_distance_km: Optional[float] = 100.0,
        skip: int = 0,
        limit: int = 100
    ) -> List[HospitalResponse]:
        query = db.query(Hospital).filter(Hospital.is_active == True)

        if state:
            query = query.filter(Hospital.state.ilike(f"%{state.strip()}%"))

        if district:
            # Case-insensitive district match
            d_clean = district.strip()
            query = query.filter(Hospital.district_name.ilike(f"%{d_clean}%"))

        if taluka:
            query = query.filter(Hospital.taluka_name.ilike(f"%{taluka.strip()}%"))

        if pincode:
            query = query.filter(Hospital.pincode == pincode.strip())

        if hospital_type:
            query = query.filter(Hospital.hospital_type.ilike(f"%{hospital_type.strip()}%"))

        if is_government is not None:
            query = query.filter(Hospital.is_government == is_government)

        if has_emergency is not None:
            query = query.filter(Hospital.has_emergency_24x7 == has_emergency)

        if search:
            s = f"%{search.strip()}%"
            query = query.filter(
                or_(
                    Hospital.name.ilike(s),
                    Hospital.district_name.ilike(s),
                    Hospital.taluka_name.ilike(s),
                    Hospital.address.ilike(s),
                    Hospital.specialties.ilike(s)
                )
            )

        if scheme_slug:
            query = query.join(HospitalScheme).join(Scheme).filter(
                Scheme.slug == scheme_slug,
                HospitalScheme.status == "ACTIVE"
            )

        hospitals = query.offset(skip).limit(limit).all()
        results: List[HospitalResponse] = []

        for h in hospitals:
            dist = None
            if user_lat is not None and user_lng is not None and h.latitude is not None and h.longitude is not None:
                dist = cls.calculate_haversine_distance(user_lat, user_lng, h.latitude, h.longitude)
                if max_distance_km and dist > max_distance_km:
                    continue

            # Mapped schemes
            scheme_mappings = []
            for mapping in h.scheme_mappings:
                if mapping.status == "ACTIVE" and mapping.scheme:
                    scheme_mappings.append(HospitalSchemeMappingResponse(
                        scheme_id=mapping.scheme.id,
                        scheme_name=mapping.scheme.name,
                        scheme_slug=mapping.scheme.slug,
                        status=mapping.status,
                        empanelment_number=mapping.empanelment_number,
                        services_covered=mapping.services_covered,
                        last_verified_date=mapping.last_verified_date,
                        official_source=mapping.official_source
                    ))

            rec_score = 80.0 if h.is_government else 70.0
            if dist is not None:
                rec_score += max(0, 20.0 - dist * 0.5)

            results.append(HospitalResponse(
                id=h.id,
                name=h.name,
                hospital_type=h.hospital_type or "Empanelled Hospital",
                is_government=h.is_government,
                state=h.state,
                district_name=h.district_name,
                taluka_name=h.taluka_name,
                city_village=h.city_village,
                pincode=h.pincode,
                address=h.address,
                latitude=h.latitude,
                longitude=h.longitude,
                phone=h.phone,
                emergency_contact=h.emergency_contact,
                email=h.email,
                website=h.website,
                specialties=h.specialties,
                facilities=h.facilities,
                has_emergency_24x7=h.has_emergency_24x7,
                bed_count=h.bed_count,
                verification_status=h.verification_status,
                last_verified_date=h.last_verified_date,
                official_source=h.official_source,
                data_source=h.data_source,
                source_file=h.source_file,
                source_record_id=h.source_record_id,
                is_active=h.is_active,
                distance_km=dist,
                recommendation_score=round(rec_score, 1),
                available_schemes=scheme_mappings
            ))

        return results

    @classmethod
    def get_hospital_detail(cls, db: Session, hospital_id: int) -> Optional[HospitalResponse]:
        h = db.query(Hospital).filter(Hospital.id == hospital_id).first()
        if not h:
            return None

        scheme_mappings = []
        for mapping in h.scheme_mappings:
            if mapping.scheme and mapping.scheme.is_active:
                scheme_mappings.append(HospitalSchemeMappingResponse(
                    scheme_id=mapping.scheme.id,
                    scheme_name=mapping.scheme.name,
                    scheme_slug=mapping.scheme.slug,
                    status=mapping.status,
                    empanelment_number=mapping.empanelment_number,
                    services_covered=mapping.services_covered,
                    last_verified_date=mapping.last_verified_date,
                    official_source=mapping.official_source
                ))

        return HospitalResponse(
            id=h.id,
            name=h.name,
            hospital_type=h.hospital_type or "Empanelled Hospital",
            is_government=h.is_government,
            state=h.state,
            district_name=h.district_name,
            taluka_name=h.taluka_name,
            city_village=h.city_village,
            pincode=h.pincode,
            address=h.address,
            latitude=h.latitude,
            longitude=h.longitude,
            phone=h.phone,
            emergency_contact=h.emergency_contact,
            email=h.email,
            website=h.website,
            specialties=h.specialties,
            facilities=h.facilities,
            has_emergency_24x7=h.has_emergency_24x7,
            bed_count=h.bed_count,
            verification_status=h.verification_status,
            last_verified_date=h.last_verified_date,
            official_source=h.official_source,
            data_source=h.data_source,
            source_file=h.source_file,
            source_record_id=h.source_record_id,
            is_active=h.is_active,
            available_schemes=scheme_mappings
        )

    @classmethod
    def get_districts(cls, db: Session, state: str = "Maharashtra") -> List[DistrictCountResponse]:
        """
        Returns list of all distinct districts in the database along with hospital counts.
        """
        rows = db.query(
            Hospital.district_name,
            func.count(Hospital.id).label("count")
        ).filter(
            Hospital.is_active == True,
            Hospital.state.ilike(f"%{state}%")
        ).group_by(Hospital.district_name).order_by(Hospital.district_name).all()

        return [
            DistrictCountResponse(
                district=r[0],
                hospital_count=r[1],
                state=state
            )
            for r in rows
        ]
