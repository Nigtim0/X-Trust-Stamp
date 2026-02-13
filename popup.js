// popup.js

let currentFilter = '';

async function loadAndRender(filter = '') {
  currentFilter = filter.trim().toLowerCase();

  const { checkedAccounts = [] } = await browser.storage.local.get('checkedAccounts');
  
  // sortujemy raz – potem filtrujemy posortowaną tablicę
  const sorted = [...checkedAccounts].sort((a, b) => a.localeCompare(b));

  const filtered = currentFilter
    ? sorted.filter(nick => nick.toLowerCase().includes(currentFilter))
    : sorted;

  const list = document.getElementById('list');
  list.innerHTML = '';

  if (filtered.length === 0) {
    const li = document.createElement('li');
    li.className = 'empty';
    li.textContent = currentFilter 
      ? 'Brak pasujących nicków'
      : 'Brak sprawdzonych kont';
    list.appendChild(li);
    return;
  }

  filtered.forEach(nick => {
    const li = document.createElement('li');
    li.innerHTML = `
      <a href="https://x.com/${nick}" target="_blank">@${nick}</a>
      <button class="remove" data-nick="${nick}">usuń</button>
    `;
    list.appendChild(li);
  });
}

// Delegacja zdarzeń na cały #list – dużo wydajniejsze przy dużej liczbie elementów
document.getElementById('list').addEventListener('click', async e => {
  if (!e.target.classList.contains('remove')) return;

  const nick = e.target.dataset.nick;
  if (!nick) return;

  let { checkedAccounts = [] } = await browser.storage.local.get('checkedAccounts');
  checkedAccounts = checkedAccounts.filter(n => n !== nick);
  
  await browser.storage.local.set({ checkedAccounts });
  
  // odświeżamy z aktualnym filtrem
  loadAndRender(currentFilter);
}, false);

document.addEventListener('DOMContentLoaded', () => {
  // pierwsze wczytanie
  loadAndRender();

  // wyszukiwanie na żywo
  document.getElementById('search').addEventListener('input', e => {
    loadAndRender(e.target.value);
  });

  // opcjonalnie – fokus na pole wyszukiwania przy otwarciu popupu
  document.getElementById('search').focus();
});
