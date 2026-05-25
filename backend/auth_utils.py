"""
============================================================
 auth_utils.py - NARZĘDZIA AUTORYZACJI JWT
============================================================
 
Centralne miejsce dla logiki tokenów JWT:
  - tworzenie tokenu po zalogowaniu
  - weryfikacja tokenu (dependency get_current_user)
  - sprawdzanie roli admina (dependency wymagaj_admina)
 
Jak używać w routerach:
  from auth_utils import pobierz_aktualnego_uzytkownika, wymagaj_admina
 
  @router.post("/cos")
  def dodaj(..., user = Depends(pobierz_aktualnego_uzytkownika)):
      ...
 
JWT (JSON Web Token) działa tak:
  1. Po zalogowaniu serwer tworzy podpisany token zawierający login + rolę.
  2. Klient (Swagger/frontend) wysyła token w nagłówku: Authorization: Bearer <token>
  3. Serwer weryfikuje podpis tokenu - jeśli OK, wie kto wysłał request.
  Token jest podpisany SECRET_KEY - nikt bez klucza nie podrobi ważnego tokenu.
============================================================
"""
 
from datetime import datetime, timedelta, timezone
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from database import get_session
import models
 
# ============================================================
# KONFIGURACJA JWT
# ============================================================
# SECRET_KEY - klucz do podpisywania tokenów.
# UWAGA: na produkcji trzymać w zmiennej środowiskowej (.env), nie w kodzie!
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
    Dependency: wyciąga token z nagłówka, weryfikuje go i zwraca obiekt konta.
    Jeśli token jest nieprawidłowy/wygasły - rzuca 401.
 
    Używać tak:
        @router.post("/cos")
        def f(..., user = Depends(pobierz_aktualnego_uzytkownika)):
            # user to obiekt models.KontoUzytkownika
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