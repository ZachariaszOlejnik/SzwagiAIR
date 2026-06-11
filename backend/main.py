# IMPORT DLA DOTENV (muszą być wczesnmiej niż importy engine i sessionlocal):
# teraz dam 'from dotenv import load_dotenv', a w kolejnych plkiach juz używamy tylko 'import os'
from dotenv import load_dotenv

# 1. Ładowanie zmiennych z pliku .env do pamieci systemu
load_dotenv()





from fastapi import FastAPI
from database import engine, Base

from fastapi.middleware.cors import CORSMiddleware # połączenie z frontendem (CORS)

# Import routerów z folderu routers/
from routers.operacje import router as operacje_router # moduł operacji na danych (CRUD) - dodawanie, edycja, usuwanie, pobieranie danych z bazy: lotniska, samoloty, siatka lotów
from routers.sprzedaz import router as sprzedaz_router # moduł sprzedaży biletów : rezerwacje, płatności, koszyk, raporty
from routers.autoryzacja import router as autoryzacja_router # logowanie i wystawianie tokenów JWT

import models  #import potrzebny, żeby SQLAlchemy "zobaczył" modele - żeby wiedział że nasze 13 tabel istnieje zanim je spróbujemy utworzyć
 


# Tworzymy tabele w bazie przy starcie aplikacji.
# My nie używamy Alembica, więc create_all() generuje tabele za nas.
Base.metadata.create_all(bind=engine)
 
app = FastAPI(
    title="SzwagiAIR API",
    description="System zarządzania liniami lotniczymi SzwagiAIR"
)
 

# Konfiguracja CORS (Cross-Origin Resource Sharing)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],        # zezwalamy na każde źródło
    allow_credentials=False,    # nie zezwalamy na przesyłanie ciasteczek (nie potrzebujemy tego w tym projekcie)
    allow_methods=["*"],        # GET, POST, PUT, DELETE, ...
    allow_headers=["*"],        # Content-Type, Authorization, ...
)


# Podpięcie routerów - każdy moduł ma własny plik w folderze routers/
app.include_router(operacje_router)
app.include_router(sprzedaz_router)
app.include_router(autoryzacja_router)  # podpiąłem logowanie
 
 


# ==========================================
# URUCHAMIANIE
# ==========================================

# 1. AKTYWACJA ŚRODOWISKA WIRTUALNEGO (w głównym foldrze):
# .\szwagiAIR - lokalizacja projektu

# .\venv\Scripts\activate

# 2. start serwera (folder backend):
#   cd .\backend\
#   docker compose up -d
#   uvicorn main:app --reload

#wypelnienie bazy danymi testowymi (folder backend):
#   python seed.py


# adres: http://127.0.0.1:8000/docs

# 3. Zatrzymanie serwera:
# stop serwera:
#   ctrl + c
#   docker compose down