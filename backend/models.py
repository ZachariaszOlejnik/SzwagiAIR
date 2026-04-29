from sqlalchemy.orm import Mapped, mapped_column
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

    # relacje:

    id_samolotu: Mapped[int] = mapped_column(ForeignKey("samoloty.id"))


    # dokończ resztę relacji