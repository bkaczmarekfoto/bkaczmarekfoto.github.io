/**
 * Synchronizacja: Kalendarz Google Bartka → strona bkaczmarekfoto.github.io
 *
 * Po każdej zmianie w kalendarzu (dodanie / edycja / usunięcie wydarzenia) skrypt
 * odczekuje kilka minut i uruchamia workflow „Strona i wolne terminy” na GitHubie.
 * Workflow pobiera kalendarz (tajny adres iCal) i aktualizuje wolne terminy na stronie.
 *
 * Kilka zmian w krótkim czasie = jedna aktualizacja (czekamy DELAY_MINUTES od pierwszej).
 * Opóźnienie daje też Google czas na odświeżenie adresu iCal.
 *
 * Instalacja (na koncie foto.bkaczmarek@gmail.com) — szczegóły w README.md projektu:
 *   1. script.google.com → Nowy projekt → wklej ten plik → Zapisz.
 *   2. Ustawienia projektu → Właściwości skryptu → dodaj GITHUB_TOKEN (token GitHub).
 *   3. Uruchom funkcję setup() i zaakceptuj uprawnienia.
 *   4. Uruchom testDispatch() i sprawdź zakładkę Actions na GitHubie.
 */

const CONFIG = {
  CALENDAR_ID: 'foto.bkaczmarek@gmail.com', // kalendarz, z którego jest tajny adres iCal
  REPO: 'bkaczmarekfoto/bkaczmarekfoto.github.io',
  WORKFLOW: 'pages.yml',
  BRANCH: 'main',
  DELAY_MINUTES: 3,
};

/** Jednorazowa konfiguracja: sprawdza token i kalendarz, zakłada wyzwalacz. */
function setup() {
  getToken_();

  const calendar = CalendarApp.getCalendarById(CONFIG.CALENDAR_ID);
  if (!calendar) throw new Error(`Nie znaleziono kalendarza ${CONFIG.CALENDAR_ID} — sprawdź CONFIG.CALENDAR_ID.`);

  ScriptApp.getProjectTriggers()
    .filter(t => ['onCalendarChange', 'dispatchSync'].includes(t.getHandlerFunction()))
    .forEach(t => ScriptApp.deleteTrigger(t));

  ScriptApp.newTrigger('onCalendarChange')
    .forUserCalendar(CONFIG.CALENDAR_ID)
    .onEventUpdated()
    .create();

  Logger.log(`Gotowe. Zmiany w kalendarzu „${calendar.getName()}” będą aktualizować stronę po ok. ${CONFIG.DELAY_MINUTES} min.`);
}

/** Wyzwalacz kalendarza — planuje jedną aktualizację, jeśli żadna nie czeka. */
function onCalendarChange() {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const pending = ScriptApp.getProjectTriggers().some(t => t.getHandlerFunction() === 'dispatchSync');
    if (!pending) {
      ScriptApp.newTrigger('dispatchSync')
        .timeBased()
        .after(CONFIG.DELAY_MINUTES * 60 * 1000)
        .create();
    }
  } finally {
    lock.releaseLock();
  }
}

/** Uruchamia workflow na GitHubie. Błąd = mail od Google do właściciela skryptu. */
function dispatchSync() {
  ScriptApp.getProjectTriggers()
    .filter(t => t.getHandlerFunction() === 'dispatchSync')
    .forEach(t => ScriptApp.deleteTrigger(t));

  const url = `https://api.github.com/repos/${CONFIG.REPO}/actions/workflows/${CONFIG.WORKFLOW}/dispatches`;
  const res = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    headers: {
      Authorization: `Bearer ${getToken_()}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    payload: JSON.stringify({ ref: CONFIG.BRANCH }),
    muteHttpExceptions: true,
  });

  const code = res.getResponseCode();
  if (code !== 204) {
    const hint = code === 401 ? ' Token wygasł lub jest błędny — wygeneruj nowy i podmień GITHUB_TOKEN.'
      : code === 403 || code === 404 ? ' Token nie ma dostępu do repo albo uprawnienia Actions: Read and write.'
      : '';
    throw new Error(`GitHub odpowiedział ${code}.${hint} ${res.getContentText().slice(0, 300)}`);
  }
  Logger.log('Uruchomiono aktualizację strony.');
}

/** Ręczny test — od razu uruchamia workflow (sprawdź zakładkę Actions na GitHubie). */
function testDispatch() {
  dispatchSync();
}

function getToken_() {
  const token = PropertiesService.getScriptProperties().getProperty('GITHUB_TOKEN');
  if (!token) throw new Error('Brak GITHUB_TOKEN: Ustawienia projektu → Właściwości skryptu → Dodaj właściwość.');
  return token.trim();
}
