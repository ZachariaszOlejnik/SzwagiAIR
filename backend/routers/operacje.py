from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_session
import models
import schemas

# router pozwala na grupowanie endpointów (np. wszystkie operacje na lotach) w jednym miejscu, a potem podpinamy je do głównej aplikacji FastAPI w main.py
router = APIRouter(
    prefix="/operacje",
    tags=["Moduł operacyjny (Loty, Samoloty, Lotniska)"]
) 

# schemat działania:
# 1. zamiana: @app.get na @router.get, endpointy przeniesione do operacje.py
# 2. dodanie: @router.get("/lotniska", response_model = List[schemas.LotniskoResponse])
# 3. metody POST: zamiana obiektu Pydantic na SQLAlchemy(models) --> **obiekt.model_dump().
# 4. zwracamy czysty obiekt np. return nowe_lotnisko
# 5. podpięcie routera do main.py:  app.include_router(operacje.router)


# --- LOTNISKA ---
@router.get("/lotniska", response_model = list[schemas.LotniskoResponse])           
def pobierz_lotniska(db: Session = Depends(get_session)):
    """Zwraca listę wszystkich lotnisk w bazie."""
    return db.query(models.Lotnisko).all()

@router.post("/lotniska", response_model=schemas.LotniskoResponse)
def dodaj_lotnisko(lotnisko: schemas.LotniskoCreate, db: Session = Depends(get_session)):
    nowe_lotnisko = models.Lotnisko(**lotnisko.model_dump()) # zamiana Pydantic -> SQLAlchemy
    db.add(nowe_lotnisko)
    db.commit()  # fizyczne zapisanie do bazy PostgreSQL
    db.refresh(nowe_lotnisko) # Pobiera ID nadane przez bazę

    # zwracamy sam obiekt, LotniskoResponse zrobi konwersję SQLAlchemy -> Pydantic -> JSON dla klienta
    return nowe_lotnisko


# --- SAMOLOTY ---

# (...)

# --- LOTY ---

# (...)

# --- PRACOWNICY ---

# (...)

# --- HARMONOGRAM ZAŁOGI ---

# (...)
