from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import get_session
from auth_utils import pobierz_aktualnego_uzytkownika, wymagaj_admina
import models
import schemas
 
# Inicjalizacja routera dla modułu sprzedażowego
router = APIRouter(
    prefix="/sprzedaz",
    tags=["Moduł sprzedażowy (Klienci, Rezerwacje, Płatności)"]
)
 
# ZASADA AUTORYZACJI W TYM MODULE:
# - GET (przeglądanie) -> publiczne
# - POST/PATCH zwykłe (rezerwacje, bagaże, usługi, płatności) -> ZALOGOWANY pasażer
#   przez Depends(pobierz_aktualnego_uzytkownika)
# - Zarządzanie cennikiem (dodawanie usług do katalogu) -> tylko ADMIN
#   przez Depends(wymagaj_admina)
 
 
# ==========================================
# --- PASAŻEROWIE ---
# ==========================================
 
@router.get("/pasazerowie", response_model=list[schemas.PasazerResponse])
def pobierz_pasazerow(db: Session = Depends(get_session)):
    """Zwraca listę wszystkich pasażerów."""
    return db.query(models.Pasazer).all()
 
@router.get("/pasazerowie/{id_pasazera}", response_model=schemas.PasazerResponse)
def pobierz_pasazera(id_pasazera: int, db: Session = Depends(get_session)):
    """Zwraca dane konkretnego pasażera po jego ID."""
    pasazer = db.query(models.Pasazer).filter(models.Pasazer.id == id_pasazera).first()
    if not pasazer:
        raise HTTPException(status_code=404, detail="Pasażer o podanym ID nie istnieje!")
    return pasazer
 
@router.post("/pasazerowie", response_model=schemas.PasazerResponse)
def dodaj_pasazera(
    pasazer: schemas.PasazerCreate,
    db: Session = Depends(get_session),
    user = Depends(pobierz_aktualnego_uzytkownika),
):
    """Dodaje nowego pasażera do systemu."""
    # Zabezpieczenie: email jest UNIQUE w bazie, więc sprawdzamy duplikat
    istniejacy = db.query(models.Pasazer).filter(models.Pasazer.email == pasazer.email).first()
    if istniejacy:
        raise HTTPException(status_code=400, detail="Pasażer z tym adresem email już istnieje!")
 
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
 
@router.get("/rezerwacje/{id_rezerwacji}", response_model=schemas.RezerwacjaResponse)
def pobierz_rezerwacje_po_id(id_rezerwacji: int, db: Session = Depends(get_session)):
    """Zwraca szczegóły konkretnej rezerwacji."""
    rezerwacja = db.query(models.Rezerwacja).filter(models.Rezerwacja.id == id_rezerwacji).first()
    if not rezerwacja:
        raise HTTPException(status_code=404, detail="Rezerwacja o podanym ID nie istnieje!")
    return rezerwacja
 
@router.post("/rezerwacje", response_model=schemas.RezerwacjaResponse)
def utworz_rezerwacje(
    rezerwacja: schemas.RezerwacjaCreate,
    db: Session = Depends(get_session),
    user = Depends(pobierz_aktualnego_uzytkownika),
):
    """Tworzy pustą rezerwację dla konkretnego pasażera."""
    pasazer_istnieje = db.query(models.Pasazer).filter(models.Pasazer.id == rezerwacja.id_pasazera).first()
    if not pasazer_istnieje:
        raise HTTPException(status_code=404, detail="Pasażer o podanym ID nie istnieje!")
 
    nowa_rezerwacja = models.Rezerwacja(**rezerwacja.model_dump())
    db.add(nowa_rezerwacja)
    db.commit()
    db.refresh(nowa_rezerwacja)
    return nowa_rezerwacja
 
