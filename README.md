### BACKEND:
* Python
* FastAPI (asynchroniczny framework REST API)
* Uvicorn (serwer ASGI)
* Pydantic (walidacja danych i schematów)
* SQLAlchemy (ORM - Object-Relational Mapping)
* Bcrypt (hashowanie haseł)

### FRONTEND:
* Js + html + CSS (SPA - Single Page Application)

### BAZA i konteneryzacja:
* PostgreSQL 15
* Docker & Docker Compose (izolacja środowiska)

---

URUCHAMIANIE:
# Krok 1: Klonowanie projektu - Git clone
git clone https://github.com/ZachariaszOlejnik/SzwagiAIR.git

# Krok 2: Konfiguracja zmiennych środowiskowych
W głównym folderze projektu znajduje się plik `.env.template`.
Skopiuj go i zmień nazwę na **`.env`**

Uzupełnij plik .env swoimi danycmi (hasło do bazy i sekretny klucz JWT)

# Krok 3: Uruchomienie kontenerów za pomocą Dockera
docker-compose up --build

# Krok 4: Wypełnienie danymi testowymi (seedowanie)
Po uruchominiu baza będzie pusta. Aby załodowac przykłdowe dane wykonac polecenie:
`docker-compose exec backend python seed.py`


🌐 Dostęp do aplikacji:
* Frontend (Apliakcja pasażera/admina): http://localhost:5500/
* Backend (dokumentacja automatyczna w Swagger UI): http://localhost:8000/docs
* Baza danych (PostgreSQL): localhost:5432 (docker jako db:5432)

👨‍💻 Autorzy:
* Mateusz i Zachariasz
