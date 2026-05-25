// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// I. ZMIENNE GLOBALNE
// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

// krok 1. Podłączenie URL backendu
const API_URL = "http://127.0.0.1:8000/operacje/loty";

// Zmienne do sekcji 'Zarządzanie załogą'
let pobraneLoty = [];
let wybraneIdPracownikow = [];
let aktualnyIdLotu = null;

let poczatkoweIdPracownikow = []; // dla usuwania z harmonogramu

const slownikLotnisk = {
  1: "WAW",
  2: "KRK",
  3: "GDN",
  4: "WRO",
  5: "POZ",
  6: "KTW",
  7: "LHR",
  8: "CDG",
  9: "FRA",
  10: "AMS",
  33: "JFK",
  34: "LAX",
  41: "DBX",
};

// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// II. DASHBOARD - POBIERANIE I WYŚWIETLANIE LOTÓW
// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

// async/await dlatego, że zapytanie do bazy (fetch) trwa chwilę i przeglądarka czeka
async function pobierzloty() {
  try {
    // Żądanie GET do backendu:
    const odpowiedz = await fetch(API_URL);

    // RAW na obiekt JSON:
    const loty = await odpowiedz.json();

    // zapis do zminnej globalnej (potrzbne do załogi)
    pobraneLoty = loty;

    const tabela = document.getElementById("tabela-lotow");
    tabela.innerHTML = ""; //Wyczyszczenie napisu ładowania

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

// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// III. PRZEŁĄCZANIE WIDOKÓW
// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

// FUNKCJA PRZEŁĄCZAJĄCA WIDOKI (Single page Application) /////////////////////
function zmienWidok(idWidoku) {
  // wszytsko najpierw ukryte
  document.getElementById("dashboard").classList.add("ukryty");
  document.getElementById("zaloga").classList.add("ukryty");
  document.getElementById("katalog").classList.add("ukryty");

  // wybrana klasa jest pokazana
  document.getElementById(idWidoku).classList.remove("ukryty");
}

// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// IV. NOWY LOT (MODAL)
// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

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

// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// V. ZARZĄDZANIE ZAŁOGĄ
// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

// OBSŁUGA KLIKNIĘCIA W TABELI
async function otworzZaloge(idLotu) {
  aktualnyIdLotu = idLotu;
  wybraneIdPracownikow = [];
  zmienWidok("zaloga");

  // szczegóły wybranego lotu z pobranej listy
  const lot = pobraneLoty.find((l) => l.id === idLotu);
  if (!lot) return;

  document.getElementById("zaloga-numer-lotu").innerText = lot.numer_lotu;
  document.getElementById("zaloga-samolot").innerText =
    `ID Samolotu: ${lot.id_samolotu}`;

  const dataObj = new Date(lot.czas_wylotu);
  document.getElementById("zaloga-data").innerHTML = dataObj.toLocaleDateString(
    "pl-PL",
    { day: "numeric", month: "long", year: "numeric" },
  );

  document.getElementById("zaloga-wylot-kod").innerText =
    slownikLotnisk[lot.id_lotniska_wylotu] || `L-${lot.id_lotniska_wylotu}`;
  document.getElementById("zaloga-wylot-id").innerText =
    `ID: ${lot.id_lotniska_wylotu}`;
  document.getElementById("zaloga-przylot-kod").innerText =
    slownikLotnisk[lot.id_lotniska_przylotu] || `L-${lot.id_lotniska_przylotu}`;
  document.getElementById("zaloga-przylot-id").innerText =
    `ID: ${lot.id_lotniska_przylotu}`;

  await pobierzPracownikow();
}

async function pobierzPracownikow() {
  try {
    // 1. Pobieranie wszystkich poracowników
    const odpPracownicy = await fetch(
      "http://127.0.0.1:8000/operacje/pracownicy",
    );
    const pracownicy = await odpPracownicy.json();

    // 2. Pobieranie harmonogramu
    const odpHarmonogram = await fetch(
      "http://127.0.0.1:8000/operacje/harmonogram",
    );
    const harmonogram = await odpHarmonogram.json();

    // 3. Filtrowanie harmonogreamu tylko dla aktualnego lotu
    wybraneIdPracownikow = harmonogram
      .filter((wpis) => wpis.id_lotu === aktualnyIdLotu)
      .map((wpis) => wpis.id_pracownika);

    // DODATKOWO: Zapis stanu początkowego (kopia) do porównania przy zapisie (dla delete)
    poczatkoweIdPracownikow = [...wybraneIdPracownikow];

    const kontenerPilotow = document.getElementById("lista-pilotow");
    const kontenerPersonelu = document.getElementById("lista-personelu");

    kontenerPilotow.innerHTML = "";
    kontenerPersonelu.innerHTML = "";

    pracownicy.forEach((p) => {
      const inicjaly =
        p.imie.charAt(0).toUpperCase() + p.nazwisko.charAt(0).toUpperCase();
      const toPilot =
        p.stanowisko.toLowerCase().includes("kapitan") ||
        p.stanowisko.toLowerCase().includes("oficer");

      // 4. Jeżeli ID pracownika jest w tabeli wybranych dosatje klasę 'wybrany'
      const czyWybrany = wybraneIdPracownikow.includes(p.id) ? "wybrany" : "";

      const kartaHTML = `
      <div class="pracownik-karta ${czyWybrany}" id="pracownik-${p.id}" onclick="zaznaczPracownika(${p.id})">
      <div class="inicjaly">${inicjaly}</div>
      <div class="pracownik-dane">
        <strong>${p.imie} ${p.nazwisko}</strong>
        <small>${p.stanowisko} • ${p.numer_licencji}</small> 
      </div>
      <div class="ikona-check"></div>
      </div>
      `;

      if (toPilot) kontenerPilotow.innerHTML += kartaHTML;
      else kontenerPersonelu.innerHTML += kartaHTML;
    });

    aktualizujLiczniki();
  } catch (error) {
    console.error("Błąd ładowania pracowników:", error);
  }
}

function zaznaczPracownika(idPracownika) {
  const element = document.getElementById(`pracownik-${idPracownika}`);

  if (wybraneIdPracownikow.includes(idPracownika)) {
    wybraneIdPracownikow = wybraneIdPracownikow.filter(
      (id) => id !== idPracownika,
    );
    element.classList.remove("wybrany");
  } else {
    wybraneIdPracownikow.push(idPracownika);
    element.classList.add("wybrany");
  }

  aktualizujLiczniki();
}

function aktualizujLiczniki() {
  const wybraniPiloci = document.querySelectorAll(
    "#lista-pilotow .pracownik-karta.wybrany",
  ).length;

  const wybranyPersonel = document.querySelectorAll(
    "#lista-personelu .pracownik-karta.wybrany",
  ).length;

  document.getElementById("licznik-pilotow").innerHTML =
    `Wybrano: ${wybraniPiloci}`;
  document.getElementById("licznik-personelu").innerText =
    `Wybrano: ${wybranyPersonel}`;
}

async function zapiszZaloge() {
  try {
    // kogo dodać a kogo usunać - 'doDodania' i 'DoUsuniecia'
    const doDodania = wybraneIdPracownikow.filter(
      (id) => !poczatkoweIdPracownikow.includes(id),
    );

    const doUsuniecia = poczatkoweIdPracownikow.filter(
      (id) => !wybraneIdPracownikow.includes(id),
    );

    // wysłanie zapytania delete dla odznaczonych pracowników
    for (const idPrac of doUsuniecia) {
      // query params w URL przekazują backendowi - który lot i pracownika usunąć
      await fetch(
        `http://127.0.0.1:8000/operacje/harmonogram?id_lotu=${aktualnyIdLotu}&id_pracownika=${idPrac}`,
        {
          method: "DELETE",
        },
      );
    }

    // wysyłanie zapytania POST dla nowo oznaczonych pracowników
    for (const idPrac of doDodania) {
      const payload = {
        id_lotu: aktualnyIdLotu,
        id_pracownika: idPrac,
      };

      await fetch("http://127.0.0.1:8000/operacje/harmonogram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    alert("✅ Załoga została pomyślnie zaktualizowana!");
    zmienWidok("dashboard");
  } catch (error) {
    console.error("Błąd zapisu:", error);
    alert("❌ Wystąpił błąd podczas zapisywania załogi.");
  }
}

// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// VI. START - automatyczne uruchomienie pobierania lotów po otwarciu strony
// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

window.onload = pobierzloty;

// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// VII. WYLOGOWYWANIE
// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

function wyloguj() {
  const czyNapewno = confirm(
    "Czy na pewno chcesz się wylogować z panelu administratora?",
  );

  if (czyNapewno) {
    // localStorage.removeItem("token");
    // sessionStorage.clear();

    // przekierowanie na stronę główną:
    window.location.href = "index.html";
  }
}
