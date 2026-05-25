"""
============================================================
 SzwagiAIR - SKRYPT SEEDUJĄCY BAZĘ DANYMI TESTOWYMI
============================================================

CO ROBI:
   Wypełnia bazę kompletnym zestawem danych demonstracyjnych:
   - 50 najpopularniejszych lotnisk świata (w tym 6 polskich)
   - 4 samoloty (3 dalekobieżne + 1 krajowy "Polski Skoczek")
   - ~30 lotów (bezpośrednie + przesiadkowe + krajowe)
   - 10 pasażerów testowych
   - ~12 rezerwacji (większość OPŁACONYCH - do raportów finansowych)
   - odcinki rezerwacji, bagaże, usługi i płatności

   Dzięki opłaconym rezerwacjom raporty RAW SQL (top-pasazerowie,
   przychody-miesieczne, popularne-uslugi) od razu zwracają sensowne dane.

URUCHAMIANIE:
   1. docker compose up -d
   2. .\\.venv\\Scripts\\Activate.ps1
   3. python seed.py    (z katalogu backend)

UWAGA: Skrypt CZYŚCI całą bazę przed wypełnieniem (TRUNCATE CASCADE).
       Nie uruchamiać na danych, na których Ci zależy.
============================================================
"""

import datetime
import random
from sqlalchemy import text
from database import SessionLocal
import models


# ============================================================
# DANE: 50 LOTNISK (kod IATA, miasto, kraj)
# Kolejność = przyszłe ID (1..50). Polskie lotniska na początku.
# ============================================================
LOTNISKA = [
    # --- POLSKA (ID 1-6) ---
    ("WAW", "Warszawa",      "Polska"),
    ("KRK", "Kraków",        "Polska"),
    ("GDN", "Gdańsk",        "Polska"),
    ("WRO", "Wrocław",       "Polska"),
    ("POZ", "Poznań",        "Polska"),
    ("KTW", "Katowice",      "Polska"),
    # --- EUROPA ZACHODNIA (ID 7-25) ---
    ("LHR", "Londyn",        "Wielka Brytania"),
    ("CDG", "Paryż",         "Francja"),
    ("FRA", "Frankfurt",     "Niemcy"),
    ("AMS", "Amsterdam",     "Holandia"),
    ("MAD", "Madryt",        "Hiszpania"),
    ("BCN", "Barcelona",     "Hiszpania"),
    ("FCO", "Rzym",          "Włochy"),
    ("MXP", "Mediolan",      "Włochy"),
    ("MUC", "Monachium",     "Niemcy"),
    ("ZRH", "Zurych",        "Szwajcaria"),
    ("VIE", "Wiedeń",        "Austria"),
    ("BRU", "Bruksela",      "Belgia"),
    ("LIS", "Lizbona",       "Portugalia"),
    ("DUB", "Dublin",        "Irlandia"),
    ("CPH", "Kopenhaga",     "Dania"),
    ("ARN", "Sztokholm",     "Szwecja"),
    ("OSL", "Oslo",          "Norwegia"),
    ("HEL", "Helsinki",      "Finlandia"),
    ("ATH", "Ateny",         "Grecja"),
    # --- EUROPA WSCHODNIA/POŁUDNIOWA (ID 26-32) ---
    ("PRG", "Praga",         "Czechy"),
    ("BUD", "Budapeszt",     "Węgry"),
    ("OTP", "Bukareszt",     "Rumunia"),
    ("IST", "Stambuł",       "Turcja"),
    ("SVO", "Moskwa",        "Rosja"),
    ("KBP", "Kijów",         "Ukraina"),
    ("ZAG", "Zagrzeb",       "Chorwacja"),
    # --- AMERYKA PÓŁNOCNA (ID 33-40) ---
    ("JFK", "Nowy Jork",     "USA"),
    ("LAX", "Los Angeles",   "USA"),
    ("ORD", "Chicago",       "USA"),
    ("MIA", "Miami",         "USA"),
    ("SFO", "San Francisco", "USA"),
    ("YYZ", "Toronto",       "Kanada"),
    ("YVR", "Vancouver",     "Kanada"),
    ("MEX", "Meksyk",        "Meksyk"),
    # --- AZJA / BLISKI WSCHÓD (ID 41-47) ---
    ("DXB", "Dubaj",         "ZEA"),
    ("DOH", "Doha",          "Katar"),
    ("HND", "Tokio",         "Japonia"),
    ("PEK", "Pekin",         "Chiny"),
    ("HKG", "Hongkong",      "Chiny"),
    ("SIN", "Singapur",      "Singapur"),
    ("BKK", "Bangkok",       "Tajlandia"),
    # --- POZOSTAŁE KONTYNENTY (ID 48-50) ---
    ("SYD", "Sydney",        "Australia"),
    ("JNB", "Johannesburg",  "RPA"),
    ("GRU", "Sao Paulo",     "Brazylia"),
]


