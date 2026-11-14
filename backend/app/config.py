import os
from pathlib import Path

# Set writable matplotlib config dir
os.environ.setdefault("MPLCONFIGDIR", "/tmp/matplotlib")

class Settings:
    PROJECT_NAME: str = "SPHEREx Cosmic Discovery Platform API"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    
    # NASA / IPAC IRSA endpoints
    IRSA_BASE_URL: str = "https://irsa.ipac.caltech.edu"
    IRSA_SIA_URL: str = "https://irsa.ipac.caltech.edu/SIA"
    IRSA_TAP_URL: str = "https://irsa.ipac.caltech.edu/TAP"
    IRSA_SIA2_URL: str = "https://irsa.ipac.caltech.edu/SIA2"
    
    # Paths & Storage
    BASE_DIR: Path = Path(__file__).resolve().parent.parent
    DATA_DIR: Path = BASE_DIR / "data"
    CACHE_DIR: Path = DATA_DIR / "cache"
    FITS_CACHE_DIR: Path = CACHE_DIR / "fits"
    PREVIEW_CACHE_DIR: Path = CACHE_DIR / "previews"
    QUERY_CACHE_DIR: Path = CACHE_DIR / "queries"
    
    # CORS
    CORS_ORIGINS: list = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "*"
    ]
    
    # Supabase (optional persistent storage)
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")

settings = Settings()

# Ensure directories exist
settings.FITS_CACHE_DIR.mkdir(parents=True, exist_ok=True)
settings.PREVIEW_CACHE_DIR.mkdir(parents=True, exist_ok=True)
settings.QUERY_CACHE_DIR.mkdir(parents=True, exist_ok=True)
