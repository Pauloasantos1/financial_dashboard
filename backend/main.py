from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5173", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.get("/hello")
def health_check(name: str = "world"):
    return {"message": f"Hello, {name}!"}

@app.get("/data")
def read_data():
    return {"message": "Hello from /data endpoint!"}