# ============================================================
# DANE: SAMOLOTY (ID 1-4)
# ============================================================
SAMOLOTY = [
    ("Boeing 787-9 Dreamliner", 296),   # ID 1 - dalekobieżny
    ("Airbus A350-900",         325),   # ID 2 - dalekobieżny
    ("Boeing 737-800",          189),   # ID 3 - średniodystansowy
    ("Embraer E195 Polski Skoczek", 124),  # ID 4 - krajowy (tylko PL-PL)
]


def wyczysc_baze(db):
    """Czyści wszystkie tabele i resetuje liczniki ID."""
    print("Czyszczę bazę (TRUNCATE CASCADE)...")
    # Wystarczy wymienić tabele "nadrzędne" - CASCADE posprząta resztę
    db.execute(text("""
        TRUNCATE TABLE
            lotniska, samoloty, loty, pasazerowie, rezerwacje,
            odcinki_rezerwacji, platnosci, bagaze, katalog_uslug,
            uslugi_rezerwacji, pracownicy, harmonogram_zalogi,
            konta_uzytkownikow
        RESTART IDENTITY CASCADE
    """))
    db.commit()
    print("  Baza wyczyszczona.")


def dodaj_lotniska(db):
    """Dodaje 50 lotnisk. ID 1-50 zgodnie z kolejnością w LOTNISKA."""
    print("Dodaję lotniska...")
    obiekty = [
        models.Lotnisko(kod=k, miasto=m, kraj=kr)
        for (k, m, kr) in LOTNISKA
    ]
    db.add_all(obiekty)
    db.commit()
    print(f"  Dodano {len(obiekty)} lotnisk.")


def dodaj_samoloty(db):
    """Dodaje 4 samoloty. ID 1-4."""
    print("Dodaję samoloty...")
    obiekty = [
        models.Samolot(model=m, pojemnosc_max=p)
        for (m, p) in SAMOLOTY
    ]
    db.add_all(obiekty)
    db.commit()
    print(f"  Dodano {len(obiekty)} samolotów.")


