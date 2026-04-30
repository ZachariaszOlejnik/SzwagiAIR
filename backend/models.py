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