@router.patch("/rezerwacje/{id_rezerwacji}/anuluj", response_model=schemas.RezerwacjaResponse)
def anuluj_rezerwacje(
    id_rezerwacji: int,
    db: Session = Depends(get_session),
    user = Depends(pobierz_aktualnego_uzytkownika),
):
    """
    Anuluje rezerwację (zmienia status na 'anulowana').
    Logika biznesowa: nie można anulować już anulowanej ani opłaconej rezerwacji.
    """
    rezerwacja = db.query(models.Rezerwacja).filter(models.Rezerwacja.id == id_rezerwacji).first()
    if not rezerwacja:
        raise HTTPException(status_code=404, detail="Rezerwacja o podanym ID nie istnieje!")
 
    if rezerwacja.status == "anulowana":
        raise HTTPException(status_code=400, detail="Rezerwacja jest już anulowana!")
 
    if rezerwacja.status == "oplacona":
        raise HTTPException(
            status_code=400,
            detail="Nie można anulować opłaconej rezerwacji - wymagany jest proces zwrotu."
        )
 
    rezerwacja.status = "anulowana"
    db.commit()
    db.refresh(rezerwacja)
    return rezerwacja
 
 
# ==========================================
# --- ODCINKI REZERWACJI (Bilety) ---
# ==========================================
 
@router.get("/odcinki_rezerwacji", response_model=list[schemas.OdcinekRezerwacjiResponse])
def pobierz_odcinki_rezerwacji(db: Session = Depends(get_session)):
    """Zwraca listę wszystkich odcinków przypisanych do rezerwacji."""
    return db.query(models.OdcinekRezerwacji).all()
 
@router.post("/odcinki_rezerwacji", response_model=schemas.OdcinekRezerwacjiResponse)
def dodaj_odcinek_rezerwacji(
    odcinek: schemas.OdcinekRezerwacjiCreate,
    db: Session = Depends(get_session),
    user = Depends(pobierz_aktualnego_uzytkownika),
):
    """Dodaje konkretny lot do istniejącej rezerwacji."""
    rezerwacja = db.query(models.Rezerwacja).filter(models.Rezerwacja.id == odcinek.id_rezerwacji).first()
    if not rezerwacja:
        raise HTTPException(status_code=404, detail="Rezerwacja o podanym ID nie istnieje!")
 
    if rezerwacja.status in ("anulowana", "oplacona"):
        raise HTTPException(
            status_code=400,
            detail=f"Nie można modyfikować rezerwacji o statusie '{rezerwacja.status}'."
        )
 
    lot = db.query(models.Loty).filter(models.Loty.id == odcinek.id_lotu).first()
    if not lot:
        raise HTTPException(status_code=404, detail="Lot o podanym ID nie istnieje!")
 
    miejsce_zajete = db.query(models.OdcinekRezerwacji).filter(
        models.OdcinekRezerwacji.id_lotu == odcinek.id_lotu,
        models.OdcinekRezerwacji.numer_miejsca == odcinek.numer_miejsca
    ).first()
    if miejsce_zajete:
        raise HTTPException(
            status_code=400,
            detail=f"Miejsce {odcinek.numer_miejsca} na tym locie jest już zajęte!"
        )
 
    if lot.wolne_miejsca <= 0:
        raise HTTPException(status_code=400, detail="Brak wolnych miejsc na ten lot!")
 
    nowy_odcinek = models.OdcinekRezerwacji(**odcinek.model_dump())
    db.add(nowy_odcinek)
    lot.wolne_miejsca -= 1
 
    db.commit()
    db.refresh(nowy_odcinek)
    return nowy_odcinek
 
 
# ==========================================
# --- PŁATNOŚCI (Z LOGIKĄ BIZNESOWĄ) ---
# ==========================================
 
@router.get("/platnosci", response_model=list[schemas.PlatnoscResponse])
def pobierz_platnosci(db: Session = Depends(get_session)):
    """Zwraca listę wszystkich zarejestrowanych płatności."""
    return db.query(models.Platnosc).all()
 
