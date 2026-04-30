from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime

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

#################################
## 3. Lot #######################
#################################

#################################
## 4. Pracownik #################
#################################

#################################
## 5. Harmonogram Załogi ########
#################################