from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from database import get_session
import models

# rejestracja routera
router = APIRouter(
    prefix="/autoryzacja",
    tags=["Moduł autoryzacji (logowanie)"]
)

# ==========================================
# --- LOGOWANIE ---
# ==========================================

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

# ==========================================
# --- REJESTRACJA ---
# ==========================================

# Schema żądania rejestracji - łączy dane Pasażera i Konta w jednym formularzu
class RejestracjaRequest(BaseModel):
    # dane pasażera
    imie: str = Field(..., min_length=2, max_length=50)
    nazwisko: str = Field(..., min_length=2, max_length=50)
    email: str = Field(..., max_length=100)
    telefon: str = Field(..., min_length=9, max_length=20)
    # dane konta logowania
    haslo: str = Field(..., min_length=6, max_length=100, description="Hasło musi mieć min. 6 znaków")
 
 
@router.post("/rejestracja")
def rejestracja(dane: RejestracjaRequest, db: Session = Depends(get_session)):
    """
    Tworzy nowego Pasażera oraz powiązane z nim Konto Użytkownika.
    Login = email pasażera (tymczasowo).
    Rola domyślnie 'pasazer' - administrator jest dodawany ręcznie do bazy.
    """
 
    # 1. Sprawdzamy, czy pasażer z tym emailem już istnieje
    istniejacy_pasazer = db.query(models.Pasazer).filter(models.Pasazer.email == dane.email).first()
    if istniejacy_pasazer:
        raise HTTPException(status_code=400, detail="Pasażer z tym adresem email już istnieje!")
 
    # 2. Sprawdzamy, czy login (== email) nie jest już zajęty w tabeli kont
    istniejace_konto = db.query(models.KontoUzytkownika).filter(models.KontoUzytkownika.login == dane.email).first()
    if istniejace_konto:
        raise HTTPException(status_code=400, detail="Konto z tym loginem już istnieje!")
 
    # 3. Tworzymy najpierw Pasażera (bo konto wymaga id_pasazera jako FK)
    nowy_pasazer = models.Pasazer(
        imie=dane.imie,
        nazwisko=dane.nazwisko,
        email=dane.email,
        telefon=dane.telefon
    )
    db.add(nowy_pasazer)
    db.flush() # wymusza zapis do bazy, ale jeszcze nie commit - mamy ID pasażera
 
    # 4. Tworzymy Konto Użytkownika powiązane z nowym pasażerem
    # UWAGA: hasło zapisywane plaintext (tymczasowo )
    nowe_konto = models.KontoUzytkownika(
        id_pasazera=nowy_pasazer.id,
        login=dane.email, # login = email (uproszczenie)
        haslo_hash=dane.haslo,
        rola_systemowa="pasazer" # domyślnie pasażer
    )
    db.add(nowe_konto)
 
    # 5. Zapisujemy wszystko w jednej transakcji (jak coś pójdzie nie tak - rollback obu)
    db.commit()
    db.refresh(nowy_pasazer)
    db.refresh(nowe_konto)
 
    # 6. Zwracamy dane do frontu (bez hasła)
    return {
        "status": "sukces",
        "wiadomosc": "Konto utworzone pomyślnie. Możesz się teraz zalogować.",
        "id_pasazera": nowy_pasazer.id,
        "login": nowe_konto.login,
        "rola": nowe_konto.rola_systemowa
    }