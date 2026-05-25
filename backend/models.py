import datetime

from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Integer, String, ForeignKey, DateTime, Numeric
from database import Base

class Lotnisko(Base):
    __tablename__ = "lotniska"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    kod: Mapped[str] = mapped_column(String(3), unique=True)
    miasto: Mapped[str] = mapped_column(String(50))
    kraj: Mapped[str] = mapped_column(String(50))

class Samolot(Base):
    __tablename__ = "samoloty"

    id: Mapped[int] = mapped_column(primary_key=True)
    model: Mapped[str] = mapped_column(String(50))
    pojemnosc_max: Mapped[int] = mapped_column(Integer)
    
class Loty(Base):
    __tablename__ = "loty"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    numer_lotu: Mapped[str] = mapped_column(String(10), unique=True)
    odcinki_rezerwacji: Mapped[list["OdcinekRezerwacji"]] = relationship(back_populates="lot")

#####################################################################
    # relacje: Loty, Samoloty i lotniska

    id_samolotu: Mapped[int] = mapped_column(ForeignKey("samoloty.id"))
    id_lotniska_wylotu: Mapped[int]= mapped_column(ForeignKey("lotniska.id"))
    id_lotniska_przylotu: Mapped[int] = mapped_column(ForeignKey("lotniska.id"))

    # relacje dla zapytań ORM:

    samolot: Mapped["Samolot"] = relationship()

    #dla rozróżnienia lotnisk:

    lotnisko_wylotu: Mapped["Lotnisko"] = relationship(foreign_keys=[id_lotniska_wylotu])
    lotnisko_przylotu: Mapped["Lotnisko"] = relationship(foreign_keys=[id_lotniska_przylotu])

    #reszta relacji:

    czas_wylotu: Mapped[datetime.datetime] = mapped_column(DateTime)
    czas_przylotu: Mapped[datetime.datetime] = mapped_column(DateTime)
    cena_bazowa: Mapped[float] = mapped_column(Numeric(10, 2))
    wolne_miejsca: Mapped[int] = mapped_column(Integer)

##################################################################################


class Pracownik(Base):
    __tablename__ = "pracownicy"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    imie: Mapped[str] = mapped_column(String(50))
    nazwisko: Mapped[str] = mapped_column(String(50))
    stanowisko: Mapped[str] = mapped_column(String(50))
    numer_licencji: Mapped[str] = mapped_column(String(50))

class HarmonogramZalogi(Base):
    __tablename__ = "harmonogram_zalogi"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    id_lotu: Mapped[int] = mapped_column(ForeignKey("loty.id"))
    id_pracownika: Mapped[int] = mapped_column(ForeignKey("pracownicy.id"))



 # relacje do wyciągania obiektów z tabel: "Loty" oraz "Pracownik"
    lot: Mapped["Loty"] = relationship()
    pracownik: Mapped["Pracownik"] = relationship()

##################################################################################
# MODUŁ SPRZEDAŻOWY (Klienci i Rezerwacje)
##################################################################################

class Pasazer(Base):
    __tablename__ = "pasazerowie"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    imie: Mapped[str] = mapped_column(String(50))
    nazwisko: Mapped[str] = mapped_column(String(50))
    email: Mapped[str] = mapped_column(String(100), unique=True)
    telefon: Mapped[str] = mapped_column(String(20))

    konto: Mapped["KontoUzytkownika"] = relationship(back_populates="pasazer")
    rezerwacje: Mapped[list["Rezerwacja"]] = relationship(back_populates="pasazer")

class KontoUzytkownika(Base):
    __tablename__ = "konta_uzytkownikow"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    id_pasazera: Mapped[int] = mapped_column(ForeignKey("pasazerowie.id"))
    login: Mapped[str] = mapped_column(String(50), unique=True)
    haslo_hash: Mapped[str] = mapped_column(String(255))
    rola_systemowa: Mapped[str] = mapped_column(String(20)) 

    pasazer: Mapped["Pasazer"] = relationship(back_populates="konto")

class Rezerwacja(Base):
    __tablename__ = "rezerwacje"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    id_pasazera: Mapped[int] = mapped_column(ForeignKey("pasazerowie.id"))
    data_rezerwacji: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow)
    typ_podrozy: Mapped[str] = mapped_column(String(20)) 
    cena_calkowita: Mapped[float] = mapped_column(Numeric(10, 2))
    status: Mapped[str] = mapped_column(String(20)) 

    pasazer: Mapped["Pasazer"] = relationship(back_populates="rezerwacje")
    odcinki: Mapped[list["OdcinekRezerwacji"]] = relationship(back_populates="rezerwacja")
    platnosci: Mapped[list["Platnosc"]] = relationship(back_populates="rezerwacja")
    bagaze: Mapped[list["Bagaz"]] = relationship(back_populates="rezerwacja")
    uslugi: Mapped[list["UslugaRezerwacji"]] = relationship(back_populates="rezerwacja")

class OdcinekRezerwacji(Base):
    __tablename__ = "odcinki_rezerwacji"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    id_rezerwacji: Mapped[int] = mapped_column(ForeignKey("rezerwacje.id"))
    # TUTAJ ŁĄCZYMY OBA MODUŁY (na potrzeby lotów z przesiadkami):
    id_lotu: Mapped[int] = mapped_column(ForeignKey("loty.id")) 
    kolejnosc: Mapped[int] = mapped_column(Integer)
    numer_miejsca: Mapped[str] = mapped_column(String(5))

    rezerwacja: Mapped["Rezerwacja"] = relationship(back_populates="odcinki")
    lot: Mapped["Loty"] = relationship(back_populates="odcinki_rezerwacji")

class Platnosc(Base):
    __tablename__ = "platnosci"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    id_rezerwacji: Mapped[int] = mapped_column(ForeignKey("rezerwacje.id"))
    kwota: Mapped[float] = mapped_column(Numeric(10, 2))
    data_platnosci: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow)
    metoda_platnosci: Mapped[str] = mapped_column(String(50))
    status_transakcji: Mapped[str] = mapped_column(String(20))

    rezerwacja: Mapped["Rezerwacja"] = relationship(back_populates="platnosci")

class Bagaz(Base):
    __tablename__ = "bagaze"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    id_rezerwacji: Mapped[int] = mapped_column(ForeignKey("rezerwacje.id"))
    typ: Mapped[str] = mapped_column(String(50))
    cena: Mapped[float] = mapped_column(Numeric(10, 2))

    rezerwacja: Mapped["Rezerwacja"] = relationship(back_populates="bagaze")

class KatalogUslug(Base):
    __tablename__ = "katalog_uslug"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    nazwa_uslugi: Mapped[str] = mapped_column(String(100))
    cena_standardowa: Mapped[float] = mapped_column(Numeric(10, 2))

class UslugaRezerwacji(Base):
    __tablename__ = "uslugi_rezerwacji"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    id_rezerwacji: Mapped[int] = mapped_column(ForeignKey("rezerwacje.id"))
    id_uslugi: Mapped[int] = mapped_column(ForeignKey("katalog_uslug.id"))

    rezerwacja: Mapped["Rezerwacja"] = relationship(back_populates="uslugi")