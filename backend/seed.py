"""
============================================================
 SzwagiAIR - SKRYPT SEEDUJĄCY BAZĘ DANYMI TESTOWYMI
============================================================

CO ROBI:
   Wypełnia bazę kompletnym zestawem danych demonstracyjnych:
   - 50 najpopularniejszych lotnisk świata (w tym 6 polskich)
   - 10 samolotów (krótko- i dalekobieżne)
   - 150 lotów (generowanych dynamicznie, idealnie zgranych datami 1-15 czerwca)
   - 10 pasażerów testowych
   - ~12 rezerwacji (większość OPŁACONYCH - do raportów finansowych)
   - odcinki rezerwacji, bagaże, usługi i płatności

============================================================
"""

import datetime
import random
from sqlalchemy import text
from database import SessionLocal
import models
from auth_utils import hashuj_haslo


# ============================================================
# DANE: 50 LOTNISK (kod IATA, miasto, kraj)
# ============================================================
LOTNISKA = [
    ("WAW", "Warszawa",      "Polska"),
    ("KRK", "Kraków",        "Polska"),
    ("GDN", "Gdańsk",        "Polska"),
    ("WRO", "Wrocław",       "Polska"),
    ("POZ", "Poznań",        "Polska"),
    ("KTW", "Katowice",      "Polska"),
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
    ("PRG", "Praga",         "Czechy"),
    ("BUD", "Budapeszt",     "Węgry"),
    ("OTP", "Bukareszt",     "Rumunia"),
    ("IST", "Stambuł",       "Turcja"),
    ("SVO", "Moskwa",        "Rosja"),
    ("KBP", "Kijów",         "Ukraina"),
    ("ZAG", "Zagrzeb",       "Chorwacja"),
    ("JFK", "Nowy Jork",     "USA"),
    ("LAX", "Los Angeles",   "USA"),
    ("ORD", "Chicago",       "USA"),
    ("MIA", "Miami",         "USA"),
    ("SFO", "San Francisco", "USA"),
    ("YYZ", "Toronto",       "Kanada"),
    ("YVR", "Vancouver",     "Kanada"),
    ("MEX", "Meksyk",        "Meksyk"),
    ("DXB", "Dubaj",         "ZEA"),
    ("DOH", "Doha",          "Katar"),
    ("HND", "Tokio",         "Japonia"),
    ("PEK", "Pekin",         "Chiny"),
    ("HKG", "Hongkong",      "Chiny"),
    ("SIN", "Singapur",      "Singapur"),
    ("BKK", "Bangkok",       "Tajlandia"),
    ("SYD", "Sydney",        "Australia"),
    ("JNB", "Johannesburg",  "RPA"),
    ("GRU", "Sao Paulo",     "Brazylia"),
]


# ============================================================
# DANE: SAMOLOTY (ID 1-10)
# ============================================================
SAMOLOTY = [
    ("Boeing 787-9 Dreamliner", 296),       # ID 1
    ("Airbus A350-900",         325),       # ID 2
    ("Boeing 737-800",          189),       # ID 3
    ("Embraer E195 Polski Skoczek", 124),   # ID 4
    ("Airbus A320neo",          165),       # ID 5
    ("Boeing 737 MAX 8",        189),       # ID 6
    ("Boeing 787-8 Dreamliner", 252),       # ID 7
    ("Embraer E190",            114),       # ID 8
    ("Airbus A350-900",         325),       # ID 9
    ("Boeing 737-800",          189),       # ID 10
]


def wyczysc_baze(db):
    print("Czyszczę bazę (TRUNCATE CASCADE)...")
    db.execute(text("""
        TRUNCATE TABLE
            lotniska, samoloty, loty, pasazerowie, rezerwacje,
            odcinki_rezerwacji, platnosci, bagaze, katalog_uslug,
            uslugi_rezerwacji, pracownicy, harmonogram_zalogi,
            konta_uzytkownikow
        RESTART IDENTITY CASCADE
    """))
    db.commit()


def dodaj_lotniska(db):
    obiekty = [models.Lotnisko(kod=k, miasto=m, kraj=kr) for (k, m, kr) in LOTNISKA]
    db.add_all(obiekty)
    db.commit()