def dodaj_loty(db):
    """
    Dodaje loty: bezpośrednie międzynarodowe, krajowe (Polski Skoczek)
    oraz takie, które łączą się w trasy przesiadkowe.
    Zwraca słownik {numer_lotu: id} do użycia przy rezerwacjach.
    """
    print("Dodaję loty...")

    # Pomocnik do tworzenia daty
    def dt(d, h, mi):
        return datetime.datetime(2026, 6, d, h, mi)

    # ID lotnisk (kolejność z LOTNISKA): WAW=1 KRK=2 GDN=3 WRO=4 POZ=5 KTW=6
    # LHR=7 CDG=8 FRA=9 AMS=10 ... JFK=33 LAX=34 ORD=35 ... DXB=41 ...
    WAW, KRK, GDN, WRO, POZ, KTW = 1, 2, 3, 4, 5, 6
    LHR, CDG, FRA, AMS = 7, 8, 9, 10
    MAD, BCN, FCO = 11, 12, 13
    JFK, LAX, ORD, MIA = 33, 34, 35, 36
    DXB, DOH, HND, SIN = 41, 42, 43, 46

    loty = [
        # ===== KRAJOWE (samolot 4 - Polski Skoczek, tylko PL-PL) =====
        # numer, samolot, wylot, przylot, (dzień,godz,min)wylot, przylot, cena, miejsca
        ("PL010", 4, WAW, KRK, dt(1, 7, 0),  dt(1, 8, 0),  220.00, 100),
        ("PL011", 4, KRK, WAW, dt(1, 9, 0),  dt(1, 10, 0), 220.00, 100),
        ("PL012", 4, WAW, GDN, dt(1, 11, 0), dt(1, 12, 10), 240.00, 110),
        ("PL013", 4, GDN, WAW, dt(1, 13, 0), dt(1, 14, 10), 240.00, 110),
        ("PL014", 4, WAW, WRO, dt(2, 8, 0),  dt(2, 9, 0),  210.00, 95),
        ("PL015", 4, KRK, GDN, dt(2, 10, 0), dt(2, 11, 30), 260.00, 90),

        # ===== BEZPOŚREDNIE Z POLSKI DO EUROPY =====
        ("SA101", 3, WAW, LHR, dt(3, 8, 0),  dt(3, 10, 30), 450.00, 150),
        ("SA102", 3, WAW, CDG, dt(3, 9, 15), dt(3, 12, 0),  520.00, 120),
        ("SA103", 3, WAW, FRA, dt(3, 7, 30), dt(3, 9, 30),  380.00, 170),
        ("SA104", 3, KRK, BCN, dt(4, 14, 0), dt(4, 17, 30), 410.00, 160),
        ("SA105", 3, GDN, AMS, dt(4, 6, 30), dt(4, 8, 45),  390.00, 140),
        ("SA106", 3, WRO, MAD, dt(5, 12, 0), dt(5, 15, 30), 480.00, 130),
        ("SA107", 3, WAW, FCO, dt(5, 9, 0),  dt(5, 11, 45), 430.00, 155),

        # ===== DALEKOBIEŻNE Z HUBÓW (potrzebne do przesiadek) =====
        ("SA201", 1, LHR, JFK, dt(3, 13, 0), dt(3, 16, 30), 1850.00, 250),
        ("SA202", 1, FRA, JFK, dt(3, 12, 30), dt(3, 16, 0), 1920.00, 220),
        ("SA203", 2, CDG, JFK, dt(3, 15, 0), dt(3, 18, 30), 1780.00, 240),
        ("SA204", 2, FRA, LAX, dt(3, 11, 0), dt(3, 20, 0),  2400.00, 260),
        ("SA205", 1, LHR, DXB, dt(3, 14, 0), dt(3, 23, 30), 1650.00, 270),
        ("SA206", 2, AMS, SIN, dt(4, 10, 0), dt(5, 6, 0),   2900.00, 280),
        ("SA207", 1, FRA, HND, dt(4, 13, 0), dt(5, 8, 0),   3100.00, 250),

        # ===== POŁĄCZENIA HUB->HUB (do dłuższych przesiadek) =====
        ("SA301", 3, WAW, AMS, dt(3, 6, 0),  dt(3, 8, 10),  360.00, 165),
        ("SA302", 3, WAW, DXB, dt(4, 8, 0),  dt(4, 14, 30), 980.00, 175),
        ("SA303", 1, DXB, SIN, dt(4, 16, 0), dt(5, 1, 0),   1100.00, 260),

        # ===== POWROTNE =====
        ("SA401", 3, LHR, WAW, dt(7, 18, 0), dt(7, 20, 30), 460.00, 180),
        ("SA402", 3, FCO, WAW, dt(8, 11, 0), dt(8, 13, 45), 490.00, 165),
        ("SA403", 1, JFK, LHR, dt(8, 9, 0),  dt(8, 21, 0),  1900.00, 240),
    ]

    mapa_lotow = {}
    for numer, samolot, wyl, przyl, cw, cp, cena, miejsca in loty:
        lot = models.Loty(
            numer_lotu=numer,
            id_samolotu=samolot,
            id_lotniska_wylotu=wyl,
            id_lotniska_przylotu=przyl,
            czas_wylotu=cw,
            czas_przylotu=cp,
            cena_bazowa=cena,
            wolne_miejsca=miejsca,
        )
        db.add(lot)
        db.flush()  # potrzebujemy ID lotu od razu
        mapa_lotow[numer] = lot.id

    db.commit()
    print(f"  Dodano {len(loty)} lotów (krajowe + bezpośrednie + przesiadkowe).")
    return mapa_lotow


def dodaj_katalog_uslug(db):
    """Dodaje usługi dodatkowe. ID 1-6. Zwraca listę (id, cena)."""
    print("Dodaję katalog usług...")
    uslugi = [
        ("Posiłek premium",        85.00),
        ("Strefa VIP Lounge",     280.00),
        ("Pierwszeństwo wejścia",  50.00),
        ("Miejsce premium (nogi)", 120.00),
        ("Ubezpieczenie podróżne", 99.00),
        ("Szybka odprawa",         40.00),
    ]
    obiekty = []
    for nazwa, cena in uslugi:
        u = models.KatalogUslug(nazwa_uslugi=nazwa, cena_standardowa=cena)
        db.add(u)
        obiekty.append(u)
    db.commit()
    print(f"  Dodano {len(uslugi)} usług.")
    return [(u.id, float(u.cena_standardowa)) for u in obiekty]


