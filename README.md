BACKEND:
* Python
* FastAPI
* Uvicorn
* Pydantic
* SQLAlchemy
* Bcrypt

FRONTEND:
* Js + html

BAZA i konteneryzacja:
* PostgreSQL
* Docker

URUCHAMIANIE:
# Krok 1: Git clone
git clone https://github.com/ZachariaszOlejnik/SzwagiAIR.git

# Krok 2: Konfiguracja zmiennych środowiskowych
W głównym folderze projektu znajduje się plik `.env.template`.
Skopiuj go i zmień nazwę na **`.env`**

Uzupełnij plik .env swoimi danycmi (hasło do bazy i sekretny klucz JWT)

# Krok 3: Uruchomienie kontenerów za pomocą Dockera
docker-compose up --build

🌐 Dostęp do aplikacji:
* Frontend (Apliakcja pasażera/admina): http://localhost:5500/
* Backend (dokumentacja automatyczna w Swagger UI): http://localhost:8000/docs
* Baza danych (PostgreSQL): localhost:5432 (docker jako db:5432)

👨‍💻 Autorzy:
* Mateusz i Zachariasz
