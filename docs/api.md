# REST API Documentation — Healthcare Schemes Navigator

Base URL: `http://localhost:8000/api`

Interactive OpenAPI / Swagger UI: `http://localhost:8000/docs`

---

## 1. Authentication Endpoints

### `POST /auth/register`
Creates a new citizen account.
- **Request Body**: `{ "full_name": "...", "email": "...", "mobile": "...", "password": "..." }`
- **Response**: `{ "access_token": "...", "token_type": "bearer", "role": "user", ... }`

### `POST /auth/login`
Authenticates a user or administrator.
- **Request Body**: `{ "email": "...", "password": "..." }`
- **Response**: `{ "access_token": "...", "token_type": "bearer", "role": "user"|"admin", ... }`

### `GET /auth/me`
Retrieves currently authenticated user profile. (Bearer Token required).

---

## 2. Scheme Endpoints

### `GET /schemes`
Lists all active government healthcare schemes with multi-parameter filtering.
- **Query Parameters**:
  - `search`: Keyword in scheme name or description.
  - `state`: Filter by state coverage (e.g. `Maharashtra`).
  - `category`: Healthcare category (e.g. `Hospitalization`, `Maternal`, `Child`).
  - `scheme_type`: `Central` or `State`.
  - `featured_only`: `true` or `false`.

### `GET /schemes/{id_or_slug}`
Retrieves complete scheme details including eligibility rules, benefits, documents, and empanelled hospitals count.

### `POST /schemes/{scheme_id}/save`
Bookmarks a scheme to the user's dashboard.

### `DELETE /schemes/{scheme_id}/save`
Removes a scheme from bookmarks.

---

## 3. Eligibility & AI Recommendation

### `POST /eligibility/check`
Evaluates citizen input against all active schemes and returns ranked recommendations with score breakdowns and explainable factors.
- **Request Body**:
  ```json
  {
    "age": 62,
    "gender": "Male",
    "marital_status": "Married",
    "state": "Maharashtra",
    "district": "Kolhapur",
    "taluka": "Karvir",
    "annual_income": 120000.0,
    "bpl_status": true,
    "ration_card_type": "BPL / Yellow",
    "social_category": "OBC",
    "family_size": 4,
    "healthcare_requirement": "Hospitalization",
    "hospitalization_needed": true
  }
  ```
- **Response**:
  ```json
  {
    "total_schemes_evaluated": 8,
    "eligible_count": 2,
    "potentially_eligible_count": 3,
    "recommendations": [
      {
        "scheme": { "slug": "pm-jay", "name": "Ayushman Bharat PM-JAY", ... },
        "eligibility_status": "ELIGIBLE",
        "match_score": 92.0,
        "match_level": "Highly Recommended",
        "why_recommended": [
          "✓ Satisfies core demographic and statutory eligibility rules",
          "✓ Tailored for your healthcare need: Hospitalization",
          "✓ Cashless treatment benefit up to ₹5,00,000 per family per year"
        ],
        "verification_warning": "Beneficiary must be listed in SECC / NFSA database with BPL ration card."
      }
    ],
    "disclaimer": "..."
  }
  ```

---

## 4. Location-Based Hospital & Scheme Navigator

### `GET /hospitals`
Searches verified hospitals by state, district, taluka, PIN, scheme empanelment, or GPS coordinates with distance computation.
- **Query Parameters**:
  - `state`: e.g. `Maharashtra`
  - `district`: e.g. `Kolhapur`
  - `taluka`: e.g. `Karvir`
  - `scheme_slug`: e.g. `pm-jay`
  - `hospital_type`: e.g. `Government Hospital`
  - `has_emergency`: `true` / `false`
  - `user_lat` & `user_lng`: GPS coordinates for distance calculation
  - `max_distance_km`: Radius in km (defaults to 100km)

### `GET /hospitals/{hospital_id}`
Retrieves complete hospital profile, specialties, facilities, contact info, and bidirectional list of available government healthcare schemes.

### `GET /hospitals/by-scheme/{scheme_slug}`
Finds all hospitals empanelled for a specific scheme in a region.

---

## 5. Location Hierarchy

### `GET /locations/hierarchy`
Returns full nested state → district → taluka tree for instant cascading dropdowns.

### `GET /locations/states`
Returns all states.

### `GET /locations/states/{state_name}/districts`
Returns districts in a state.

### `GET /locations/districts/{district_name}/talukas`
Returns talukas in a district with coordinates and PIN codes.

---

## 6. Comparison Matrix

### `POST /compare`
Generates a side-by-side comparison matrix for 2 to 4 schemes.
- **Request Body**: `{ "scheme_ids": [1, 2, 3] }`

---

## 7. AI Scheme Assistant

### `POST /chat`
Answers citizen queries with scheme knowledge retrieval and suggested follow-ups.
- **Request Body**: `{ "message": "What documents are needed for PM-JAY?", "session_uuid": "..." }`

---

## 8. Admin Portal

### `GET /admin/analytics`
Returns aggregate statistics, top recommended schemes, popular healthcare categories, and recent evaluation trends.

### `POST /admin/schemes`
Creates a new government healthcare scheme and statutory eligibility rule.

### `DELETE /admin/schemes/{scheme_id}`
Deactivates a scheme.

### `POST /admin/hospitals/import-csv`
Uploads and parses a CSV of empanelled hospitals with schema validation.
