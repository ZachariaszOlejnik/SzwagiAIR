from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from database import get_session
from auth_utils import stworz_token, hashuj_haslo, sprawdz_haslo
import models
 
# rejestracja routera
router = APIRouter(
    prefix="/autoryzacja",
    tags=["Moduł autoryzacji (logowanie i rejestracja)"]
)
 
# ==========================================
# --- LOGOWANIE (JWT + bcrypt) ---
# ==========================================
 
@router.post("/login")
def logowanie(dane: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_session)):
    
    #  szukamy użytkownika
    uzytkownik = db.query(models.KontoUzytkownika).filter(
        models.KontoUzytkownika.login == dane.username
    ).first()
 
    # sprawdzamy istnienie + hasło przez bcrypt
    if not uzytkownik or not sprawdz_haslo(dane.password, uzytkownik.haslo_hash):
        raise HTTPException(
            status_code=401,
            detail="Nieprawidłowy login lub hasło.",
            headers={"WWW-Authenticate": "Bearer"},
        )
 
    #  tworzymy token JWT
    token = stworz_token({
        "sub": uzytkownik.login,
        "rola": uzytkownik.rola_systemowa,
    })
 
    #  zwracamy token 
    return {
        "access_token": token,
        "token_type": "bearer",
        "login": uzytkownik.login,
        "rola": uzytkownik.rola_systemowa,
    }
 
 
# ==========================================
# --- REJESTRACJA (z hashowaniem bcrypt) ---
# ==========================================
 
class RejestracjaRequest(BaseModel):
    imie: str = Field(..., min_length=2, max_length=50)
    nazwisko: str = Field(..., min_length=2, max_length=50)
    email: str = Field(..., max_length=100)
    telefon: str = Field(..., min_length=9, max_length=20)
    haslo: str = Field(..., min_length=6, max_length=100, description="Hasło musi mieć min. 6 znaków")
 
 
@router.post("/rejestracja")
def rejestracja(dane: RejestracjaRequest, db: Session = Depends(get_session)):
    """
    Tworzy nowego Pasażera oraz powiązane z nim Konto Użytkownika.
    Hasło jest HASHOWANE przez bcrypt przed zapisem (hashuj_haslo).
    Login = email pasażera. Rola domyślnie 'pasazer'.
    """
    #  czy pasażer z tym emailem już istnieje?
    istniejacy_pasazer = db.query(models.Pasazer).filter(models.Pasazer.email == dane.email).first()
    if istniejacy_pasazer:
        raise HTTPException(status_code=400, detail="Pasażer z tym adresem email już istnieje!")
 
    #  czy login (== email) nie jest zajęty?
    istniejace_konto = db.query(models.KontoUzytkownika).filter(models.KontoUzytkownika.login == dane.email).first()
    if istniejace_konto:
        raise HTTPException(status_code=400, detail="Konto z tym loginem już istnieje!")
 
    # 3. tworzymy Pasażera (konto wymaga id_pasazera jako klucz obcy)
    nowy_pasazer = models.Pasazer(
        imie=dane.imie,
        nazwisko=dane.nazwisko,
        email=dane.email,
        telefon=dane.telefon
    )
    db.add(nowy_pasazer)
    db.flush()  # mamy ID pasażera, jeszcze bez commita
 
    #  tworzymy konto - hasło hashujemy przez bcrypt 
    nowe_konto = models.KontoUzytkownika(
        id_pasazera=nowy_pasazer.id,
        login=dane.email,
        haslo_hash=hashuj_haslo(dane.haslo),  # <-- bcrypt hash zamiast plaintext
        rola_systemowa="pasazer"
    )
    db.add(nowe_konto)
 
    #  zapis w jednej transakcji
    db.commit()
    db.refresh(nowy_pasazer)
    db.refresh(nowe_konto)
 
    return {
        "status": "sukces",
        "wiadomosc": "Konto utworzone pomyślnie. Możesz się teraz zalogować.",
        "id_pasazera": nowy_pasazer.id,
        "login": nowe_konto.login,
        "rola": nowe_konto.rola_systemowa
    }