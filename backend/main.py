from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from backend.routers import operacje
from database import engine, get_session, Base
import models
import schemas
from datetime import datetime


############################
#  --  WAŻNE - początek: ---
# po przeniesiu endpointów do routers odkomentować:
############################

# from fastapi import FastAPI
# from database import engine, Base
# froom routers import operacje 



# Automatyczne tworzenie tabel w bazie Postgres przy starcie aplikacji
# sprawdzenie pliku models.py i tworzenie tabel, jeśli jeszcze nie istnieją

# Base.metadata.create_all(bind=engine)

# app = FastAPI(
#     title="SzwagiAIR API",
#     description="System zarządzania liniami lotniczymi SzwagiAIR"
#     )

# podpięcie routera z operacjami do main.py: (Moduł mój - Mateusz)

# app.include_router(operacje.router) 


# (...)

############################
#  ---  WAŻNE - koniec: ----
############################







# Automatyczne tworzenie tabel w bazie Postgres przy starcie aplikacji
# sprawdzenie pliku models.py i tworzenie tabel, jeśli jeszcze nie istnieją

Base.metadata.create_all(bind=engine)

app = FastAPI(title="SzwagiAIR API")

# ==========================================
# MODUŁ OPERACYJNY
# ==========================================

# --- LOTNISKA ---
@app.get("/lotniska")
def pobierz_lotniska(db: Session = Depends(get_session)):
    """Zwraca listę wszystkich lotnisk w bazie."""
    return db.query(models.Lotnisko).all()

@app.post("/lotniska")
def dodaj_lotnisko(kod: str, miasto: str, kraj: str, db: Session = Depends(get_session)):
    nowe_lotnisko = models.Lotnisko(kod=kod, miasto=miasto, kraj=kraj)
    db.add(nowe_lotnisko)
    db.commit()  # fizyczne zapisanie do bazy PostgreSQL
    db.refresh(nowe_lotnisko) # Pobiera ID nadane przez bazę
    return {"status": "Sukces!", "dodano": nowe_lotnisko}

# --- SAMOLOTY ---
@app.get("/samoloty")
def pobierz_samoloty(db: Session = Depends(get_session)):
    """Pobiera listę wszystkich samolotów."""
    return db.query(models.Samolot).all()

@app.post("/samoloty")
def dodaj_samolot(samolot: schemas.SamolotCreate, db: Session = Depends(get_session)):
    """Dodaje nowy samolot do floty."""
    nowy_samolot = models.Samolot(**samolot.model_dump())
    db.add(nowy_samolot)
    db.commit()
    db.refresh(nowy_samolot)
    return nowy_samolot

# --- LOTY ---
@app.get("/loty")
def pobierz_loty(db: Session = Depends(get_session)):
    """Pobiera listę wszystkich zaplanowanych lotów."""
    return db.query(models.Loty).all()

@app.post("/loty")
def dodaj_lot(lot: schemas.LotCreate, db: Session = Depends(get_session)):
    """Tworzy nowy lot (wymaga podania istniejących ID samolotu i lotnisk)."""
    nowy_lot = models.Loty(**lot.model_dump())
    db.add(nowy_lot)
    db.commit()
    db.refresh(nowy_lot)
    return nowy_lot

# ==========================================
# MODUŁ SPRZEDAŻOWY
# ==========================================

# --- PASAŻEROWIE ---
@app.get("/pasazerowie")
def pobierz_pasazerow(db: Session = Depends(get_session)):
    return db.query(models.Pasazer).all()

@app.post("/pasazerowie")
def dodaj_pasazera(pasazer: schemas.PasazerCreate, db: Session = Depends(get_session)):
    nowy_pasazer = models.Pasazer(**pasazer.model_dump())
    db.add(nowy_pasazer)
    db.commit()
    db.refresh(nowy_pasazer)
    return nowy_pasazer

# --- REZERWACJE ---
@app.get("/rezerwacje")
def pobierz_rezerwacje(db: Session = Depends(get_session)):
    return db.query(models.Rezerwacja).all()

@app.post("/rezerwacje")
def utworz_rezerwacje(rezerwacja: schemas.RezerwacjaCreate, db: Session = Depends(get_session)):
    # Zabezpieczenie: Sprawdź czy pasażer z takim ID w ogóle istnieje
    pasazer_istnieje = db.query(models.Pasazer).filter(models.Pasazer.id == rezerwacja.id_pasazera).first()
    if not pasazer_istnieje:
        raise HTTPException(status_code=404, detail="Pasażer o podanym ID nie istnieje!")
        
    nowa_rezerwacja = models.Rezerwacja(**rezerwacja.model_dump())
    db.add(nowa_rezerwacja)
    db.commit()
    db.refresh(nowa_rezerwacja)
    return nowa_rezerwacja

# --- ODCINKI REZERWACJI ---
@app.post("/odcinki-rezerwacji")
def dodaj_lot_do_rezerwacji(odcinek: schemas.OdcinekRezerwacjiCreate, db: Session = Depends(get_session)):
    nowy_odcinek = models.OdcinekRezerwacji(**odcinek.model_dump())
    db.add(nowy_odcinek)
    db.commit()
    db.refresh(nowy_odcinek)
    return nowy_odcinek

# --- PŁATNOŚCI ---
@app.post("/platnosci")
def zarejestruj_platnosc(platnosc: schemas.PlatnoscCreate, db: Session = Depends(get_session)):
    nowa_platnosc = models.Platnosc(**platnosc.model_dump())
    db.add(nowa_platnosc)
    
    # Logika biznesowa: jeśli płatność zakończona, zaktualizuj status rezerwacji
    if nowa_platnosc.status_transakcji == "zakonczona":
        rezerwacja = db.query(models.Rezerwacja).filter(models.Rezerwacja.id == platnosc.id_rezerwacji).first()
        if rezerwacja:
            rezerwacja.status = "oplacona"
            
    db.commit()
    db.refresh(nowa_platnosc)
    return nowa_platnosc


# start serwera:
# cd .\backend\
# docker compose up -d 
#  uvicorn main:app --reload

# adres: http://127.0.0.1:8000/docs

#stop serwera:
# ctrl + c
# docker compose down