from typing import List, Tuple
from app.models.scheme import Scheme, SchemeEligibilityRule
from app.schemas.eligibility import EligibilityInput, RuleEvaluationDetail

class EligibilityEngine:
    """
    Deterministic Rule-Based Eligibility Engine for Indian Government Healthcare Schemes.
    Evaluates individual user attributes against official scheme guidelines and criteria.
    """

    @staticmethod
    def evaluate(user_input: EligibilityInput, scheme: Scheme) -> RuleEvaluationDetail:
        rule: SchemeEligibilityRule = scheme.eligibility_rule
        if not rule:
            return RuleEvaluationDetail(
                status="POTENTIALLY_ELIGIBLE",
                matched_criteria=["General public scheme"],
                unmatched_criteria=[],
                verification_caveats=["Requires official portal verification"],
                summary="Potentially eligible under general public health provisions."
            )

        min_age = rule.min_age if rule.min_age is not None else 0
        max_age = rule.max_age if rule.max_age is not None else 120
        gender = rule.gender or "All"
        max_income = rule.max_annual_income or 0.0
        bpl_required = bool(rule.bpl_required)
        secc_required = bool(rule.secc_required)
        rural_urban = rule.rural_urban or "Both"
        requires_pregnancy = bool(rule.requires_pregnancy)
        requires_lactating = bool(rule.requires_lactating)
        requires_child = bool(rule.requires_child)
        max_child_age = rule.max_child_age_years if rule.max_child_age_years is not None else 18
        requires_disability = bool(rule.requires_disability)
        healthcare_conditions = rule.healthcare_conditions or ""

        matched: List[str] = []
        unmatched: List[str] = []
        caveats: List[str] = []

        # 1. State Coverage Check
        states_covered = (scheme.states_covered or "All India").strip()
        state_match = False
        if states_covered.lower() in ["all india", "national", "all states"]:
            state_match = True
            matched.append(f"Geographic coverage: Scheme is applicable Nationwide across All States including {user_input.state}")
        elif user_input.state and user_input.state.lower() in states_covered.lower():
            state_match = True
            matched.append(f"State specific match: Applicable in {user_input.state}")
        else:
            unmatched.append(f"State restriction: Scheme applies specifically to {states_covered} (your location: {user_input.state})")

        # 2. Age Criteria Check
        if min_age <= user_input.age <= max_age:
            matched.append(f"Age criterion: Your age ({user_input.age} yrs) is within eligible bracket ({min_age}–{max_age} yrs)")
        else:
            unmatched.append(f"Age mismatch: Requires age between {min_age} and {max_age} years (current: {user_input.age} yrs)")

        # 3. Gender Criteria Check
        if gender == "All" or gender.lower() == user_input.gender.lower():
            matched.append(f"Gender criterion: Eligible for {user_input.gender} beneficiaries")
        else:
            unmatched.append(f"Gender restriction: Scheme is specifically reserved for {gender} beneficiaries")

        # 4. Socioeconomic & Income Check
        if max_income > 0:
            if user_input.annual_income <= max_income or (user_input.bpl_status and user_input.annual_income == 0):
                matched.append(f"Income threshold: Annual income ₹{user_input.annual_income:,.0f} is within the limit of ₹{max_income:,.0f}")
            else:
                unmatched.append(f"Income ceiling: Exceeds maximum annual income ceiling of ₹{max_income:,.0f}")

        if bpl_required:
            if user_input.bpl_status or (user_input.ration_card_type and user_input.ration_card_type.lower() in ["bpl / yellow", "antyodaya (aay)", "priority household (phh) / orange"]):
                matched.append("BPL/Ration Card criterion: Verified BPL / Priority Household beneficiary")
            else:
                caveats.append("Scheme requires BPL or Priority Ration Card status; verify if enrolled in SECC database")

        if secc_required:
            caveats.append("Eligibility is officially based on SECC 2011 deprivation criteria")

        # 5. Rural / Urban Check
        if rural_urban in ["Both", None, ""]:
            pass
        elif rural_urban.lower() == (user_input.area_type or "").lower():
            matched.append(f"Location type: Designed for {user_input.area_type} residents")
        else:
            unmatched.append(f"Location scope: Targets {rural_urban} areas specifically (you selected {user_input.area_type})")

        # 6. Specific Life-stage & Health Status Checks
        if requires_pregnancy:
            if user_input.is_pregnant:
                matched.append("Maternal status: Currently pregnant (eligible for antenatal and delivery assistance)")
            else:
                unmatched.append("Target group: Specifically intended for pregnant women")

        if requires_lactating:
            if user_input.is_lactating:
                matched.append("Lactating mother status: Currently nursing mother")
            else:
                unmatched.append("Target group: Specifically intended for lactating mothers")

        if requires_child:
            if user_input.children_count > 0 or (user_input.child_age_months is not None and user_input.child_age_months <= max_child_age * 12) or user_input.age <= max_child_age:
                matched.append(f"Child & adolescent care: Targets children and youth under {max_child_age} years")
            else:
                unmatched.append(f"Target group: Specifically for infants, children, and youth (<= {max_child_age} yrs)")

        if requires_disability:
            if user_input.has_disability:
                matched.append("Disability criterion: Certified person with disabilities")
            else:
                unmatched.append("Target group: Requires verified disability status (PwD)")

        # 7. Healthcare Condition / Need Match
        conditions = [c.strip().lower() for c in healthcare_conditions.split(",") if c.strip()]
        req = (user_input.healthcare_requirement or "").lower()
        
        condition_match = False
        for c in conditions:
            if c in req or req in c or ("hospitalization" in c and user_input.hospitalization_needed):
                condition_match = True
                break
        
        if condition_match:
            matched.append(f"Healthcare need: Covers {user_input.healthcare_requirement}")
        elif healthcare_conditions:
            caveats.append(f"Scheme coverage includes {healthcare_conditions}; check if your required treatment is listed")

        # Final Caveats & Disclaimers
        if rule.verification_caveat_template:
            caveats.append(rule.verification_caveat_template)
        else:
            caveats.append("Final entitlement requires verification at empanelled hospital helpdesk / CSC portal")

        # Determine Final Status
        if len(unmatched) == 0:
            status = "ELIGIBLE"
            summary = f"You satisfy the primary criteria for {scheme.name}."
        elif len(unmatched) == 1 and not state_match:
            status = "NOT_ELIGIBLE"
            summary = f"Not eligible due to geographical availability ({unmatched[0]})."
        elif len(unmatched) <= 2 and all("target group" in u.lower() or "bpl" in u.lower() for u in unmatched):
            status = "POTENTIALLY_ELIGIBLE"
            summary = f"Potentially eligible for {scheme.name} pending verification of category/deprivation status."
        elif len(unmatched) > 0 and (not state_match or any("gender restriction" in u.lower() or "age mismatch" in u.lower() for u in unmatched)):
            status = "NOT_ELIGIBLE"
            summary = f"Does not meet primary eligibility requirements for {scheme.name}."
        else:
            status = "POTENTIALLY_ELIGIBLE"
            summary = f"May qualify for {scheme.name} subject to specific scheme conditions."

        return RuleEvaluationDetail(
            status=status,
            matched_criteria=matched,
            unmatched_criteria=unmatched,
            verification_caveats=caveats,
            summary=summary
        )
