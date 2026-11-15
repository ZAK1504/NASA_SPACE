import os
from pathlib import Path
from dotenv import load_dotenv

# Set writable matplotlib config dir
os.environ.setdefault("MPLCONFIGDIR", "/tmp/matplotlib")

# Load environment variables from .env if present
BASE_DIR_ENV = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR_ENV / ".env")

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
    DATA_DIR: Path = (
        Path(os.environ["SPHEREXPLORE_DATA_DIR"]).resolve()
        if os.getenv("SPHEREXPLORE_DATA_DIR", "").strip()
        else BASE_DIR / "data"
    )
    CACHE_DIR: Path = DATA_DIR / "cache"
    FITS_CACHE_DIR: Path = CACHE_DIR / "fits"
    PREVIEW_CACHE_DIR: Path = CACHE_DIR / "previews"
    QUERY_CACHE_DIR: Path = CACHE_DIR / "queries"
    HIPS_CACHE_DIR: Path = CACHE_DIR / "hips"
    MANIFESTS_DIR: Path = DATA_DIR / "manifests"
    JOURNAL_DIR: Path = DATA_DIR / "journal"
    COPILOT_DB_PATH: Path = DATA_DIR / "copilot_budget.db"
    
    # CORS
    CORS_ORIGINS: list = (
        [o.strip() for o in os.getenv("CORS_ORIGINS").split(",") if o.strip()]
        if os.getenv("CORS_ORIGINS", "").strip()
        else [
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:3000",
            "https://spherexplore.earth",
            "https://www.spherexplore.earth",
        ]
    )
    
    # Supabase (optional persistent storage)
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")

    # Cosmic Copilot AI Configuration (Groq LLM)
    COSMIC_AI_ENABLED: bool = os.getenv("COSMIC_AI_ENABLED", "true").lower() in ("true", "1", "yes")
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    GROQ_MODEL: str = os.getenv("GROQ_MODEL", "openai/gpt-oss-20b")
    COSMIC_AI_MAX_OUTPUT_TOKENS: int = int(os.getenv("COSMIC_AI_MAX_OUTPUT_TOKENS", "700"))
    COSMIC_AI_TIMEOUT_SECONDS: int = int(os.getenv("COSMIC_AI_TIMEOUT_SECONDS", "25"))
    COSMIC_AI_GLOBAL_RPM: int = int(os.getenv("COSMIC_AI_GLOBAL_RPM", "15"))
    COSMIC_AI_GLOBAL_RPD: int = int(os.getenv("COSMIC_AI_GLOBAL_RPD", "300"))
    COSMIC_AI_SESSION_RPM: int = int(os.getenv("COSMIC_AI_SESSION_RPM", "5"))
    COSMIC_AI_SESSION_RPD: int = int(os.getenv("COSMIC_AI_SESSION_RPD", "30"))
    COSMIC_AI_IP_RPM: int = int(os.getenv("COSMIC_AI_IP_RPM", "8"))
    COSMIC_AI_IP_RPD: int = int(os.getenv("COSMIC_AI_IP_RPD", "60"))
    COSMIC_AI_MAX_CONCURRENT: int = int(os.getenv("COSMIC_AI_MAX_CONCURRENT", "2"))
    COSMIC_AI_DAILY_TOKEN_BUDGET: int = int(os.getenv("COSMIC_AI_DAILY_TOKEN_BUDGET", "150000"))

settings = Settings()

# Ensure directories exist
settings.DATA_DIR.mkdir(parents=True, exist_ok=True)
settings.CACHE_DIR.mkdir(parents=True, exist_ok=True)
settings.FITS_CACHE_DIR.mkdir(parents=True, exist_ok=True)
settings.PREVIEW_CACHE_DIR.mkdir(parents=True, exist_ok=True)
settings.QUERY_CACHE_DIR.mkdir(parents=True, exist_ok=True)
settings.HIPS_CACHE_DIR.mkdir(parents=True, exist_ok=True)
settings.MANIFESTS_DIR.mkdir(parents=True, exist_ok=True)
settings.JOURNAL_DIR.mkdir(parents=True, exist_ok=True)
