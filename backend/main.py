from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from database import engine, get_session, Base
import models
import schemas
from datetime import datetime


# Automatyczne tworzenie tabel w bazie Postgres przy starcie aplikacji
# sprawdzenie pliku models.py i tworzenie tabel, jeśli jeszcze nie istnieją

Base.metadata.create_all(bind=engine)

app = FastAPI(title="SzwagiAIR API")

# endpoint do pobierania listy lotnisk:
@app.get("/lotniska")
def pobierz_lotniska(db: Session = Depends(get_session)):
    """Zwraca listę wszystkich lotnisk w bazie."""
    return db.query(models.Lotnisko).all()

# endpoint do dodawania nowego lotniska:

@app.post("/lotniska")
def dodaj_lotnisko(kod: str, miasto: str, kraj: str, db: Session = Depends(get_session)):
    nowe_lotnisko = models.Lotnisko(kod=kod, miasto=miasto, kraj=kraj)
    db.add(nowe_lotnisko)
    db.commit()  # fizyczne zapisanie do bazy PostgreSQL
    db.refresh(nowe_lotnisko) # Pobiera ID nadane przez bazę
    return {"status": "Sukces!", "dodano": nowe_lotnisko}


# endpoint dla samolotów:

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

# endpoint dla lotów:

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


# start serwera:
# cd .\backend\
# docker compose up -d 
#  uvicorn main:app --reload

#stop serwera:
# ctrl + c
# docker compose down