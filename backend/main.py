from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from database import engine, get_session, Base
import models
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


# dodać endpointy dla samolotów oraz lotów

# start serwera: uvicorn main:app --reload