def dodaj_samoloty(db):
    obiekty = [models.Samolot(model=m, pojemnosc_max=p) for (m, p) in SAMOLOTY]
    db.add_all(obiekty)
    db.commit()


def dodaj_loty(db):
    print("Generuję 150 lotów z odpowiednim rozkładem na czerwiec...")

    WAW, KRK, GDN, WRO, POZ, KTW = 1, 2, 3, 4, 5, 6
    LHR, CDG, FRA, AMS, MAD, BCN, FCO, MXP, MUC = 7, 8, 9, 10, 11, 12, 13, 14, 15
    ZRH, VIE, BRU, CPH, HEL = 16, 17, 18, 21, 24
    IST = 29
    JFK, LAX, ORD, MIA, SFO, YYZ, MEX = 33, 34, 35, 36, 37, 38, 40
    DXB, HND, PEK, SIN, BKK = 41, 43, 44, 46, 47
    JNB, GRU = 49, 50

    # SZABLONY LOTÓW (74 unikalne, dni zmapowane na zakres 1-7)
    # Struktura: (Numer, Samolot_ID, Wylot_ID, Przylot_ID, Dzień_Wylotu, Godz_W, Min_W, Dzień_Przylotu, Godz_P, Min_P, Cena, Miejsca)
    baza_lotow = [
        # ===== KRAJOWE =====
        ("PL010", 4, WAW, KRK, 1, 7, 0, 1, 8, 0, 220.00, 15),
        ("PL011", 4, KRK, WAW, 1, 9, 0, 1, 10, 0, 220.00, 18),
        ("PL012", 4, WAW, GDN, 1, 11, 0, 1, 12, 10, 240.00, 25),
        ("PL013", 4, GDN, WAW, 1, 13, 0, 1, 14, 10, 240.00, 22),
        ("PL014", 4, WAW, WRO, 2, 8, 0, 2, 9, 0, 210.00, 12),
        ("PL015", 4, WRO, WAW, 2, 10, 0, 2, 11, 0, 210.00, 14),
        ("PL016", 8, KRK, GDN, 2, 12, 0, 2, 13, 30, 260.00, 8),
        ("PL017", 8, GDN, KRK, 2, 14, 30, 2, 16, 0, 260.00, 10),
        ("PL018", 8, WAW, POZ, 3, 7, 30, 3, 8, 30, 200.00, 20),
        ("PL019", 8, POZ, WAW, 3, 9, 30, 3, 10, 30, 200.00, 18),
        ("PL020", 4, WAW, KTW, 3, 12, 0, 3, 13, 0, 190.00, 15),
        ("PL021", 4, KTW, WAW, 3, 14, 0, 3, 15, 0, 190.00, 10),

        # ===== BEZPOŚREDNIE DO EUROPY =====
        ("SA101", 3, WAW, LHR, 1, 8, 0, 1, 10, 30, 450.00, 42),
        ("SA102", 3, WAW, CDG, 1, 9, 15, 1, 12, 0, 520.00, 28),
        ("SA103", 5, WAW, FRA, 1, 7, 30, 1, 9, 30, 380.00, 55),
        ("SA104", 5, KRK, BCN, 2, 14, 0, 2, 17, 30, 410.00, 48),
        ("SA105", 3, GDN, AMS, 2, 6, 30, 2, 8, 45, 390.00, 35),
        ("SA106", 6, WRO, MAD, 3, 12, 0, 3, 15, 30, 480.00, 30),
        ("SA107", 6, WAW, FCO, 3, 9, 0, 3, 11, 45, 430.00, 45),
        ("SA108", 3, WAW, LHR, 2, 16, 0, 2, 18, 30, 490.00, 20),
        ("SA109", 3, LHR, WAW, 2, 19, 30, 2, 23, 0, 470.00, 30),
        ("SA110", 10, WAW, MXP, 4, 8, 0, 4, 10, 15, 350.00, 40),
        ("SA111", 10, MXP, WAW, 4, 11, 0, 4, 13, 15, 350.00, 35),
        ("SA112", 3, KRK, MUC, 4, 10, 0, 4, 11, 30, 300.00, 25),
        ("SA113", 3, MUC, KRK, 4, 12, 30, 4, 14, 0, 300.00, 15),
        ("SA114", 5, WAW, VIE, 5, 7, 0, 5, 8, 15, 280.00, 50),
        ("SA115", 5, VIE, WAW, 5, 9, 0, 5, 10, 15, 280.00, 40),
        ("SA116", 6, WAW, BRU, 5, 14, 0, 5, 16, 15, 390.00, 22),

        # ===== DALEKOBIEŻNE =====
        ("SA201", 1, LHR, JFK, 1, 13, 0, 1, 16, 30, 1850.00, 60),
        ("SA202", 1, FRA, JFK, 1, 12, 30, 1, 16, 0, 1920.00, 50),
        ("SA203", 2, CDG, JFK, 1, 15, 0, 1, 18, 30, 1780.00, 75),
        ("SA204", 2, FRA, LAX, 1, 11, 0, 1, 20, 0, 2400.00, 80),
        ("SA205", 7, LHR, DXB, 2, 14, 0, 2, 23, 30, 1650.00, 65),
        ("SA206", 9, AMS, SIN, 2, 10, 0, 3, 6, 0, 2900.00, 90),
        ("SA207", 7, FRA, HND, 2, 13, 0, 3, 8, 0, 3100.00, 55),
        ("SA208", 1, JFK, LHR, 3, 19, 0, 4, 7, 0, 1800.00, 70),
        ("SA209", 2, JFK, CDG, 3, 20, 0, 4, 9, 30, 1750.00, 60),
        ("SA210", 9, LAX, FRA, 3, 15, 0, 4, 10, 0, 2300.00, 90),
        ("SA211", 1, FRA, ORD, 4, 10, 0, 4, 13, 30, 2100.00, 85),
        ("SA212", 1, ORD, FRA, 5, 17, 0, 6, 8, 30, 2050.00, 75),
        ("SA213", 2, LHR, MIA, 4, 11, 0, 4, 15, 30, 2200.00, 50),
        ("SA214", 2, MIA, LHR, 5, 19, 0, 6, 8, 30, 2150.00, 45),
        ("SA215", 9, CDG, YYZ, 5, 13, 30, 5, 16, 0, 1950.00, 80),

        # ===== POŁĄCZENIA INNE =====
        ("SA301", 10, WAW, AMS, 2, 6, 0, 2, 8, 10, 360.00, 50),
        ("SA302", 10, WAW, DXB, 3, 8, 0, 3, 14, 30, 980.00, 52),
        ("SA303", 1, DXB, SIN, 3, 16, 0, 4, 1, 0, 1100.00, 62),
        ("SA304", 1, SIN, DXB, 5, 9, 0, 5, 13, 0, 1050.00, 58),
        ("SA305", 7, DXB, WAW, 5, 15, 0, 5, 19, 30, 950.00, 48),
        ("SA306", 3, AMS, WAW, 3, 10, 0, 3, 12, 0, 360.00, 35),
        ("SA401", 6, LHR, WAW, 4, 18, 0, 4, 20, 30, 460.00, 40),
        ("SA402", 5, FCO, WAW, 5, 11, 0, 5, 13, 45, 490.00, 38),
        ("SA403", 2, JFK, LHR, 2, 9, 0, 2, 21, 0, 1900.00, 68),
        ("SA404", 10, CDG, WAW, 6, 14, 0, 6, 16, 15, 500.00, 25),
        ("SA405", 3, FRA, WAW, 6, 11, 0, 6, 12, 30, 370.00, 45),

        # ===== PRZESIADKI (spięte godzinowo, dni 5-7) =====
        ("SA501", 8, GDN, FRA, 5, 6, 0, 5, 7, 45, 320.00, 30),
        ("SA502", 1, FRA, MIA, 5, 9, 30, 5, 14, 0, 2400.00, 75),
        ("SA503", 5, KRK, AMS, 5, 7, 0, 5, 9, 0, 340.00, 45),
        ("SA504", 2, AMS, JFK, 5, 11, 0, 5, 14, 30, 2200.00, 80),
        ("SA505", 10, WRO, LHR, 5, 8, 0, 5, 9, 30, 400.00, 50),
        ("SA506", 9, LHR, LAX, 5, 12, 0, 5, 15, 30, 2700.00, 90),
        ("SA507", 6, POZ, CDG, 5, 10, 0, 5, 12, 0, 390.00, 40),
        ("SA508", 7, CDG, GRU, 5, 14, 0, 5, 21, 0, 3100.00, 60),
        ("SA509", 8, KTW, MUC, 6, 9, 0, 6, 10, 30, 290.00, 25),
        ("SA510", 2, MUC, HND, 6, 13, 0, 7, 8, 0, 3300.00, 70),
        ("SA511", 3, WAW, IST, 6, 14, 0, 6, 17, 30, 450.00, 55),
        ("SA512", 9, IST, BKK, 6, 20, 0, 7, 9, 0, 2800.00, 85),
        ("SA513", 5, KRK, ZRH, 6, 8, 0, 6, 9, 45, 370.00, 35),
        ("SA514", 1, ZRH, JNB, 6, 12, 0, 6, 22, 30, 3500.00, 65),
        ("SA515", 8, GDN, CPH, 6, 7, 0, 6, 8, 15, 250.00, 20),
        ("SA516", 7, CPH, SFO, 6, 11, 30, 6, 14, 0, 2900.00, 55),
        ("SA517", 6, WAW, MAD, 6, 9, 0, 6, 13, 0, 480.00, 45),
        ("SA518", 2, MAD, MEX, 6, 16, 0, 6, 21, 0, 3200.00, 75),
        ("SA519", 10, WRO, HEL, 6, 11, 0, 6, 14, 0, 310.00, 30),
        ("SA520", 9, HEL, PEK, 6, 16, 30, 7, 6, 30, 2600.00, 80),
    ]

    loty_gotowe = []

    # PRZEBIEG 1 (74 loty): Dni bazowe + 8 (Czyli daty: 9 - 15 czerwca)
    # Oryginalne numery lotów, na nich opierają się rezerwacje.
    for numer, sam, wyl, przyl, dw, hw, mw, dp, hp, mp, cena, msc in baza_lotow:
        data_wyl = datetime.datetime(2026, 6, dw + 8, hw, mw)
        data_prz = datetime.datetime(2026, 6, dp + 8, hp, mp)
        loty_gotowe.append((numer, sam, wyl, przyl, data_wyl, data_prz, cena, msc))

    # PRZEBIEG 2 (38 lotów): Dni bazowe + 0 (Czyli daty: 1 - 7 czerwca)
    # Dodajemy 'E' na koniec numeru by uniknąć duplikatu w wyszukiwarce
    for numer, sam, wyl, przyl, dw, hw, mw, dp, hp, mp, cena, msc in baza_lotow[:38]:
        data_wyl = datetime.datetime(2026, 6, dw, hw, mw)
        data_prz = datetime.datetime(2026, 6, dp, hp, mp)
        loty_gotowe.append((numer + "E", sam, wyl, przyl, data_wyl, data_prz, cena, msc))

    # PRZEBIEG 3 (38 lotów): Dni bazowe + 4 (Czyli daty: 5 - 11 czerwca)
    # Dodajemy 'M' na koniec numeru
    for numer, sam, wyl, przyl, dw, hw, mw, dp, hp, mp, cena, msc in baza_lotow[36:74]:
        data_wyl = datetime.datetime(2026, 6, dw + 4, hw, mw)
        data_prz = datetime.datetime(2026, 6, dp + 4, hp, mp)
        loty_gotowe.append((numer + "M", sam, wyl, przyl, data_wyl, data_prz, cena, msc))


    mapa_lotow = {}
    for numer, samolot, wyl, przyl, cw, cp, cena, miejsca in loty_gotowe:
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
        db.flush()
        mapa_lotow[numer] = lot.id

    db.commit()
    print(f"  Dodano {len(loty_gotowe)} lotów (74 główne + 76 wypełniających).")
    return mapa_lotow


