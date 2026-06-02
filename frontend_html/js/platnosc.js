// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// I. ZMIENNE
// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

const API = "http://127.0.0.1:8000";

// Wyciagniecie ID rezerwacji prosto z paska adresu - http://127.0.0.1:5500/frontend_html/platnosc.html?rezerwacja_id=21
const params = new URLSearchParams(window.location.search);
const idRezerwacji = params.get("rezerwacja_id");

let kwotaPlatnosci = 0;

// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// II. POBRANIE DANYCH DO WYŚWIETLENIA
// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

async function pobierzDane() {
  const odp = await fetch(`${API}/sprzedaz/rezerwacje/${idRezerwacji}`); // dane rezerwacji z backendu

  const rezerwacja = await odp.json(); // odpowiedź na obiekt JSON

  kwotaPlatnosci = rezerwacja.cena_calkowita;

  document.getElementById("platnoscInfo").innerHTML =
    `<h3>Do zapłaty: ${kwotaPlatnosci} PLN </h3>`;
}

// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// III. WYSŁANIE PŁATNOŚCI DO BAZY
// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
async function zaplac() {
  const metoda = document.getElementById("metodaPlatnosci").value; // wybór klienta z listy rozwijanej

  //   POST
  const odp = await fetch(`${API}/sprzedaz/platnosci`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",

      // -----------------  TOKEN JWT z localStorage ------------------
      Authorization: "Bearer " + localStorage.getItem("token"),
    },

    //   FORMAT PlatnoscCreate z schemas.py
    body: JSON.stringify({
      id_rezerwacji: parseInt(idRezerwacji), // żeby sie zgadzało ze schamatem  - int
      kwota: kwotaPlatnosci,
      metoda_platnosci: metoda,
      status_transakcji: "zakonczona", // od razu jako sukces
    }),
  });

  // \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
  // IV. OBSŁUGA WYNIKU
  // \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

  // czy sukces = komunikat 200 OK
  if (odp.ok) {
    document.getElementById("komunikat").innerHTML =
      "<span style='color: #28a745'>Zapłacono!</span>";
  } else {
    document.getElementById("komunikat").innerHTML =
      "<span style='color: red;'>Błąd płatności!</span>";
  }
}

// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// V. URUCHOMIENIE
// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

document.getElementById("oplacBtn").addEventListener("click", zaplac);

pobierzDane(); // przy wejściu na stronę od razu
