import numpy as np
from typing import List, Dict, Any

class SchemeMLRankingPipeline:
    """
    Modular ML feature engineering and ranking demonstration pipeline.
    Transforms user socioeconomic vector + scheme attributes into an explainable similarity score.
    """

    @staticmethod
    def extract_user_feature_vector(user_data: Dict[str, Any]) -> np.ndarray:
        """
        Extract numerical and one-hot encoded vector representing user state:
        [normalized_age, gender_enc, normalized_income, bpl_flag, disability_flag,
         hospitalization_flag, pregnant_flag, child_flag]
        """
        age = float(user_data.get("age", 30)) / 100.0
        gender_val = 1.0 if user_data.get("gender", "").lower() == "female" else 0.0
        income = min(1.0, float(user_data.get("annual_income", 0)) / 1000000.0)
        bpl = 1.0 if user_data.get("bpl_status", False) else 0.0
        disability = 1.0 if user_data.get("has_disability", False) else 0.0
        hosp = 1.0 if user_data.get("hospitalization_needed", False) else 0.0
        preg = 1.0 if user_data.get("is_pregnant", False) else 0.0
        child = 1.0 if (user_data.get("children_count", 0) > 0 or user_data.get("age", 30) <= 18) else 0.0

        return np.array([age, gender_val, income, bpl, disability, hosp, preg, child], dtype=np.float32)

    @staticmethod
    def compute_cosine_affinity(user_vec: np.ndarray, scheme_profile_vec: np.ndarray) -> float:
        """
        Cosine similarity between user needs and scheme target profile.
        """
        norm_u = np.linalg.norm(user_vec)
        norm_s = np.linalg.norm(scheme_profile_vec)
        if norm_u == 0 or norm_s == 0:
            return 0.5
        dot = np.dot(user_vec, scheme_profile_vec)
        sim = float(dot / (norm_u * norm_s))
        return max(0.0, min(1.0, (sim + 1.0) / 2.0))
