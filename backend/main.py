from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from typing import List

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5173", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Data Model
class Assets(BaseModel):
    id: int
    asset_type: str
    symbol: str
    quantity: float
    cost_basis: float
    account: str
    
# Mock Data
assets_db: List[Assets] = []


# Routes
@app.get('/assets')
def get_assets():
    return assets_db

@app.post('/assets')
def create_assets(asset: Assets):
    assets_db.append(asset)
    return {"Message": "Asset added succesfully", "asset":asset}

@app.get('/assets/{asset_id}')
def get_asset(asset_id: int):
    for asset in assets_db:
        if asset.id == asset_id:
            return asset
    return {"error" : "Asset not found"}



# Tester routes

@app.get("/hello")
def health_check(name: str = "world"):
    return {"message": f"Hello, {name}!"}

@app.get("/data")
def read_data():
    return {"message": "Hello from /data endpoint!"}