def dodaj_pasazerow(db):
    """Dodaje 10 pasażerów. Zwraca listę ich ID."""
    print("Dodaję pasażerów...")
    dane = [
        ("Anna",      "Kowalska",    "anna.kowalska@example.com",    "+48600100200"),
        ("Piotr",     "Nowak",       "piotr.nowak@example.com",      "+48600100201"),
        ("Maria",     "Wiśniewska",  "maria.wisniewska@example.com", "+48600100202"),
        ("Tomasz",    "Wójcik",      "tomasz.wojcik@example.com",    "+48600100203"),
        ("Katarzyna", "Kamińska",    "k.kaminska@example.com",       "+48600100204"),
        ("Marek",     "Lewandowski", "m.lewandowski@example.com",    "+48600100205"),
        ("Agnieszka", "Zielińska",   "a.zielinska@example.com",      "+48600100206"),
        ("Krzysztof", "Szymański",   "k.szymanski@example.com",      "+48600100207"),
        ("Magdalena", "Woźniak",     "m.wozniak@example.com",        "+48600100208"),
        ("Jan",       "Demo",        "demo@szwagiair.pl",            "+48600100209"),
    ]
    ids = []
    for imie, nazwisko, email, tel in dane:
        p = models.Pasazer(imie=imie, nazwisko=nazwisko, email=email, telefon=tel)
        db.add(p)
        db.flush()
        ids.append(p.id)
    db.commit()
    print(f"  Dodano {len(ids)} pasażerów.")
    return ids


def dodaj_konta(db, pasazer_ids):
    """Tworzy konta logowania dla pasażerów. Hasło: demo123 (plaintext - MVP)."""
    print("Dodaję konta użytkowników...")
    # Wszyscy pasażerowie dostają konto z loginem = email
    pasazerowie = db.query(models.Pasazer).all()
    for p in pasazerowie:
        konto = models.KontoUzytkownika(
            id_pasazera=p.id,
            login=p.email,
            haslo_hash="demo123",
            rola_systemowa="pasazer",
        )
        db.add(konto)

    # dodatkowo jedno konto administratora (powiązane z ostatnim pasażerem "Jan Demo")
    admin = models.KontoUzytkownika(
        id_pasazera=pasazerowie[-1].id,
        login="admin@szwagiair.pl",
        haslo_hash="admin123",
        rola_systemowa="admin",
    )
    db.add(admin)
    db.commit()
    print(f"  Dodano {len(pasazerowie)} kont pasażerów + 1 konto admina.")



# DANE PRACOWNIKÓW (ZAŁOGA)
def dodaj_pracowników(db):
    print("Dodaję załogę (pracowników)...")
    dane = [
        ("Jan", "Kolas", "Kapitan", "PL-ATP-10231"),
        ("Anna", "Nowak", "Pierwszy Oficer", "PL-CPL-88776"),
        ("Michał", "Krawczyk", "Kapitan", "PL-ATP-55555"),
        ("Ewa", "Wiśniewska", "Szefowa Pokładu", "CC-112233"),
        ("Piotr", "Zieliński", "Steward", "CC-998877"),
        ("Katarzyna", "Bąk", "Stewardesa", "CC-444333"),
        ("Tomasz", "Lis", "Pierwszy Oficer", "PL-CPL-11122"),
        ("Agnieszka", "Kowal", "Stewardesa", "CC-555666"),
    ]

    pracownicy = []
    for imie, nazwisko, stan, lic in dane:
        p = models.Pracownik(imie=imie, nazwisko=nazwisko, stanowisko=stan, numer_licencji=lic)
        db.add(p)
        pracownicy.append(p)

    db.commit()
    print(f" Dodano {len(pracownicy)} pracowników załogi.")
    return pracownicy




