from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import get_session
from auth_utils import wymagaj_admina
import models
import schemas
 
# router pozwala na grupowanie endpointów (np. wszystkie operacje na lotach) w jednym miejscu, a potem podpinamy je do głównej aplikacji FastAPI w main.py
router = APIRouter(
    prefix="/operacje",
    tags=["Moduł operacyjny (Loty, Samoloty, Lotniska)"]
)
 
# ZASADA AUTORYZACJI W TYM MODULE:
# - GET (przeglądanie) -> publiczne, bez tokenu
# - POST/DELETE (zmiany w siatce lotów, flocie, załodze) -> tylko ADMIN
#   realizowane przez Depends(wymagaj_admina) na końcu listy parametrów
 

 
# --- LOTNISKA --- (RAW dla GET i ORM dla POST)
@router.get("/lotniska", response_model = list[schemas.LotniskoResponse])
def pobierz_lotniska(db: Session = Depends(get_session)):
    """[RAW SQL] Zwraca listę wszystkich lotnisk w bazie."""

    # return db.query(models.Lotnisko).all() - wersja ORM - jedna linijka by wystarczyła
    zapytanie = text("""
        SELECT id, kod, miasto, kraj
        FROM lotniska
        ORDER BY kod
    """)

    # mappings() zamienia wynik zapytania SQL na słowniki {kolumna: wartość}, potem fastAPI konwertuje do JSON
    wyniki = db.execute(zapytanie).mappings().all()
    return wyniki


@router.post("/lotniska", response_model=schemas.LotniskoResponse)
def dodaj_lotnisko(
    lotnisko: schemas.LotniskoCreate,
    db: Session = Depends(get_session),
    admin = Depends(wymagaj_admina),
):
    nowe_lotnisko = models.Lotnisko(**lotnisko.model_dump()) # zamiana Pydantic -> SQLAlchemy
    db.add(nowe_lotnisko)
    db.commit()  # fizyczne zapisanie do bazy PostgreSQL
    db.refresh(nowe_lotnisko) # Pobiera ID nadane przez bazę
 
    # zwracamy sam obiekt, LotniskoResponse zrobi konwersję SQLAlchemy -> Pydantic -> JSON dla klienta
    return nowe_lotnisko
 
 
# --- SAMOLOTY --- (RAW dla GET i ORM dla POST)
@router.get("/samoloty", response_model = list[schemas.SamolotResponse])
def pobierz_samoloty(db: Session = Depends(get_session)):
    """[RAW SQL] Zwraca listę wszystkich samolotów w bazie."""
    
    # return db.query(models.Samolot).all() - wersja ORM jednoliniowa
    zapytanie = text("""
        SELECT id, model, pojemnosc_max
        FROM samoloty
        ORDER BY id
    """)

    wyniki = db.execute(zapytanie).mappings().all()
    return wyniki
    
 


@router.post("/samoloty", response_model=schemas.SamolotResponse)
def dodaj_samolot(
    samolot: schemas.SamolotCreate,
    db: Session = Depends(get_session),
    admin = Depends(wymagaj_admina),
):
    """Dodaje nowy samolot do bazy danych."""
    nowy_samolot = models.Samolot(**samolot.model_dump())
    db.add(nowy_samolot)
    db.commit()
    db.refresh(nowy_samolot)
 
    return nowy_samolot
 
 
# --- LOTY --- (RAW dla GET i ORM dla POST)

    # WERSJA ORM:
# @router.get("/loty", response_model = list[schemas.LotResponse])
# def pobierz_loty(db: Session = Depends(get_session)):
    # return db.query(models.Loty).all()

@router.get("/loty")
def pobierz_loty(db: Session = Depends(get_session)):
    """[RAW SQL] Zwraca listę wszystkich lotów w bazie + nazwy samolotów i kody lotnisk"""

    zapytanie = text("""
        SELECT
            l.id, l.numer_lotu, l.czas_wylotu, l.czas_przylotu, l.cena_bazowa, l.wolne_miejsca, l.id_samolotu,
            s.model AS model_samolotu,
            l.id_lotniska_wylotu,
            wylot.kod AS kod_wylotu,
            l.id_lotniska_przylotu,
            przylot.kod AS kod_przylotu
        FROM loty l
        JOIN samoloty s ON l.id_samolotu = s.id
        JOIN lotniska wylot ON l.id_lotniska_wylotu = wylot.id
        JOIN lotniska przylot ON l.id_lotniska_przylotu = przylot.id
        ORDER BY l.czas_wylotu
    """)

    wyniki = db.execute(zapytanie).mappings().all()
    return wyniki




