from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_session
import models
import schemas

# Inicjalizacja routera dla modułu sprzedażowego
router = APIRouter(
    prefix="/sprzedaz",
    tags=["Moduł sprzedażowy (Klienci, Rezerwacje, Płatności)"]
)

# ==========================================
# --- PASAŻEROWIE ---
# ==========================================

@router.get("/pasazerowie", response_model=list[schemas.PasazerResponse])
def pobierz_pasazerow(db: Session = Depends(get_session)):
    """Zwraca listę wszystkich pasażerów."""
    return db.query(models.Pasazer).all()

@router.post("/pasazerowie", response_model=schemas.PasazerResponse)
def dodaj_pasazera(pasazer: schemas.PasazerCreate, db: Session = Depends(get_session)):
    """Dodaje nowego pasażera do systemu."""
    nowy_pasazer = models.Pasazer(**pasazer.model_dump())
    db.add(nowy_pasazer)
    db.commit()
    db.refresh(nowy_pasazer)
    return nowy_pasazer


# ==========================================
# --- REZERWACJE ---
# ==========================================

@router.get("/rezerwacje", response_model=list[schemas.RezerwacjaResponse])
def pobierz_rezerwacje(db: Session = Depends(get_session)):
    """Zwraca listę wszystkich rezerwacji w systemie."""
    return db.query(models.Rezerwacja).all()

@router.post("/rezerwacje", response_model=schemas.RezerwacjaResponse)
def utworz_rezerwacje(rezerwacja: schemas.RezerwacjaCreate, db: Session = Depends(get_session)):
    """Tworzy pustą rezerwację dla konkretnego pasażera."""
    # Zabezpieczenie: Sprawdzamy czy pasażer istnieje
    pasazer_istnieje = db.query(models.Pasazer).filter(models.Pasazer.id == rezerwacja.id_pasazera).first()
    if not pasazer_istnieje:
        raise HTTPException(status_code=404, detail="Pasażer o podanym ID nie istnieje!")
        
    nowa_rezerwacja = models.Rezerwacja(**rezerwacja.model_dump())
    db.add(nowa_rezerwacja)
    db.commit()
    db.refresh(nowa_rezerwacja)
    return nowa_rezerwacja

#--- ODCINKI REZERWACJI ---
#--- PŁATNOŚCI (Z LOGIKĄ BIZNESOWĄ) ---