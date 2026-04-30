from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime

# Wzorzec projektowy Data Transfer Object (DTO)
# SEPARACJA: models.py to struktura bazy danych (SQL), a schemas.py to struktura danych w API (JSON).
# WALIDACJA: Pydantic (Field) sprawdza dane "w locie" ZANIM dotkną bazy (np. czy cena > 0).
# 3. Klasa "Base": Przechowuje wspólne pola dla danej encji.
# 4. Klasa "Create": Używana przy POST. Nie ma pola ID (bo ID nadaje baza automatycznie przy zapisie).
# 5. Klasa "Response": Używana przy GET. Zawiera ID oraz "from_attributes=True", co pozwala FastAPI w locie przetłumaczyć obiekt z bazy (ORM) na plik JSON dla klienta.


# baza -> create -> response


#################################
## 1. Lotnisko ##################
#################################
class LotniskoBase(BaseModel):
    kod: str = Field(..., min_length=3, max_length=3, description="Trzyliterowy kod IATA lotniska, np. WAW")
    miasto: str = Field(..., max_length=50)
    kraj: str = Field(..., max_length=50)

class LotniskoCreate(LotniskoBase):
    pass

class Lotnisko(LotniskoBase):
    id: int

class LotniskoResponse(Lotnisko):
    model_config = ConfigDict(from_attributes=True)


#################################
## 2. Samolot ##################
#################################
class SamolotBase(BaseModel):
    model: str = Field(..., max_length=50)
    pojemnnosc_max: int = Field(..., gt=0, description= "Maksymalna liczba pasażerów ma by większa od 0")

class SamolotCreate(SamolotBase):
    pass

class SamolotResponse(SamolotBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

#################################
## 3. Lot #######################
#################################
class LotBase(BaseModel):
    numer_Lotu: str = Field(..., max_length=10)
    id_samolotu: int
    id_lotniska_wykolotu: int
    id_lotniska_przylotu: int
    czas_wylotu: datetime
    czas_przylotu: datetime
    cena_bazowa: float = Field(..., gt=0.0) #cena większa od 0
    wolne_miejsca: int = Field(..., ge=0) 

class LotCreate(LotBase):
    pass

class LotResponse(LotBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

#################################
## 4. Pracownik #################
#################################
class PracownikBase(BaseModel):
    imie: str = Field(..., max_length=50)
    nazwisko: str = Field(..., max_length=50)
    stanowisko: str = Field(..., max_length=50)
    numer_licencji: str = Field(..., max_length=50)

class PracownikCreate(PracownikBase):
    pass

class PracownikResponse(PracownikBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


#################################
## 5. Harmonogram Załogi ########
#################################
class HarmonogramZalogiBase(BaseModel):
    id_lotu: int
    id_pracownika: int

class HarmonogramZalogiCreate(HarmonogramZalogiBase):
    pass

class HarmonogramZalogiResponse(HarmonogramZalogiBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

#################################
## 6. Dopisz resztę #############
#################################