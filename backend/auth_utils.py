"""
============================================================
 auth_utils.py - JWT
============================================================
 
Tu znajduje się logika JWT oraz hashowanie bcrypt.
 
============================================================
"""
 
from datetime import datetime, timedelta, timezone
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from database import get_session
import models
 

# ============================================================
# HASHOWANIE HASEŁ (bcrypt)
# ============================================================
# CryptContext zarządza algorytmem hashowania. schemes=["bcrypt"] = używamy bcrypt.
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
 
 
def hashuj_haslo(haslo: str) -> str:
    """Zwraca hash z podanego hasła do zapisania w bazie."""
    return pwd_context.hash(haslo)
 
 
def sprawdz_haslo(haslo_jawne: str, haslo_hash: str) -> bool:
    """
    Sprawdza czy podane hasło jest takie samo jak w bazie.
    Zwraca True/False. Nie odszyfrowuje tylko hashuje i porównuje.
    """
    return pwd_context.verify(haslo_jawne, haslo_hash)

# ============================================================
# KONFIGURACJA JWT
# ============================================================
# SECRET_KEY - klucz do podpisywania tokenów.
SECRET_KEY = "szwagiair-tajny-klucz-zmienic-na-produkcji-1234567890"
ALGORITHM = "HS256"               # algorytm podpisu
TOKEN_WAZNY_MINUT = 60 * 24       # token ważny 24 godziny
 
# OAuth2PasswordBearer mówi FastAPI/Swaggerowi:
# "token zdobywa się wysyłając login+hasło na endpoint /autoryzacja/login"
# To właśnie sprawia, że w Swaggerze pojawia się przycisk "Authorize".
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="autoryzacja/login")
 
 
# ============================================================
# TWORZENIE TOKENU
# ============================================================
def stworz_token(dane: dict) -> str:
    """
    Tworzy podpisany token JWT.
    'dane' to słownik który zaszyjemy w tokenie, np. {"sub": email, "rola": "admin"}.
    """
    do_zakodowania = dane.copy()
    # czas wygaśnięcia tokenu
    wygasa = datetime.now(timezone.utc) + timedelta(minutes=TOKEN_WAZNY_MINUT)
    do_zakodowania.update({"exp": wygasa})
    # podpisanie tokenu kluczem
    token = jwt.encode(do_zakodowania, SECRET_KEY, algorithm=ALGORITHM)
    return token
 
 
# ============================================================
# WERYFIKACJA TOKENU (dependency)
# ============================================================
def pobierz_aktualnego_uzytkownika(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_session),
):
    """
    Dependency: wyciąga token z nagłówka, weryfikuje go i zwraca .
    Jeśli token jest nieprawidłowy/wygasły - rzuca 401.
 
    """
    wyjatek_401 = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Nieprawidłowy lub wygasły token. Zaloguj się ponownie.",
        headers={"WWW-Authenticate": "Bearer"},
    )
 
    try:
        # dekodujemy i weryfikujemy podpis tokenu
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        login = payload.get("sub")  # "sub" = subject = login użytkownika
        if login is None:
            raise wyjatek_401
    except JWTError:
        raise wyjatek_401
 
    # sprawdzamy czy użytkownik nadal istnieje w bazie
    uzytkownik = db.query(models.KontoUzytkownika).filter(
        models.KontoUzytkownika.login == login
    ).first()
    if uzytkownik is None:
        raise wyjatek_401
 
    return uzytkownik
 
 
# ============================================================
# SPRAWDZENIE ROLI ADMINA (dependency)
# ============================================================
def wymagaj_admina(
    uzytkownik = Depends(pobierz_aktualnego_uzytkownika),
):
    """
    Dependency: przepuszcza tylko administratorów.
    Najpierw weryfikuje token (przez pobierz_aktualnego_uzytkownika),
    potem sprawdza czy rola == admin.
    """
    if uzytkownik.rola_systemowa != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Brak uprawnień. Ta operacja wymaga konta administratora.",
        )
    return uzytkownik