@router.post("/platnosci", response_model=schemas.PlatnoscResponse)
def zrealizuj_platnosc(
    platnosc: schemas.PlatnoscCreate,
    db: Session = Depends(get_session),
    user = Depends(pobierz_aktualnego_uzytkownika),
):
    """
    Księguje nową płatność i automatycznie aktualizuje status rezerwacji.
    """
    rezerwacja = db.query(models.Rezerwacja).filter(models.Rezerwacja.id == platnosc.id_rezerwacji).first()
 
    if not rezerwacja:
        raise HTTPException(status_code=404, detail="Nie można opłacić nieistniejącej rezerwacji!")
 
    if rezerwacja.status == "oplacona":
        raise HTTPException(status_code=400, detail="Ta rezerwacja została już opłacona!")
 
    if rezerwacja.status == "anulowana":
        raise HTTPException(status_code=400, detail="Nie można opłacić anulowanej rezerwacji!")
 
    if float(platnosc.kwota) < float(rezerwacja.cena_calkowita):
        raise HTTPException(
            status_code=400,
            detail=f"Kwota płatności ({platnosc.kwota}) jest niższa niż cena rezerwacji ({rezerwacja.cena_calkowita})."
        )
 
    nowa_platnosc = models.Platnosc(**platnosc.model_dump())
    db.add(nowa_platnosc)
 
    if nowa_platnosc.status_transakcji == "zakonczona":
        rezerwacja.status = "oplacona"
 
    db.commit()
    db.refresh(nowa_platnosc)
 
    return nowa_platnosc
 
 
# ==========================================
# --- BAGAŻE ---
# ==========================================
 
@router.get("/bagaze", response_model=list[schemas.BagazResponse])
def pobierz_bagaze(db: Session = Depends(get_session)):
    """Zwraca listę wszystkich zarejestrowanych bagaży."""
    return db.query(models.Bagaz).all()
 
@router.post("/bagaze", response_model=schemas.BagazResponse)
def dodaj_bagaz(
    bagaz: schemas.BagazCreate,
    db: Session = Depends(get_session),
    user = Depends(pobierz_aktualnego_uzytkownika),
):
    """Dodaje bagaż (podręczny lub rejestrowany) do istniejącej rezerwacji."""
    rezerwacja = db.query(models.Rezerwacja).filter(models.Rezerwacja.id == bagaz.id_rezerwacji).first()
    if not rezerwacja:
        raise HTTPException(status_code=404, detail="Rezerwacja o podanym ID nie istnieje!")
 
    if rezerwacja.status == "anulowana":
        raise HTTPException(status_code=400, detail="Nie można dodać bagażu do anulowanej rezerwacji!")
 
    nowy_bagaz = models.Bagaz(**bagaz.model_dump())
    db.add(nowy_bagaz)
 
    rezerwacja.cena_calkowita = float(rezerwacja.cena_calkowita) + float(bagaz.cena)
 
    db.commit()
    db.refresh(nowy_bagaz)
    return nowy_bagaz
 
 
# ==========================================
# --- KATALOG USŁUG (Cennik) ---
# ==========================================
 
@router.get("/katalog_uslug", response_model=list[schemas.KatalogUslugResponse])
def pobierz_katalog_uslug(db: Session = Depends(get_session)):
    """Zwraca cennik wszystkich dostępnych usług dodatkowych (np. catering, wybór miejsca)."""
    return db.query(models.KatalogUslug).all()
 
@router.post("/katalog_uslug", response_model=schemas.KatalogUslugResponse)
def dodaj_usluge_do_katalogu(
    usluga: schemas.KatalogUslugCreate,
    db: Session = Depends(get_session),
    admin = Depends(wymagaj_admina),   # zarządzanie cennikiem to rola ADMINA
):
    """Dodaje nową usługę do katalogu (endpoint administracyjny)."""
    nowa_usluga = models.KatalogUslug(**usluga.model_dump())
    db.add(nowa_usluga)
    db.commit()
    db.refresh(nowa_usluga)
    return nowa_usluga
 
 
# ==========================================
# --- USŁUGI W REZERWACJI ---
# ==========================================
 
@router.get("/uslugi_rezerwacji", response_model=list[schemas.UslugaRezerwacjiResponse])
def pobierz_uslugi_rezerwacji(db: Session = Depends(get_session)):
    """Zwraca listę wszystkich usług dokupionych do rezerwacji."""
    return db.query(models.UslugaRezerwacji).all()
 
