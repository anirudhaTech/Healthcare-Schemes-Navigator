import uuid
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.models.scheme import Scheme
from app.models.chat import ChatSession, ChatMessage
from app.schemas.chat import ChatQuery, ChatResponse
from app.schemas.scheme import SchemeOut

class ChatService:
    """
    Healthcare Schemes AI Assistant.
    Provides verified informational guidance regarding Indian public health schemes, eligibility criteria,
    documents needed, and application steps.
    """

    @classmethod
    def process_query(cls, db: Session, query: ChatQuery, user_id: Optional[int] = None) -> ChatResponse:
        # Resolve or create chat session
        session_uuid = query.session_uuid or str(uuid.uuid4())
        session = db.query(ChatSession).filter(ChatSession.session_uuid == session_uuid).first()
        if not session:
            session = ChatSession(
                session_uuid=session_uuid,
                user_id=user_id,
                title=query.message[:60] + "..." if len(query.message) > 60 else query.message
            )
            db.add(session)
            db.commit()
            db.refresh(session)

        # Save user message
        user_msg = ChatMessage(
            session_id=session.id,
            sender="user",
            content=query.message
        )
        db.add(user_msg)
        db.commit()

        # Knowledge Base Query & Matching
        q_lower = query.message.lower()
        matched_schemes = cls._find_relevant_schemes(db, q_lower)
        response_text, suggested_followups = cls._generate_reply(q_lower, matched_schemes)

        # Save assistant message
        asst_msg = ChatMessage(
            session_id=session.id,
            sender="assistant",
            content=response_text
        )
        db.add(asst_msg)
        db.commit()

        return ChatResponse(
            session_uuid=session_uuid,
            message=response_text,
            relevant_schemes=[SchemeOut.model_validate(s) for s in matched_schemes[:3]],
            suggested_followups=suggested_followups
        )

    @classmethod
    def _find_relevant_schemes(cls, db: Session, query: str) -> List[Scheme]:
        keywords = query.split()
        schemes = db.query(Scheme).filter(Scheme.is_active == True).all()
        scored: List[tuple[Scheme, int]] = []

        for s in schemes:
            score = 0
            text_corpus = f"{s.name} {s.short_description} {s.long_description} {s.target_population} {s.states_covered}".lower()
            
            # Direct name/slug hit
            if s.slug.lower() in query or s.name.lower() in query:
                score += 20

            # Healthcare keywords
            if any(k in query for k in ["surgery", "hospital", "hospitalization", "operation", "admit"]) and s.cashless:
                score += 10
            if any(k in query for k in ["pregnant", "pregnancy", "delivery", "maternal", "mother"]) and ("matritva" in text_corpus or "janani" in text_corpus or "pregnancy" in text_corpus):
                score += 15
            if any(k in query for k in ["child", "baby", "infant", "pediatric", "school"]) and ("bal" in text_corpus or "kishor" in text_corpus or "child" in text_corpus):
                score += 15
            if any(k in query for k in ["maharashtra", "mumbai", "pune", "kolhapur"]) and "maharashtra" in text_corpus:
                score += 12
            if any(k in query for k in ["document", "card", "aadhaar", "ration"]):
                score += 5

            for word in keywords:
                if len(word) > 3 and word in text_corpus:
                    score += 2

            if score > 0:
                scored.append((s, score))

        scored.sort(key=lambda x: x[1], reverse=True)
        return [s[0] for s in scored]

    @classmethod
    def _generate_reply(cls, query: str, matched_schemes: List[Scheme]) -> tuple[str, List[str]]:
        followups = [
            "What documents are required for PM-JAY?",
            "How do I find empanelled hospitals near me?",
            "What schemes cover maternal and child delivery?",
            "How does scheme eligibility checking work?"
        ]

        if "document" in query or "documents" in query:
            if matched_schemes:
                s = matched_schemes[0]
                docs = [d.name for d in s.documents] if s.documents else ["Aadhaar Card", "Ration Card", "Income Certificate"]
                doc_list = "\n".join([f"• **{d}**" for d in docs])
                return (
                    f"### Required Documents for {s.name}\n\n"
                    f"To apply or seek benefits under **{s.name}**, you generally need the following documents:\n\n"
                    f"{doc_list}\n\n"
                    f"📌 **Application Mode**: {s.application_mode}\n"
                    f"🌐 **Official Portal**: [{s.official_website}]({s.official_website})\n"
                    f"📞 **National Helpline**: `{s.helpline}`\n\n"
                    f"> *Tip: Ensure your Aadhaar card is linked to your active mobile number for smooth verification.*",
                    [f"Find hospitals accepting {s.name}", "How to check eligibility?", "Compare with other schemes"]
                )
            else:
                return (
                    "### General Documents Required for Indian Healthcare Schemes\n\n"
                    "Most central and state healthcare schemes require:\n"
                    "1. **Identity Proof**: Aadhaar Card, Voter ID, or ABHA ID (Ayushman Bharat Health Account)\n"
                    "2. **Socioeconomic Proof**: Ration Card (BPL/AAY/PHH) or State Income Certificate\n"
                    "3. **Residence Proof**: Domicile Certificate or Utility Bill\n"
                    "4. **Medical Records**: Doctor's referral or prescription for hospitalization\n\n"
                    "Would you like document details for a specific scheme such as **PM-JAY** or **MJPJAY**?",
                    followups
                )

        if any(w in query for w in ["hospital", "hospitalization", "admit", "surgery", "expensive"]):
            if matched_schemes:
                top = matched_schemes[0]
                return (
                    f"### Hospitalization & Surgical Coverage: {top.name}\n\n"
                    f"**{top.name}** provides coverage of **{top.coverage_amount}** with cashless hospitalization at all empanelled public and private hospitals across {top.states_covered}.\n\n"
                    f"**Key Highlights:**\n"
                    f"• Secondary and tertiary care inpatient coverage\n"
                    f"• Covers pre-hospitalization (up to 3 days) and post-hospitalization (up to 15 days) expenses\n"
                    f"• Dedicated Ayushman Mitra helpdesks available at empanelled hospitals\n\n"
                    f"You can use our **Find Hospitals Near You** navigator to locate verified empanelled hospitals in your district!",
                    ["Find empanelled hospitals nearby", "What are the eligibility criteria?", "Compare PM-JAY and MJPJAY"]
                )

        if any(w in query for w in ["pregnant", "pregnancy", "delivery", "maternal", "mother"]):
            return (
                "### Maternal & Child Healthcare Schemes in India\n\n"
                "Here are the primary government schemes supporting pregnancy, institutional delivery, and maternal nutrition:\n\n"
                "1. **Pradhan Mantri Surakshit Matritva Abhiyan (PMSMA)**: Free antenatal check-ups on the 9th of every month by medical specialists.\n"
                "2. **Janani Suraksha Yojana (JSY)**: Cash assistance of ₹1,400 (rural) / ₹1,000 (urban) promoting safe institutional deliveries.\n"
                "3. **Ayushman Bharat PM-JAY**: Comprehensive coverage for high-risk obstetric surgeries and maternal care.\n\n"
                "Would you like to check your eligibility for maternal assistance?",
                ["Check maternal scheme eligibility", "PMSMA details", "Janani Suraksha Yojana benefits"]
            )

        if matched_schemes:
            top = matched_schemes[0]
            benefits_snippet = "\n".join([f"• **{b.title}**: {b.description}" for b in top.benefits[:3]]) if top.benefits else f"• {top.short_description}"
            return (
                f"### {top.name}\n\n"
                f"{top.long_description}\n\n"
                f"**Coverage & Benefits:**\n"
                f"{benefits_snippet}\n\n"
                f"• **Target Group**: {top.target_population}\n"
                f"• **Coverage Amount**: {top.coverage_amount}\n"
                f"• **States Covered**: {top.states_covered}\n"
                f"• **Official Source**: {top.official_source} (Verified: {top.last_verified_date})\n\n"
                f"You can run an automated eligibility check or find empanelled hospitals providing this scheme in your area.",
                [f"Check my eligibility for {top.name}", f"Hospitals for {top.name}", "Compare with other schemes"]
            )

        return (
            "### Hello! I am your Healthcare Schemes Assistant 🏥\n\n"
            "I can help you navigate Indian central and state government healthcare benefits, understand eligibility requirements, prepare application documents, and find nearby empanelled hospitals.\n\n"
            "**You can ask me questions like:**\n"
            "• *'Which scheme covers heart surgery or cancer treatment?'*\n"
            "• *'What are the eligibility conditions for Ayushman Bharat PM-JAY?'*\n"
            "• *'Which schemes are available for pregnant women in Maharashtra?'*\n"
            "• *'What documents do I need to carry to the hospital?'*",
            followups
        )
