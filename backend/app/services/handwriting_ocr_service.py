from typing import Any, Dict, List

from google.cloud import vision_v1 as vision


class HandwritingOCRService:
    """Google Cloud Vision handwriting OCR adapter.

    The image is sent directly to Vision and is not persisted by this service.
    """

    @staticmethod
    def analyze_image(content: bytes) -> Dict[str, Any]:
        client = vision.ImageAnnotatorClient()
        image = vision.Image(content=content)
        image_context = vision.ImageContext(
            language_hints=["en-t-i0-handwrit"]
        )

        response = client.document_text_detection(
            image=image,
            image_context=image_context,
        )

        if response.error.message:
            raise RuntimeError(response.error.message)

        annotation = response.full_text_annotation
        text = annotation.text.strip() if annotation and annotation.text else ""

        word_confidences: List[float] = []
        if annotation:
            for page in annotation.pages:
                for block in page.blocks:
                    for paragraph in block.paragraphs:
                        for word in paragraph.words:
                            word_confidences.append(float(word.confidence))

        confidence = (
            round(sum(word_confidences) / len(word_confidences), 4)
            if word_confidences
            else None
        )

        return {
            "text": text,
            "confidence": confidence,
            "word_count": len(word_confidences),
        }