@router.post("/uslugi_rezerwacji", response_model=schemas.UslugaRezerwacjiResponse)
def dodaj_usluge_do_rezerwacji(
    usluga: schemas.UslugaRezerwacjiCreate,
    db: Session = Depends(get_session),
    user = Depends(pobierz_aktualnego_uzytkownika),
):
    """Dokupuje usługę z katalogu do istniejącej rezerwacji."""
    rezerwacja = db.query(models.Rezerwacja).filter(models.Rezerwacja.id == usluga.id_rezerwacji).first()
    if not rezerwacja:
        raise HTTPException(status_code=404, detail="Rezerwacja o podanym ID nie istnieje!")
 
    if rezerwacja.status == "anulowana":
        raise HTTPException(status_code=400, detail="Nie można dodać usługi do anulowanej rezerwacji!")
 
    usluga_z_katalogu = db.query(models.KatalogUslug).filter(models.KatalogUslug.id == usluga.id_uslugi).first()
    if not usluga_z_katalogu:
        raise HTTPException(status_code=404, detail="Usługa o podanym ID nie istnieje w katalogu!")
 
    nowa_usluga = models.UslugaRezerwacji(**usluga.model_dump())
    db.add(nowa_usluga)
 
    rezerwacja.cena_calkowita = float(rezerwacja.cena_calkowita) + float(usluga_z_katalogu.cena_standardowa)
 
    db.commit()
    db.refresh(nowa_usluga)
    return nowa_usluga
 
 
# ==========================================
# --- RAPORTY (RAW SQL) ---
# ==========================================
# Raporty zostają PUBLICZNE (GET).
 
@router.get("/raporty/top-pasazerowie")
def raport_top_pasazerowie(limit: int = 10, db: Session = Depends(get_session)):
    """
    Ranking pasażerów wg sumy wydatków na opłacone rezerwacje (RAW SQL).
    Parametr 'limit' określa ile pozycji rankingu zwrócić (domyślnie 10).
    """
 
    zapytanie = text("""
        SELECT
            p.id AS id_pasazera,
            p.imie,
            p.nazwisko,
            p.email,
            COUNT(DISTINCT r.id) AS liczba_rezerwacji,
            SUM(pl.kwota) AS suma_wydatkow
        FROM pasazerowie p
        JOIN rezerwacje r ON r.id_pasazera = p.id
        JOIN platnosci pl ON pl.id_rezerwacji = r.id
        WHERE pl.status_transakcji = 'zakonczona'
        GROUP BY p.id, p.imie, p.nazwisko, p.email
        ORDER BY suma_wydatkow DESC
        LIMIT :limit
    """)
 
    # Parametryzacja zabezpiecza przed SQL Injection (wymóg z dokumentacji projektowej)
    wyniki = db.execute(zapytanie, {"limit": limit}).mappings().all()
    return wyniki
 
 
@router.get("/raporty/przychody-miesieczne")
def raport_przychody_miesieczne(rok: int = 2026, db: Session = Depends(get_session)):
    """
    Suma przychodów w podziale na miesiące dla wybranego roku.
    Używa funkcji agregujących PostgreSQL: EXTRACT.
    Parametr 'rok' - rok do analizy (domyślnie 2026).
    """
 
    zapytanie = text("""
        SELECT
            EXTRACT(MONTH FROM pl.data_platnosci) AS miesiac,
            COUNT(pl.id) AS liczba_platnosci,
            SUM(pl.kwota) AS suma_przychodow
        FROM platnosci pl
        WHERE pl.status_transakcji = 'zakonczona'
          AND EXTRACT(YEAR FROM pl.data_platnosci) = :rok
        GROUP BY EXTRACT(MONTH FROM pl.data_platnosci)
        ORDER BY miesiac
    """)
 
    wyniki = db.execute(zapytanie, {"rok": rok}).mappings().all()
    return wyniki