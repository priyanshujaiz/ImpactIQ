from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from models.request_models import ZoneRequest
from routes.zone_routes import router as zone_router
from routes.optimizer_routes import router as optimizer_router
from routes.volunteer_routes import router as volunteer_router
from routes.simulation_routes import router as simulation_router

app=FastAPI()

# Allow cross-origin requests from the backend (and frontend if needed)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 🔒 Restrict to your backend domain in production for extra security
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message":"root api"}

@app.get("/health")
def health():
    return {"status":"ok"}

@app.post("/test/zones")
def test_zones(data: ZoneRequest):
    return data

app.include_router(zone_router, prefix="/engine")
app.include_router(optimizer_router, prefix="/engine")
app.include_router(volunteer_router, prefix="/engine")
app.include_router(simulation_router, prefix="/engine")

