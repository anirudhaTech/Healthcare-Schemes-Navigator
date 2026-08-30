from typing import List, Dict, Any
from app.models.scheme import Scheme
from app.schemas.eligibility import (
    EligibilityInput,
    RecommendedSchemeOut,
    RecommendationScoreBreakdown,
    EligibilityResponse
)
from app.services.eligibility_engine import EligibilityEngine
from app.schemas.scheme import SchemeOut

class RecommendationService:
    """
    AI/ML Multi-Factor Explainable Recommendation System for Healthcare Schemes.
    Ranks schemes based on 5 weighted scoring factors:
    1. Eligibility Match (50%)
    2. Healthcare Need Match (20%)
    3. Demographic Match (10%)
    4. Location Match (10%)
    5. Socioeconomic Match (10%)
    """

    @classmethod
    def calculate_score(
        cls,
        user_input: EligibilityInput,
        scheme: Scheme,
        rule_eval
    ) -> RecommendationScoreBreakdown:
        # 1. Eligibility Rule Score (Max 50)
        if rule_eval.status == "ELIGIBLE":
            rule_score = 50.0
        elif rule_eval.status == "POTENTIALLY_ELIGIBLE":
            rule_score = 35.0 - (len(rule_eval.unmatched_criteria) * 5.0)
            rule_score = max(rule_score, 20.0)
        else:
            # NOT_ELIGIBLE gets a low rule score (0 to 15)
            rule_score = max(0.0, 15.0 - (len(rule_eval.unmatched_criteria) * 5.0))

        # 2. Healthcare Need Match (Max 20)
        healthcare_score = 0.0
        req = (user_input.healthcare_requirement or "").lower()
        rule = scheme.eligibility_rule
        conditions = (rule.healthcare_conditions.lower() if rule else scheme.short_description.lower())
        
        if req and req in conditions:
            healthcare_score = 20.0
        elif "hospitalization" in req and (scheme.cashless or "hospital" in conditions or "secondary" in conditions or "tertiary" in conditions):
            healthcare_score = 18.0
        elif "maternal" in req and ("mother" in conditions or "matritva" in conditions or "pregnancy" in conditions or "janani" in conditions):
            healthcare_score = 20.0
        elif "child" in req and ("bal" in conditions or "child" in conditions or "kishor" in conditions or "pediatric" in conditions):
            healthcare_score = 20.0
        elif "surgery" in req and ("surgery" in conditions or "surgical" in conditions or "critical" in conditions):
            healthcare_score = 20.0
        elif "chronic" in req and (user_input.has_chronic_illness or "chronic" in conditions or "ncd" in conditions):
            healthcare_score = 18.0
        elif "preventive" in req or "general" in req:
            healthcare_score = 15.0
        else:
            healthcare_score = 10.0

        # 3. Demographic Match (Max 10)
        demographic_score = 0.0
        if rule:
            age_fit = rule.min_age <= user_input.age <= rule.max_age
            gender_fit = rule.gender == "All" or rule.gender.lower() == user_input.gender.lower()
            if age_fit and gender_fit:
                demographic_score += 10.0
            elif age_fit or gender_fit:
                demographic_score += 5.0
        else:
            demographic_score = 8.0

        # 4. Location Match (Max 10)
        location_score = 0.0
        states_covered = (scheme.states_covered or "All India").strip().lower()
        if states_covered in ["all india", "national", "all states"]:
            location_score = 10.0
        elif user_input.state and user_input.state.lower() in states_covered:
            location_score = 10.0 # State specific high resonance
        else:
            location_score = 0.0

        # 5. Socioeconomic Match (Max 10)
        socio_score = 0.0
        if user_input.bpl_status:
            socio_score = 10.0
        elif user_input.annual_income <= 150000:
            socio_score = 10.0
        elif user_input.annual_income <= 300000:
            socio_score = 8.0
        elif user_input.annual_income <= 500000:
            socio_score = 6.0
        else:
            # Higher income
            if scheme.scheme_type == "Central" and not (rule and rule.bpl_required):
                socio_score = 7.0
            else:
                socio_score = 3.0

        total_score = rule_score + healthcare_score + demographic_score + location_score + socio_score
        total_score = min(100.0, max(0.0, total_score))

        # Determine Match Level
        if total_score >= 80.0 and rule_eval.status == "ELIGIBLE":
            match_level = "Highly Recommended"
        elif total_score >= 65.0:
            match_level = "Recommended"
        elif total_score >= 45.0 or rule_eval.status == "POTENTIALLY_ELIGIBLE":
            match_level = "Potentially Eligible"
        else:
            match_level = "Low Match"

        breakdown = RecommendationScoreBreakdown(
            rule_score=round(rule_score, 1),
            healthcare_need_score=round(healthcare_score, 1),
            demographic_score=round(demographic_score, 1),
            location_score=round(location_score, 1),
            socioeconomic_score=round(socio_score, 1),
            total_score=round(total_score, 1),
            match_level=match_level
        )
        return breakdown

    @classmethod
    def generate_recommendations(
        cls,
        user_input: EligibilityInput,
        all_schemes: List[Scheme]
    ) -> EligibilityResponse:
        recommendations: List[RecommendedSchemeOut] = []
        eligible_count = 0
        potential_count = 0

        for scheme in all_schemes:
            if not scheme.is_active:
                continue

            rule_eval = EligibilityEngine.evaluate(user_input, scheme)
            score_breakdown = cls.calculate_score(user_input, scheme, rule_eval)

            if rule_eval.status == "ELIGIBLE":
                eligible_count += 1
            elif rule_eval.status == "POTENTIALLY_ELIGIBLE":
                potential_count += 1

            # Compile "Why Recommended" explainable bullet points
            why_recommended: List[str] = []
            if score_breakdown.rule_score >= 35:
                why_recommended.append("✓ Satisfies core demographic and statutory eligibility rules")
            if score_breakdown.healthcare_need_score >= 15:
                why_recommended.append(f"✓ Tailored for your healthcare need: {user_input.healthcare_requirement}")
            if score_breakdown.location_score >= 8:
                why_recommended.append(f"✓ Available in your state ({user_input.state})")
            if score_breakdown.socioeconomic_score >= 7:
                why_recommended.append("✓ Matches your socioeconomic/income profile")
            if scheme.cashless:
                why_recommended.append(f"✓ Cashless treatment benefit up to {scheme.coverage_amount}")

            # Caveats
            if rule_eval.verification_caveats:
                warning = rule_eval.verification_caveats[0]
            else:
                warning = "Verification of identity (Aadhaar/Ration card) is required at the empanelled hospital."

            # Calculate empanelled hospitals count for this scheme if applicable
            nearby_hosp_count = len([m for m in scheme.hospital_mappings if m.status == "ACTIVE"])

            rec = RecommendedSchemeOut(
                scheme=SchemeOut.model_validate(scheme),
                eligibility_status=rule_eval.status,
                match_score=score_breakdown.total_score,
                match_level=score_breakdown.match_level,
                rule_evaluation=rule_eval,
                score_breakdown=score_breakdown,
                why_recommended=why_recommended,
                verification_warning=warning,
                nearby_hospitals_count=nearby_hosp_count
            )
            recommendations.append(rec)

        # Sort recommendations: highest match score first, with ELIGIBLE and POTENTIALLY_ELIGIBLE prioritized
        recommendations.sort(
            key=lambda x: (
                1 if x.eligibility_status == "ELIGIBLE" else (0.8 if x.eligibility_status == "POTENTIALLY_ELIGIBLE" else 0.2),
                x.match_score
            ),
            reverse=True
        )

        return EligibilityResponse(
            total_schemes_evaluated=len(all_schemes),
            eligible_count=eligible_count,
            potentially_eligible_count=potential_count,
            recommendations=recommendations
        )
