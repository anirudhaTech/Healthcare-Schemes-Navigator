import logging
from typing import Dict, Any
from app.integrations.government.client import GovernmentAPIClient

logger = logging.getLogger("healthcare_navigator.integrations.pmjay")

class PMJAYConnector:
    """
    National Health Authority (NHA) Ayushman Bharat PM-JAY dataset connector.
    Source: National Health Authority (https://pmjay.gov.in)
    """
    SOURCE_NAME = "Ayushman Bharat PM-JAY Empanelled Registry"
    SOURCE_TYPE = "official_dataset"
    OFFICIAL_URL = "https://pmjay.gov.in"
    ORGANIZATION = "National Health Authority, Ministry of Health & Family Welfare"

    def __init__(self):
        self.client = GovernmentAPIClient(base_url=self.OFFICIAL_URL)

    async def check_status(self) -> Dict[str, Any]:
        """Checks status of PM-JAY portal / dataset."""
        try:
            res = await self.client.get_dataset("/")
            is_active = res is not None
            return {
                "name": self.SOURCE_NAME,
                "organization": self.ORGANIZATION,
                "source_type": self.SOURCE_TYPE,
                "url": self.OFFICIAL_URL,
                "status": "connected" if is_active else "dataset_snapshot",
                "notes": "Official National Health Authority open dataset."
            }
        except Exception as e:
            logger.warning(f"PMJAY connection check failed: {e}")
            return {
                "name": self.SOURCE_NAME,
                "organization": self.ORGANIZATION,
                "source_type": self.SOURCE_TYPE,
                "url": self.OFFICIAL_URL,
                "status": "dataset_snapshot",
                "notes": "Operating on synchronized source snapshot."
            }
