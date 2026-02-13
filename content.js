// TEST — sprawdź czy content.js ładuje się
console.log("🔥 content.js działa! (wersja z poprawką stanu po wczytaniu)");

const BUTTON_ID = "x-fixed-check-btn";

function injectButton() {
  if (document.getElementById(BUTTON_ID)) return;

  const btn = document.createElement("button");
  btn.id = BUTTON_ID;
  btn.textContent = "Ładowanie...";
  btn.style.cssText = `
    position: fixed;
    top: 15px;
    right: 15px;
    padding: 8px 12px;
    background: red;               /* chwilowo czerwony – potem zmieni się */
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 14px;
    z-index: 999999 !important;
    box-shadow: 0 2px 8px rgba(0,0,0,0.4);
  `;

  const target = document.body || document.documentElement;
  if (target) {
    target.appendChild(btn);
    console.log("Przycisk dodany do DOM");
    updateButtonState(btn);          // ← wywołujemy od razu po wstawieniu
  } else {
    console.warn("Nie znaleziono body/documentElement");
  }
}

async function updateButtonState(btn) {
  const match = location.pathname.match(/^\/([A-Za-z0-9_]{1,15})(?:\/|$)/i);
  const nick = match ? match[1].toLowerCase() : null;

  console.log("pathname:", location.pathname, "→ nick:", nick);

  // ZA KAŻDYM RAZEM pobieramy aktualny stan z storage
  const { checkedAccounts = [] } = await browser.storage.local.get("checkedAccounts");

  if (nick) {
    if (checkedAccounts.includes(nick)) {
      btn.style.background = "#28a745"; // zielony
      btn.textContent = "✔️ Sprawdzony";
    } else {
      btn.style.background = "#6c757d"; // szary
      btn.textContent = `Dodaj @${nick}`;
    }
  } else {
    btn.style.background = "#6c757d";
    btn.textContent = "Nie profil";
  }

  // listener tylko raz
  if (!btn.dataset.listenerAdded) {
    btn.addEventListener("click", async () => {
      if (!nick) {
        console.log("Kliknięcie → brak nicka");
        return;
      }

      let data = await browser.storage.local.get("checkedAccounts");
      let list = data.checkedAccounts || [];

      if (list.includes(nick)) {
        list = list.filter(x => x !== nick);
        console.log(`Usunięto @${nick}`);
      } else {
        list.push(nick);
        list.sort();
        console.log(`Dodano @${nick}`);
      }

      await browser.storage.local.set({ checkedAccounts: list });
      updateButtonState(btn);           // ← odśwież stan po każdej zmianie
    });

    btn.dataset.listenerAdded = "true";
  }
}

// Start
if (document.readyState !== "loading" && document.body) {
  injectButton();
} else {
  document.addEventListener("DOMContentLoaded", injectButton, { once: true });
}

// Obserwator zmian w DOM + interwał bezpieczeństwa
const observer = new MutationObserver(() => {
  if (!document.getElementById(BUTTON_ID)) {
    console.log("DOM zmieniony – przycisk zniknął → dodajemy ponownie");
    injectButton();
  }
});
observer.observe(document.documentElement || document, { childList: true, subtree: true });

setInterval(() => {
  if (!document.getElementById(BUTTON_ID)) {
    console.log("Interwał: przycisk zniknął → wstrzykujemy");
    injectButton();
  }
}, 1500);