@router.post("/loty", response_model=schemas.LotResponse)
def dodaj_lot(
    lot: schemas.LotCreate,
    db: Session = Depends(get_session),
    admin = Depends(wymagaj_admina),
):
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
def dodaj_pracownika(
    pracownik: schemas.PracownikCreate,
    db: Session = Depends(get_session),
    admin = Depends(wymagaj_admina),
):
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
def dodaj_wpis_harmonogramu(
    wpis: schemas.HarmonogramZalogiCreate,
    db: Session = Depends(get_session),
    admin = Depends(wymagaj_admina),
):
    """Dodaje nowy wpis do harmonogramu załogi."""
    nowy_wpis = models.HarmonogramZalogi(**wpis.model_dump())
    db.add(nowy_wpis)
    db.commit()
    db.refresh(nowy_wpis)
    return nowy_wpis
 

@router.delete("/harmonogram")
def usun_wpis_harmonogramu(
    id_lotu: int,
    id_pracownika: int,
    db: Session = Depends(get_session),
    admin = Depends(wymagaj_admina),
):
    """Usuwa pracownika z harmonogramu danego lotu."""
 
    wpis = db.query(models.HarmonogramZalogi).filter(
        models.HarmonogramZalogi.id_lotu == id_lotu,
        models.HarmonogramZalogi.id_pracownika == id_pracownika
    ).first()
 
    if wpis:
        db.delete(wpis)
        db.commit()
        return {"status": "sukces", "wiadomosc": "Pracownik usunięty z lotu"}
 
    
    raise HTTPException(status_code=404, detail="Nie znaleziono takiego przypisania")
 
 
####################################################
# --- RAPORTY (RAW SQL) ---
####################################################
# Raporty zostają PUBLICZNE (GET) - służą do przeglądania/wyszukiwania.
# Jeśli chcecie je schować za adminem, dodajcie Depends(wymagaj_admina).
 
# PAMIĘTAĆ O WCIĘCIACH, BO NIE ZADZIAŁA!
 
 
### --- SZCZEGÓŁY LOTÓW (RAW SQL) --- ###
 
@router.get("/raporty/szczegoly-lotow")
def raport_szczegolowy_lotow(db: Session = Depends(get_session)):
    """Pobranie szczegółowego raportu lotów (RAW SQL) wraz z kodami IATA i miastami."""
 
    zapytanie = text("""
        SELECT
            l.numer_lotu,
            s.model AS model_samolotu,
            wylot.kod AS kod_wylotu,
            wylot.miasto AS miasto_wylotu,
            przylot.kod AS kod_przylotu,
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
def szukaj_lotow_z_przesiadkami(skad: str, dokad: str, db: Session = Depends(get_session)):
    """Zaawansowane wyszukiwanie lotów z przesiadkami na podstawie kodów IATA"""
 
    zapytanie = text("""
    SELECT
        l1.numer_lotu AS pierwszy_lot,
        start_lotnisko.kod AS lotnisko_start,
        przesiadka_lotnisko.kod AS lotnisko_przesiadki,
        l2.numer_lotu AS drugi_lot,
        cel_lotnisko.kod AS lotnisko_cel,
        l1.czas_wylotu AS czas_wylotu_pierwszego,
        l2.czas_przylotu AS czas_przylotu_na_miejsce
    FROM loty l1
    JOIN loty l2 ON l1.id_lotniska_przylotu = l2.id_lotniska_wylotu
    JOIN lotniska start_lotnisko ON l1.id_lotniska_wylotu = start_lotnisko.id
    JOIN lotniska przesiadka_lotnisko ON l1.id_lotniska_przylotu = przesiadka_lotnisko.id
    JOIN lotniska cel_lotnisko ON l2.id_lotniska_przylotu = cel_lotnisko.id
    WHERE start_lotnisko.kod = :param_skad
    AND cel_lotnisko.kod = :param_dokad
    AND l2.czas_wylotu > l1.czas_przylotu
    """)
 
    wyniki = db.execute(zapytanie, {"param_skad": skad.upper(), "param_dokad": dokad.upper()}).mappings().all()
 
    # konwersja listy obiektów RowMapping na standardowe słowniki Pythona (dict)
    return [dict(w) for w in wyniki]
 
 
# POMYSŁY:
# - Statystyki lotnisk: Zlicza, ile lotów startuje z każdego lotniska
# - Procentowe obłożenie: Oblicza, ile procent miejsc w samolocie zostało już wykupionych na dany lot.