# Explainable AI/ML Recommendation System

## 1. Recommendation Model Design

In public health navigation, black-box machine learning models are inappropriate because citizens and healthcare providers require **unambiguous, explainable justifications** for why a statutory program was recommended.

ArogyaNav implements a **multi-factor weighted explainable scoring model** coupled with feature vectors and cosine similarity ranking.

---

## 2. Mathematical Scoring Formulation

For any citizen profile vector $\mathbf{u}$ and scheme vector $\mathbf{s}$, the composite recommendation score $S(\mathbf{u}, \mathbf{s}) \in [0, 100]$ is defined as:

$$S(\mathbf{u}, \mathbf{s}) = w_{\text{rule}} S_{\text{rule}} + w_{\text{need}} S_{\text{need}} + w_{\text{demo}} S_{\text{demo}} + w_{\text{loc}} S_{\text{loc}} + w_{\text{socio}} S_{\text{socio}}$$

Where the weights satisfy $\sum w_i = 100$:

| Factor Component | Weight ($w_i$) | Evaluation Logic |
| :--- | :--- | :--- |
| **Statutory Rule Match ($S_{\text{rule}}$)** | **50%** | Full statutory eligibility score from the deterministic engine (1.0 for ELIGIBLE, 0.7 for POTENTIALLY_ELIGIBLE). |
| **Healthcare Need Match ($S_{\text{need}}$)** | **20%** | Direct alignment with immediate medical requirement (e.g. Hospitalization, Maternal care, RBSK pediatric screening, Oncology). |
| **Demographic Resonance ($S_{\text{demo}}$)** | **10%** | Age group alignment (e.g. child 0-18 for RBSK, senior 60+ for PM-JAY senior floater). |
| **Location & Domicile ($S_{\text{loc}}$)** | **10%** | Domicile match for state schemes (e.g. Maharashtra domicile for MJPJAY) or 100% for All-India central schemes. |
| **Socioeconomic Tier ($S_{\text{socio}}$)** | **10%** | Vulnerability boost for BPL / Antyodaya ration cards and low-income brackets. |

---

## 3. Match Levels & Thresholds

- **Highly Recommended (Score $\ge 80\%$)**: Citizen qualifies for primary benefits with highest medical urgency.
- **Good Match (Score $60\% - 79\%$)**: Citizen meets core criteria and stands to gain secondary benefits.
- **Moderate Match (Score $40\% - 59\%$)**: Citizen is partially eligible or program provides auxiliary benefits.
- **Low Match (Score $< 40\%$)**: Limited overlap or high income exclusion.

---

## 4. Explainable Factor Generation

The model outputs structured text reasons for every recommendation:
```json
"why_recommended": [
  "✓ Satisfies core demographic and statutory eligibility rules",
  "✓ Tailored for your healthcare need: Hospitalization",
  "✓ Cashless treatment benefit up to ₹5,00,000 per family per year",
  "✓ Empanelled across public & private hospitals in your district"
]
```
