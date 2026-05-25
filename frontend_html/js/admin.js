// krok 1. Podłączenie URL backendu
const API_URL = "http://127.0.0.1:8000/operacje/loty";

// krok 2: funkcja asynchroniczna pobierająca dane
// async/await dlatego, że zapytanie do bazy (fetch) trwa chwilę i przeglądarka czeka
async function pobierzloty() {
  try {
    // Żądanie GET do backendu:
    const odpowiedz = await fetch(API_URL);

    // RAW na obiekt JSON:
    const loty = await odpowiedz.json();

    const tabela = document.getElementById("tabela-lotow");

    tabela.innerHTML = ""; // krok 3: Wyczyszczenie napisu ładowania

    ////////// 1. ZLICZANIE WSZYSTKICH LOTÓW ///////////////////

    document.getElementById("stat-wszystkie-loty").innerText = loty.length;

    const dzisiajFormat = new Date().toLocaleDateString("pl-PL");
    let liczbaLotowDzisiaj = 0;

    // Pętla przechodzi przez każdy zwrócony lot
    loty.forEach((lot) => {
      const dataObj = new Date(lot.czas_wylotu);

      ////////// 2. ZLICZANIE LOTÓW NA DZISIAJ ///////////////////
      if (dataObj.toLocaleDateString("pl-PL") === dzisiajFormat) {
        liczbaLotowDzisiaj++;
      }

      const dataFormat = dataObj.toLocaleDateString("pl-PL", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });

      const czasFormat = dataObj.toLocaleTimeString("pl-PL", {
        hour: "2-digit", //2 cyfry zawsze
        minute: "2-digit",
      });

      const maxMiejsc = 296;
      const wolne = lot.wolne_miejsca;
      const zajete = maxMiejsc - wolne;
      const procentZajetosci = Math.max(
        0,
        Math.min(100, Math.round((zajete / maxMiejsc) * 100)),
      );

      //  PASEK //
      let kolorPaska = "#2ecc71";
      if (procentZajetosci > 90) kolorPaska = "#e74c3c";
      else if (procentZajetosci > 70) kolorPaska = "#f39c12";

      const cena = lot.cena_bazowa ? lot.cena_bazowa + " PLN" : "Brak";

      const wiersz = `
              <tr>
                <td><strong>✈️ ${lot.numer_lotu}</strong></td>
                <td>ID: ${lot.id_lotniska_wylotu} &rarr; ID: ${lot.id_lotniska_przylotu}</td>
                <td>
                  ${dataFormat}<br>
                  <small style="color: #7f8c8d;">${czasFormat}</small>
                </td>
                <td>Samolot ID: ${lot.id_samolotu}</td>
                <td>
                  <div class="progress-bg">
                  <div class ="progress-fill" style="width: ${procentZajetosci}%; background-color:${kolorPaska};"></div>
                </div>
                <small style = "color: #7f8c8d;" > Wolne: <strong>${wolne}</strong> (Zajętość: ${procentZajetosci}%)</small>
                </td>
                <td><strong>${cena}</strong></td>
                <td>
                  <button class="btn-tabela" onclick="otworzZaloge(${lot.id}, '${lot.numer_lotu}')">Załoga &gt;</button>
                </td>
              </tr>
              `;

      // Doklejanie wygenerowanego wiersza na koniec tabeli
      tabela.innerHTML += wiersz;
    });

    // WYŚWIETLENIE POLICZONYCH DZISIEJSZYCH LOTÓW (KAFELKI)
    document.getElementById("stat-loty-dzisiaj").innerHTML = liczbaLotowDzisiaj;
  } catch (error) {
    console.error("Błąd podczas pobierania lotów:", error);

    document.getElementById("tabela-lotow").innerHTML = `
              <tr>
                <td colspan="7" style="text-align:center; color:red;">
                  Nie udało sie pobrać danych serwera. Serwer działa?
                </td>
              </tr>
            `;
  }
}

// FUNKCJA PRZEŁĄCZAJĄCA WIDOKI (Single page Application) /////////////////////
function zmienWidok(idWidoku) {
  // wszytsko najpierw ukryte
  document.getElementById("dashboard").classList.add("ukryty");
  document.getElementById("zaloga").classList.add("ukryty");
  document.getElementById("katalog").classList.add("ukryty");

  // wybrana klasa jest pokazana
  document.getElementById(idWidoku).classList.remove("ukryty");
}

// OBSŁUGA KLIKNIĘCIA W TABELI
function otworzZaloge(idLotu, numer_lotu) {
  document.getElementById("tytul-zalogi").innerHTML =
    "Zarządzanie załogą (Lot: " + numer_lotu + ")";

  // przełączenie widoku
  zmienWidok("zaloga");
}

///////////// FUNKCJE JS DLA MODALA I WYSYŁANIA POST: /////////////

function otworzModal() {
  document.getElementById("modal-dodaj").classList.remove("ukryty");
}

function zamknijModal() {
  document.getElementById("modal-dodaj").classList.add("ukryty");
  document.getElementById("formularz-lotu").reset(); // czyszczenie po anulowaniu
}

async function dodajLot(event) {
  event.preventDefault(); // blokada odświeżenia strony po naciśnięciu "Zapisz"

  // struktura JSON
  const daneLotu = {
    numer_lotu: document.getElementById("nowy-numer").value,
    id_samolotu: 1,
    id_lotniska_wylotu: parseInt(document.getElementById("nowy-wylot").value),
    id_lotniska_przylotu: parseInt(
      document.getElementById("nowy-przylot").value,
    ),
    czas_wylotu: document.getElementById("nowy-czas").value + ":00",
    czas_przylotu: document.getElementById("nowy-czas").value + ":00",
    cena_bazowa: parseFloat(document.getElementById("nowa-cena").value),
    wolne_miejsca: parseInt(document.getElementById("nowe-miejsca").value),
  };

  try {
    //  Wysyłanie zapytania POST do FastAPI
    const odpowiedz = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(daneLotu),
    });

    if (odpowiedz.ok) {
      alert("✅ Lot został pomyślnie dodany!");
      zamknijModal();
      pobierzloty();
    } else {
      alert(
        "Błąd: Upewnij się, że dane są poprawne. ID lotnisk musza istnieć w bazie!",
      );
    }
  } catch (error) {
    console.error("Błąd sieci:", error);
    alert("❌ Błąd połączenia z serwerem.");
  }
}

// automatyczne uruchomienie pobierania lotów po otwarciu strony
window.onload = pobierzloty;
