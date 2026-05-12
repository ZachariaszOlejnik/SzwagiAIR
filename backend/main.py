from fastapi import FastAPI
from database import engine, Base
from routers.operacje import router as operacje_router
from routers.sprzedaz import router as sprzedaz_router
import models  # noqa: F401 - import potrzebny, żeby SQLAlchemy "zobaczył" modele
 
# Tworzymy tabele w bazie przy starcie aplikacji.
# UWAGA: Autor artykułu używa Alembica do migracji i nie potrzebuje tej linii.
# My nie używamy Alembica, więc create_all() generuje tabele za nas.
Base.metadata.create_all(bind=engine)
 
app = FastAPI(
    title="SzwagiAIR API",
    description="System zarządzania liniami lotniczymi SzwagiAIR"
)
 
# Podpięcie routerów - każdy moduł ma własny plik w folderze routers/
app.include_router(operacje_router)
app.include_router(sprzedaz_router)
 
 
# ==========================================
# URUCHAMIANIE
# ==========================================
# start serwera:
#   cd .\backend\
#   docker compose up -d
#   uvicorn main:app --reload
#
# adres: http://127.0.0.1:8000/docs
#
# stop serwera:
#   ctrl + c
#   docker compose down