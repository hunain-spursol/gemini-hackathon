from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api.routes import chat, docs

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router, prefix="/api")
app.include_router(docs.router, prefix="/api/docs")
