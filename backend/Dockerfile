 # lekka wersja pythona
FROM python:3.10-slim

# katalog roboczy wewnątrz kontenera
WORKDIR /app 

#kopiowanie listy bibliotek i instalacja
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# kopiowanie reszty backendu
COPY . .

# odpalenie serwera uvicorn na porcie 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]