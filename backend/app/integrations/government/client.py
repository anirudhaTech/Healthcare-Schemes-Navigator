import httpx
import logging
from typing import Optional, Dict, Any

logger = logging.getLogger("healthcare_navigator.integrations")

class GovernmentAPIClient:
    """
    Robust HTTP client for external government datasets and portals.
    Supports timeout, retry configuration, and graceful error handling.
    """
    def __init__(self, base_url: Optional[str] = None, timeout_seconds: float = 10.0, max_retries: int = 3):
        self.base_url = base_url or ""
        self.timeout = timeout_seconds
        self.max_retries = max_retries
        self.headers = {
            "User-Agent": "ArogyaNav-Healthcare-Navigator/1.0 (Public Interest Healthcare Discovery)",
            "Accept": "application/json, text/plain, */*",
        }

    async def get_dataset(self, endpoint_url: str, params: Optional[Dict[str, Any]] = None) -> Optional[Dict[str, Any]]:
        target_url = endpoint_url if endpoint_url.startswith("http") else f"{self.base_url}{endpoint_url}"
        
        for attempt in range(1, self.max_retries + 1):
            try:
                async with httpx.AsyncClient(timeout=self.timeout, headers=self.headers, follow_redirects=True) as client:
                    response = await client.get(target_url, params=params)
                    if response.status_code == 200:
                        try:
                            return response.json()
                        except Exception:
                            return {"text": response.text, "status_code": 200}
                    else:
                        logger.warning(f"Government portal returned HTTP {response.status_code} for {target_url}")
            except httpx.RequestError as exc:
                logger.warning(f"Attempt {attempt}/{self.max_retries} failed for {target_url}: {exc}")
        
        logger.error(f"Failed to fetch government dataset from {target_url} after {self.max_retries} attempts.")
        return None
