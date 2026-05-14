from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_session
import models

# rejestracja routera
router = APIRouter(
    prefix="/autoryzacja",
    tags=["Moduł autoryzacji (logowanie)"]
)

# proste logowanie (tymczasowe)
class LoginRequest(BaseModel):
    login: str
    haslo: str

@router.post("/login")
def logowanie(dane: LoginRequest, db: Session = Depends(get_session)):
    """Sprawdza dane: login i hasło w bazie (tabela: Konta użytkowników)"""

    # 1. szukamy użytkownika o podanym loginie
    uzytkownik = db.query(models.KontoUzytkownika).filter(models.KontoUzytkownika.login == dane.login).first()

    # 2. sprawdzamy czy użytkownik istnieje
    if not uzytkownik:
        # ogólny komunikat dla bezpieczeństwa
        raise HTTPException(status_code=401, detail="Nieprawidłowy login lub hasło.")
    
    # 3. Sprawdzamy hasło (nie szyfrowane)
    if uzytkownik.haslo_hash != dane.haslo:
        raise HTTPException(status_code=401, detail="Nieprawidłowy login lub hasło.")
    
    # 4. Sukces! Zwracamy dane do frontu
    return {
        "status": "sukces",
        "login": uzytkownik.login,
        "rola": uzytkownik.rola_systemowa
    }

