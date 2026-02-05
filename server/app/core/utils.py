def clean_json_response(text: str) -> str:
    if not text:
        return "{}"
    # Remove markdown code blocks
    cleaned = text.replace('```json', '').replace('```', '')
    return cleaned.strip()