def dodaj_rezerwacje(db, pasazer_ids, mapa_lotow, uslugi):
    """
    Tworzy kilkanaście rezerwacji - większość OPŁACONYCH (do raportów),
    kilka oczekujących i jedną anulowaną. Dolicza bagaże, usługi i płatności.
    """
    print("Dodaję rezerwacje z płatnościami...")

    # Lista scenariuszy: (pasazer_idx, numer_lotu, miejsce, status, bagaz_cena, [usluga_indexy], metoda, dzien_platnosci)
    # status: oplacona / oczekuje / anulowana
    scenariusze = [
        (0, "SA101", "12A", "oplacona", 150.00, [0, 1], "karta",   3),
        (1, "SA201", "1C",  "oplacona", 250.00, [1, 3], "karta",   3),
        (2, "SA104", "15F", "oplacona", 150.00, [0],    "blik",    4),
        (3, "PL010", "8B",  "oplacona", 0.00,   [5],    "blik",    1),
        (4, "SA204", "22A", "oplacona", 250.00, [1, 3, 4], "przelew", 3),
        (5, "SA107", "7D",  "oplacona", 150.00, [0, 2], "karta",   5),
        (6, "SA205", "3A",  "oplacona", 250.00, [1],    "karta",   3),
        (7, "PL012", "10C", "oplacona", 0.00,   [],     "blik",    1),
        (8, "SA206", "5F",  "oplacona", 250.00, [1, 3], "przelew", 4),
        (0, "SA102", "9B",  "oplacona", 150.00, [4],    "karta",   3),
        # niezakończone / inne statusy:
        (1, "SA103", "14A", "oczekuje", 0.00,   [],     "karta",   None),
        (2, "PL014", "6D",  "anulowana", 0.00,  [],     "blik",    None),
    ]

    licznik_oplaconych = 0
    for (p_idx, numer_lotu, miejsce, status, bagaz_cena,
         usluga_idx, metoda, dzien_pl) in scenariusze:

        id_lotu = mapa_lotow.get(numer_lotu)
        if id_lotu is None:
            continue

        # cena bazowa lotu
        lot = db.query(models.Loty).filter(models.Loty.id == id_lotu).first()
        cena_biletu = float(lot.cena_bazowa)

        # suma usług
        suma_uslug = sum(uslugi[i][1] for i in usluga_idx)
        cena_calkowita = cena_biletu + bagaz_cena + suma_uslug

        # --- rezerwacja ---
        rez = models.Rezerwacja(
            id_pasazera=pasazer_ids[p_idx],
            data_rezerwacji=datetime.datetime(2026, 5, random.randint(1, 15), 10, 0),
            typ_podrozy="w_jedna_strone",
            cena_calkowita=cena_calkowita,
            status=status,
        )
        db.add(rez)
        db.flush()

        # --- odcinek ---
        db.add(models.OdcinekRezerwacji(
            id_rezerwacji=rez.id,
            id_lotu=id_lotu,
            kolejnosc=1,
            numer_miejsca=miejsce,
        ))

        # --- bagaż (jeśli płatny) ---
        if bagaz_cena > 0:
            db.add(models.Bagaz(
                id_rezerwacji=rez.id,
                typ="rejestrowany",
                cena=bagaz_cena,
            ))

        # --- usługi ---
        for i in usluga_idx:
            db.add(models.UslugaRezerwacji(
                id_rezerwacji=rez.id,
                id_uslugi=uslugi[i][0],
            ))

        # --- płatność (tylko dla opłaconych) ---
        if status == "oplacona" and dzien_pl is not None:
            db.add(models.Platnosc(
                id_rezerwacji=rez.id,
                kwota=cena_calkowita,
                data_platnosci=datetime.datetime(2026, 5, dzien_pl, 12, 30),
                metoda_platnosci=metoda,
                status_transakcji="zakonczona",
            ))
            licznik_oplaconych += 1

    db.commit()
    print(f"  Dodano {len(scenariusze)} rezerwacji ({licznik_oplaconych} opłaconych).")


def main():
    print("=" * 60)
    print("  SzwagiAIR - SEED BAZY DEMONSTRACYJNEJ")
    print("=" * 60)

    db = SessionLocal()
    try:
        wyczysc_baze(db)
        dodaj_lotniska(db)
        dodaj_samoloty(db)
        mapa_lotow = dodaj_loty(db)
        uslugi = dodaj_katalog_uslug(db)
        pasazer_ids = dodaj_pasazerow(db)
        dodaj_konta(db, pasazer_ids)
        dodaj_rezerwacje(db, pasazer_ids, mapa_lotow, uslugi)

        dodaj_pracowników(db)


        print("=" * 60)
        print("  SUKCES! Baza wypełniona danymi demonstracyjnymi.")
        print("=" * 60)
        print()
        print("Konta testowe (hasło w nawiasie):")
        print("  Pasażer: demo@szwagiair.pl  (demo123)")
        print("  Admin:   admin@szwagiair.pl (admin123)")
        print()
        print("Sprawdź raporty RAW SQL w Swaggerze:")
        print("  GET /sprzedaz/raporty/top-pasazerowie")
        print("  GET /sprzedaz/raporty/przychody-miesieczne?rok=2026")
        print("  GET /sprzedaz/raporty/popularne-uslugi")
        print()
        print("Przykładowe trasy z przesiadką (dla wyszukiwarki):")
        print("  WAW -> JFK przez LHR (SA101 + SA201)")
        print("  WAW -> JFK przez FRA (SA103 + SA202)")
        print("  WAW -> SIN przez DXB (SA302 + SA303)")

    except Exception as e:
        print(f"\nBŁĄD: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
