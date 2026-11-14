import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import (
    objects,
    archive,
    observations,
    processing,
    comparison,
    spectra,
    missions,
    discoveries,
    assistant,
    lightcurves,
    catalogs
)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Scientific citizen-science API connecting to NASA/IPAC IRSA SPHEREx astronomical archive."
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers under /api prefix
app.include_router(objects.router, prefix=settings.API_PREFIX)
app.include_router(archive.router, prefix=settings.API_PREFIX)
app.include_router(observations.router, prefix=settings.API_PREFIX)
app.include_router(processing.router, prefix=settings.API_PREFIX)
app.include_router(comparison.router, prefix=settings.API_PREFIX)
app.include_router(spectra.router, prefix=settings.API_PREFIX)
app.include_router(missions.router, prefix=settings.API_PREFIX)
app.include_router(discoveries.router, prefix=settings.API_PREFIX)
app.include_router(assistant.router, prefix=settings.API_PREFIX)
app.include_router(lightcurves.router, prefix=settings.API_PREFIX)
app.include_router(catalogs.router, prefix=settings.API_PREFIX)

@app.get("/api/health")
def health_check():
    """Health check endpoint indicating server and archive status."""
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "archive_endpoint": settings.IRSA_TAP_URL,
        "cache_directory": str(settings.CACHE_DIR)
    }

@app.get("/")
def root():
    return {
        "message": "Welcome to SPHEREx Cosmic Discovery API",
        "docs_url": "/docs",
        "health_check": "/api/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
