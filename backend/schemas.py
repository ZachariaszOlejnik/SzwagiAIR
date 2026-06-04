from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import Literal

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
class LotniskoBase(BaseModel): # 3. Klasa "Base": Przechowuje wspólne pola dla danej encji. (walidacja danych -> poprawne to obiekt models.Lotnisko)
    kod: str = Field(..., min_length=3, max_length=3, description="Trzyliterowy kod IATA lotniska, np. WAW")
    miasto: str = Field(..., max_length=50)
    kraj: str = Field(..., max_length=50)

class LotniskoCreate(LotniskoBase): # 4. Klasa "Create": Używana przy POST. Nie ma pola ID (bo ID nadaje baza automatycznie przy zapisie).
    pass

class Lotnisko(LotniskoBase): 
    id: int
 
class LotniskoResponse(Lotnisko): # 5. Klasa "Response": Używana przy GET. Zawiera ID oraz "from_attributes=True"
    model_config = ConfigDict(from_attributes=True)


#################################
## 2. Samolot ##################
#################################
class SamolotBase(BaseModel):
    model: str = Field(..., max_length=50)
    pojemnosc_max: int = Field(..., gt=0, description= "Maksymalna liczba pasażerów ma by większa od 0")

class SamolotCreate(SamolotBase):
    pass

class SamolotResponse(SamolotBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

#################################
## 3. Lot #######################
#################################
class LotBase(BaseModel):
    numer_lotu: str = Field(..., max_length=10)
    id_samolotu: int
    id_lotniska_wylotu: int
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
## 6. Pasażer ###################
#################################
class PasazerBase(BaseModel):
    imie: str = Field(..., min_length=2, max_length=50, description="Imię musi mieć od 2 do 50 znaków")
    nazwisko: str = Field(..., min_length=2, max_length=50)
    email: str = Field(..., max_length=100)
    telefon: str = Field(..., min_length=9, max_length=20)

class PasazerCreate(PasazerBase):
    pass

class PasazerResponse(PasazerBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

#################################
## 7. Konto Użytkownika ########
#################################
class KontoUzytkownikaBase(BaseModel):
    id_pasazera: int
    login: str = Field(..., max_length=50)
    haslo_hash: str = Field(..., max_length=255)
    rola_systemowa: str = Field(..., max_length=20)

class KontoUzytkownikaCreate(KontoUzytkownikaBase):
    haslo: str = Field(..., min_length=6, max_length=100)

class KontoUzytkownikaResponse(KontoUzytkownikaBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

#################################
## 8. Rezerwacja ################
#################################
class RezerwacjaBase(BaseModel):
    id_pasazera: int
    typ_podrozy: Literal["w_jedna_strone", "powrotny"]
    cena_calkowita: float = Field(..., ge=0.0, description="Cena nie może być ujemna")
    status: Literal["oczekuje", "oplacona", "anulowana"] = "oczekuje"

class RezerwacjaCreate(RezerwacjaBase):
    pass

class RezerwacjaResponse(RezerwacjaBase):
    id: int
    data_rezerwacji: datetime
    model_config = ConfigDict(from_attributes=True)

#################################
## 9. Odcinek Rezerwacji ########
#################################
class OdcinekRezerwacjiBase(BaseModel):
    id_rezerwacji: int
    id_lotu: int
    kolejnosc: int = Field(..., gt=0, description="Kolejność lotu w rezerwacji")
    numer_miejsca: str = Field(..., max_length=5)

class OdcinekRezerwacjiCreate(OdcinekRezerwacjiBase):
    pass

class OdcinekRezerwacjiResponse(OdcinekRezerwacjiBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

#################################
## 10. Płatność #################
#################################
class PlatnoscBase(BaseModel):
    id_rezerwacji: int
    kwota: float = Field(..., gt=0.0, description="Kwota płatności musi być większa od zera")
    metoda_platnosci: Literal["karta", "blik", "przelew"]
    status_transakcji: Literal["przetwarzana", "zakonczona", "odrzucona"] = "przetwarzana"

class PlatnoscCreate(PlatnoscBase):
    pass

class PlatnoscResponse(PlatnoscBase):
    id: int
    data_platnosci: datetime
    model_config = ConfigDict(from_attributes=True)

#################################
## 11. Bagaż ####################
#################################
class BagazBase(BaseModel):
    id_rezerwacji: int
    typ: Literal["podreczny", "rejestrowany"]
    cena: float = Field(..., ge=0.0)

class BagazCreate(BagazBase):
    pass

class BagazResponse(BagazBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

#################################
## 12. Katalog Usług ############
#################################
class KatalogUslugBase(BaseModel):
    nazwa_uslugi: str = Field(..., max_length=100)
    cena_standardowa: float = Field(..., ge=0.0)

class KatalogUslugCreate(KatalogUslugBase):
    pass

class KatalogUslugResponse(KatalogUslugBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

#################################
## 13. Usługa Rezerwacji ########
#################################
class UslugaRezerwacjiBase(BaseModel):
    id_rezerwacji: int
    id_uslugi: int

class UslugaRezerwacjiCreate(UslugaRezerwacjiBase):
    pass

class UslugaRezerwacjiResponse(UslugaRezerwacjiBase):
    id: int
    model_config = ConfigDict(from_attributes=True)