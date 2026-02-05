from fastapi import HTTPException

def handle_gemini_error(e: Exception):
    error_str = str(e)
    print(f"Gemini Error: {error_str}")
    if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str:
        raise HTTPException(status_code=429, detail="Gemini API quota exceeded. Please try again later.")
    elif "400" in error_str or "INVALID_ARGUMENT" in error_str:
         raise HTTPException(status_code=400, detail=f"Invalid argument: {error_str}")
    raise HTTPException(status_code=500, detail=f"Internal Server Error: {error_str}")
