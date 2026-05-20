from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
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
@router.get("/samoloty", response_model = list[schemas.SamolotResponse])
def pobierz_samoloty(db: Session = Depends(get_session)):
    """Zwraca listę wszystkich samolotów w bazie."""
    return db.query(models.Samolot).all()

@router.post("/samoloty", response_model=schemas.SamolotResponse)
def dodaj_samolot(samolot: schemas.SamolotCreate, db: Session = Depends(get_session)):
    """Dodaje nowy samolot do bazy danych."""
    nowy_samolot = models.Samolot(**samolot.model_dump())
    db.add(nowy_samolot)
    db.commit()  
    db.refresh(nowy_samolot) 

    return nowy_samolot


# --- LOTY ---
@router.get("/loty", response_model = list[schemas.LotResponse])
def pobierz_loty(db: Session = Depends(get_session)):
    """Zwraca listę wszystkich lotów w bazie."""
    return db.query(models.Loty).all()

@router.post("/loty", response_model=schemas.LotResponse)
def dodaj_lot(lot: schemas.LotCreate, db: Session = Depends(get_session)):
    """Tworzy nowy lot w bazie danych. Podajemy ID samolotu, ID lotniska"""
    nowy_lot = models.Loty(**lot.model_dump())
    db.add(nowy_lot)
    db.commit()  
    db.refresh(nowy_lot) 

    return nowy_lot


# --- PRACOWNICY ---
@router.get("/pracownicy", response_model = list[schemas.PracownikResponse])
def pobierz_pracownikow(db: Session = Depends(get_session)):
    """Zwraca listę wszystkich pracownków w bazie."""
    return db.query(models.Pracownik).all()

@router.post("/pracownicy", response_model=schemas.PracownikResponse)
def dodaj_pracownika(pracownik: schemas.PracownikCreate, db: Session = Depends(get_session)):
    """Dodaje nowego pracownika do bazy danych."""
    nowy_pracownik = models.Pracownik(**pracownik.model_dump())
    db.add(nowy_pracownik)
    db.commit()
    db.refresh(nowy_pracownik)
    return nowy_pracownik


# --- HARMONOGRAM ZAŁOGI ---
@router.get("/harmonogram", response_model = list[schemas.HarmonogramZalogiResponse])
def pobierz_harmonogram(db: Session = Depends(get_session)):
    """Zwraca listę wszystkich wpisów w harmonogramie załogi."""
    return db.query(models.HarmonogramZalogi).all()

@router.post("/harmonogram", response_model=schemas.HarmonogramZalogiResponse)
def dodaj_wpis_harmonogramu(wpis: schemas.HarmonogramZalogiCreate, db: Session = Depends(get_session)):
    """Dodaje nowy wpis do harmonogramu załogi."""
    nowy_wpis = models.HarmonogramZalogi(**wpis.model_dump())
    db.add(nowy_wpis)
    db.commit()
    db.refresh(nowy_wpis)
    return nowy_wpis






####################################################
# --- RAPORTY (RAW SQL) ---
####################################################

# POMIĘTAĆ O WCIĘCIACH, BO NIE ZADZIAŁA!



### --- SZCZEGÓŁY LOTÓW (RAW SQL) --- ###

@router.get("/raporty/szczegoly-lotow")
def raport_szczegolowy_lotow(db: Session = Depends(get_session)):
    """Pobranie szczegółowego raportu lotów (RAW SQL)."""

    zapytanie = text("""
        SELECT
            l.numer_lotu,
            s.model AS model_samolotu,
            wylot.miasto AS miasto_wylotu,
            przylot.miasto AS miasto_przylotu,
            l.czas_wylotu,
            l.czas_przylotu,
            l.wolne_miejsca
        FROM loty l
        JOIN samoloty s ON l.id_samolotu = s.id
        JOIN lotniska wylot ON l.id_lotniska_wylotu = wylot.id
        JOIN lotniska przylot ON l.id_lotniska_przylotu = przylot.id
    """)

# .mappings() - zamiana wyniku zapytania sql na słownik, który FastAPI może zwrócić jako JSON 
    wyniki = db.execute(zapytanie).mappings().all()
    return wyniki



### --- PRZESIADKI (RAW SQL) --- ###
@router.get("/loty/przesiadki")
def szukaj_lotow_z_przesiadkami(skad:int, dokad:int, db: Session = Depends(get_session)):
    """Zaawansowane wyszukiwanie lotów z przesiadkami"""

    zapytanie = text("""
    SELECT
        l1.numer_lotu AS pierwszy_lot,
        l1.id_lotniska_wylotu AS lotnisko_start,
        l1.id_lotniska_przylotu AS lotnisko_przesiadki,
        l2.numer_lotu AS drugi_lot,
        l2.id_lotniska_przylotu AS lotnisko_cel,
        l1.czas_wylotu AS czas_wylotu_pierwszego,
        l2.czas_przylotu AS czas_przylotu_na_miejsce
    FROM loty l1
    JOIN loty l2 ON l1.id_lotniska_przylotu = l2.id_lotniska_wylotu
    WHERE l1.id_lotniska_wylotu = :param_skad
    AND l2.id_lotniska_przylotu = :param_dokad
    AND l2.czas_wylotu > l1.czas_przylotu
""")
    
    # .mappings():
    # WAW-NYC-01", 1, 3, "NYC-LAX-02", 4 -----> {"pierwszy_lot": "WAW-NYC-01", "lotnisko_start": 1, ...}

    wyniki = db.execute(zapytanie, {"param_skad":skad, "param_dokad":dokad}).mappings().all()
    
    # konwersja listy obiektów RowMapping na standardowe słowniki Pythona (dict) - był błąd
    # return wyniki
    return [dict(w) for w in wyniki]






# POMYSŁY:
# - Statystyki lotnisk: Zlicza, ile lotów startuje z każdego lotniska
# - Procentowe obłożenie: Oblicza, ile procent miejsc w samolocie zostało już wykupionych na dany lot, bazując na pojemnosc_max z tabeli samolotów i wolne_miejsca z tabeli lotów.


