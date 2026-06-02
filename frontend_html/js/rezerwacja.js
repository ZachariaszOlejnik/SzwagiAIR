// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// I. ZMIENNE GLOBALNE
// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

const API = "http://127.0.0.1:8000";

// ID lotu pobierane z adresu URL (np. rezerwacja.html?lot_id=5)
const params = new URLSearchParams(window.location.search);
const lotId = params.get("lot_id");

// dane wypełniane po pobraniu z serwera
let cenaBiletu = 0; // cena bazowa wybranego lotu
let idPasazera = null; // ID zalogowanego pasażera

// login zalogowanego użytkownika (z localStorage)
const loginUzytkownika = localStorage.getItem("login");

// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// II. SPRAWDZENIE LOGOWANIA
// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

// bez zalogowania nie ma rezerwacji - przekierowanie na logowanie
if (!loginUzytkownika) {
  alert("Musisz być zalogowany, aby zarezerwować lot!");
  window.location.href = "index.html";
}

// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// III. POBRANIE SZCZEGÓŁÓW LOTU
// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

async function zaladujLot() {
  if (!lotId) {
    document.getElementById("lotInfo").innerHTML =
      "<h3>Błąd</h3><p>Nie wybrano lotu. Wróć do wyszukiwarki.</p>";
    return;
  }

  try {
    // pobieramy wszystkie loty i lotniska równolegle
    const [lotyResp, lotniskaResp] = await Promise.all([
      fetch(`${API}/operacje/loty`),
      fetch(`${API}/operacje/lotniska`),
    ]);
    const loty = await lotyResp.json();
    const lotniska = await lotniskaResp.json();

    // mapa ID -> lotnisko (do zamiany ID na kod IATA i miasto)
    const mapaLotnisk = {};
    lotniska.forEach((l) => (mapaLotnisk[l.id] = l));

    // szukamy naszego lotu po ID
    const lot = loty.find((l) => l.id == lotId);
    if (!lot) {
      document.getElementById("lotInfo").innerHTML =
        "<h3>Błąd</h3><p>Lot o podanym ID nie istnieje.</p>";
      return;
    }

    const wylot = mapaLotnisk[lot.id_lotniska_wylotu];
    const przylot = mapaLotnisk[lot.id_lotniska_przylotu];
    cenaBiletu = parseFloat(lot.cena_bazowa);

    const wylotData = new Date(lot.czas_wylotu).toLocaleString("pl-PL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    document.getElementById("lotInfo").innerHTML = `
      <h3>Wybrany lot</h3>
      <div class="trasa">${wylot.kod} → ${przylot.kod}</div>
      <div class="szczegoly">
        Lot ${lot.numer_lotu}<br>
        ${wylot.miasto} → ${przylot.miasto}<br>
        Wylot: ${wylotData}<br>
        Wolne miejsca: ${lot.wolne_miejsca}
      </div>
    `;

    przeliczCene();
  } catch (error) {
    console.error("Błąd ładowania lotu:", error);
    document.getElementById("lotInfo").innerHTML =
      "<h3>Błąd</h3><p>Nie udało się pobrać danych lotu. Czy serwer działa?</p>";
  }
}

// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// IV. POBRANIE ID PASAŻERA (po emailu = login)
// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

async function pobierzIdPasazera() {
  try {
    const resp = await fetch(`${API}/sprzedaz/pasazerowie`);
    const pasazerowie = await resp.json();
    // login == email, więc szukamy pasażera po emailu
    const pasazer = pasazerowie.find((p) => p.email === loginUzytkownika);
    if (pasazer) {
      idPasazera = pasazer.id;
    }
    // wstawiamy login do pola "zalogowany jako"
    document.getElementById("loginPasazera").value = loginUzytkownika;
  } catch (error) {
    console.error("Błąd pobierania pasażera:", error);
  }
}

// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// V. POBRANIE KATALOGU USŁUG
// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

async function zaladujUslugi() {
  try {
    const resp = await fetch(`${API}/sprzedaz/katalog_uslug`);
    const uslugi = await resp.json();

    const lista = document.getElementById("uslugiLista");
    if (uslugi.length === 0) {
      lista.innerHTML =
        "<p style='color:#888;font-size:14px;'>Brak dostępnych usług.</p>";
      return;
    }

    // budujemy checkboxy dla każdej usługi z katalogu
    lista.innerHTML = uslugi
      .map(
        (u) => `
      <label class="opcja">
        <input type="checkbox" class="usluga-check" value="${u.cena_standardowa}" data-id="${u.id}" />
        <span class="nazwa">${u.nazwa_uslugi}</span>
        <span class="cena">+${u.cena_standardowa} PLN</span>
      </label>
    `,
      )
      .join("");

    // po zmianie usługi przeliczamy cenę
    document.querySelectorAll(".usluga-check").forEach((cb) => {
      cb.addEventListener("change", przeliczCene);
    });
  } catch (error) {
    console.error("Błąd ładowania usług:", error);
    document.getElementById("uslugiLista").innerHTML =
      "<p style='color:red;font-size:14px;'>Błąd ładowania usług.</p>";
  }
}

// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// VI. KALKULATOR CENY (live)
// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

function przeliczCene() {
  // bagaż (radio)
  const bagazWybrany = document.querySelector('input[name="bagaz"]:checked');
  const cenaBagazu = bagazWybrany ? parseFloat(bagazWybrany.value) : 0;

  // usługi (checkboxy)
  let cenaUslug = 0;
  document.querySelectorAll(".usluga-check:checked").forEach((cb) => {
    cenaUslug += parseFloat(cb.value);
  });

  const razem = cenaBiletu + cenaBagazu + cenaUslug;

  document.getElementById("cenaBiletu").innerText =
    cenaBiletu.toFixed(2) + " PLN";
  document.getElementById("cenaBagazu").innerText =
    cenaBagazu.toFixed(2) + " PLN";
  document.getElementById("cenaUslug").innerText =
    cenaUslug.toFixed(2) + " PLN";
  document.getElementById("cenaRazem").innerText = razem.toFixed(2) + " PLN";
}

// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// VII. UTWORZENIE REZERWACJI
// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

async function utworzRezerwacje() {
  const komunikat = document.getElementById("komunikat");
  const btn = document.getElementById("rezerwujBtn");
  const numerMiejsca = document.getElementById("numerMiejsca").value.trim();

  // walidacja
  if (!numerMiejsca) {
    komunikat.style.color = "#ffcccc";
    komunikat.innerText = "Podaj numer miejsca!";
    return;
  }
  if (!idPasazera) {
    komunikat.style.color = "#ffcccc";
    komunikat.innerText =
      "Nie znaleziono Twojego konta pasażera. Zaloguj się ponownie.";
    return;
  }

  btn.disabled = true;
  komunikat.style.color = "white";
  komunikat.innerText = "Tworzenie rezerwacji...";

  try {
    // --- KROK 1: rezerwacja (cena bazowa - bagaż i usługi dolicza backend) ---
    const rezerwacjaResp = await fetch(`${API}/sprzedaz/rezerwacje`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"), // <-- DODANE
      },
      body: JSON.stringify({
        id_pasazera: idPasazera,
        typ_podrozy: "w_jedna_strone",
        cena_calkowita: cenaBiletu,
        status: "oczekuje",
      }),
    });

    // ------------------ DODAJĘ IF'a awaryjnego- Mateusz ---------------
    if (!rezerwacjaResp.ok) {
      document.getElementById("komunikat").innerHTML =
        "Błąd: Nie udało się połączyć z bazą!";
      return; // żeby od razu zatrzymac funkcję - nie przejdzie do kroku 2
    }

    const rezerwacja = await rezerwacjaResp.json();

    // ... weryfikacja odpowiedzi pozostaje bez zmian ...

    // --- KROK 2: odcinek (lot + miejsce) ---
    const odcinekResp = await fetch(`${API}/sprzedaz/odcinki_rezerwacji`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"), // <-- DODANE
      },
      body: JSON.stringify({
        id_rezerwacji: rezerwacja.id,
        id_lotu: parseInt(lotId),
        kolejnosc: 1,
        numer_miejsca: numerMiejsca,
      }),
    });
    // ... weryfikacja odpowiedzi pozostaje bez zmian ...

    // --- KROK 3: bagaż (jeśli płatny) ---
    const bagazWybrany = document.querySelector('input[name="bagaz"]:checked');
    const cenaBagazu = parseFloat(bagazWybrany.value);
    if (cenaBagazu > 0) {
      await fetch(`${API}/sprzedaz/bagaze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"), // <-- DODANE
        },
        body: JSON.stringify({
          id_rezerwacji: rezerwacja.id,
          typ: bagazWybrany.dataset.typ,
          cena: cenaBagazu,
        }),
      });
    }

    // --- KROK 4: usługi dodatkowe ---
    const uslugiZaznaczone = document.querySelectorAll(".usluga-check:checked");
    for (const cb of uslugiZaznaczone) {
      await fetch(`${API}/sprzedaz/uslugi_rezerwacji`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"), // <-- DODANE
        },
        body: JSON.stringify({
          id_rezerwacji: rezerwacja.id,
          id_uslugi: parseInt(cb.dataset.id),
        }),
      });
    }

    // --- SUKCES ---
    komunikat.style.color = "#aaffaa";
    komunikat.innerText = `Rezerwacja #${rezerwacja.id} utworzona! Przekierowanie do płatności...`;

    setTimeout(() => {
      window.location.href = `platnosc.html?rezerwacja_id=${rezerwacja.id}`;
    }, 2000);
  } catch (error) {
    komunikat.style.color = "#ffcccc";
    komunikat.innerText = "Błąd: " + error.message;
    btn.disabled = false;
  }
}

// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// VIII. START - podpięcie zdarzeń i załadowanie danych
// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

// przeliczanie ceny po zmianie bagażu
document.querySelectorAll('input[name="bagaz"]').forEach((rb) => {
  rb.addEventListener("change", przeliczCene);
});

// obsługa przycisku Rezerwuj
document
  .getElementById("rezerwujBtn")
  .addEventListener("click", utworzRezerwacje);

// ładowanie danych przy otwarciu strony
zaladujLot();
zaladujUslugi();
pobierzIdPasazera();