def dodaj_katalog_uslug(db):
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
    return [(u.id, float(u.cena_standardowa)) for u in obiekty]


def dodaj_pasazerow(db):
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
    return ids


def dodaj_konta(db, pasazer_ids):
    pasazerowie = db.query(models.Pasazer).all()
    for p in pasazerowie:
        konto = models.KontoUzytkownika(
            id_pasazera=p.id,
            login=p.email,
            haslo_hash=hashuj_haslo("demo123"),
            rola_systemowa="pasazer",
        )
        db.add(konto)

    admin = models.KontoUzytkownika(
        id_pasazera=pasazerowie[-1].id,
        login="admin@szwagiair.pl",
        haslo_hash=hashuj_haslo("admin123"),
        rola_systemowa="admin",
    )
    db.add(admin)
    db.commit()


def dodaj_pracowników(db):
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


def dodaj_rezerwacje(db, pasazer_ids, mapa_lotow, uslugi):
    scenariusze = [
        (0, "SA101", "12A", "oplacona", 150.00, [0, 1], "karta",   20),
        (1, "SA201", "1C",  "oplacona", 250.00, [1, 3], "karta",   21),
        (2, "SA104", "15F", "oplacona", 150.00, [0],    "blik",    22),
        (3, "PL010", "8B",  "oplacona", 0.00,   [5],    "blik",    20),
        (4, "SA204", "22A", "oplacona", 250.00, [1, 3, 4], "przelew", 25),
        (5, "SA107", "7D",  "oplacona", 150.00, [0, 2], "karta",   26),
        (6, "SA205", "3A",  "oplacona", 250.00, [1],    "karta",   28),
        (7, "PL012", "10C", "oplacona", 0.00,   [],     "blik",    20),
        (8, "SA206", "5F",  "oplacona", 250.00, [1, 3], "przelew", 27),
        (0, "SA102", "9B",  "oplacona", 150.00, [4],    "karta",   22),
        (1, "SA103", "14A", "oczekuje", 0.00,   [],     "karta",   None),
        (2, "PL014", "6D",  "anulowana", 0.00,  [],     "blik",    None),
    ]

    for (p_idx, numer_lotu, miejsce, status, bagaz_cena, usluga_idx, metoda, dzien_pl) in scenariusze:
        id_lotu = mapa_lotow.get(numer_lotu)
        if id_lotu is None: continue

        lot = db.query(models.Loty).filter(models.Loty.id == id_lotu).first()
        cena_biletu = float(lot.cena_bazowa)
        suma_uslug = sum(uslugi[i][1] for i in usluga_idx)
        cena_calkowita = cena_biletu + bagaz_cena + suma_uslug

        rez = models.Rezerwacja(
            id_pasazera=pasazer_ids[p_idx],
            data_rezerwacji=datetime.datetime(2026, 5, random.randint(10, 28), 10, 0),
            typ_podrozy="w_jedna_strone",
            cena_calkowita=cena_calkowita,
            status=status,
        )
        db.add(rez)
        db.flush()

        db.add(models.OdcinekRezerwacji(
            id_rezerwacji=rez.id, id_lotu=id_lotu, kolejnosc=1, numer_miejsca=miejsce
        ))

        if bagaz_cena > 0:
            db.add(models.Bagaz(id_rezerwacji=rez.id, typ="rejestrowany", cena=bagaz_cena))

        for i in usluga_idx:
            db.add(models.UslugaRezerwacji(id_rezerwacji=rez.id, id_uslugi=uslugi[i][0]))

        if status == "oplacona" and dzien_pl is not None:
            db.add(models.Platnosc(
                id_rezerwacji=rez.id,
                kwota=cena_calkowita,
                data_platnosci=datetime.datetime(2026, 5, dzien_pl, 12, 30),
                metoda_platnosci=metoda,
                status_transakcji="zakonczona",
            ))

    db.commit()


def main():
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
        print("\nSUKCES! Baza wypełniona (150 lotów z odpowiednim zagęszczeniem pod koniec okresu).")
    except Exception as e:
        print(f"\nBŁĄD: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()