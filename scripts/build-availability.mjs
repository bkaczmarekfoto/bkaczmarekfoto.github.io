#!/usr/bin/env node
/**
 * build-availability.mjs — z Kalendarza Google buduje assets/data/availability.json
 *
 * Zasada: dzień jest WOLNY, jeśli Bartek oznaczył go wydarzeniem, którego tytuł
 * zaczyna się od „Wolne” (albo „Wolny”, „Dostępny”), i tego dnia nie ma żadnego
 * innego wydarzenia, które blokuje czas. Wszystko inne jest niedostępne.
 *
 * Do pliku trafiają wyłącznie daty (i ewentualnie godziny z wydarzenia „Wolne”) —
 * bez tytułów, opisów i miejsc innych wydarzeń.
 *
 * Bez zależności — wystarczy Node 18+.
 *
 * Użycie:
 *   GCAL_ICS_URL="https://calendar.google.com/calendar/ical/.../basic.ics" node scripts/build-availability.mjs
 *   node scripts/build-availability.mjs --ics scripts/test/przyklad.ics --today 2026-10-12 --demo --force
 *
 * Opcje:
 *   --ics <plik>       lokalny plik .ics zamiast GCAL_ICS_URL
 *   --out <plik>       plik wynikowy (domyślnie assets/data/availability.json)
 *   --today RRRR-MM-DD  „dzisiaj” (do testów)
 *   --months <n>       ile miesięcy do przodu (domyślnie 12)
 *   --demo             oznacz dane jako przykładowe
 *   --force            zapisz nawet bez zmian
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';

const TZ = 'Europe/Warsaw';
const MARKER = /^\s*(wolne|wolny|wolna|dostepne|dostepny|dostepna)\b/;
const HEARTBEAT_DAYS = 7; // zapisz plik co najmniej raz na tydzień (strona wykrywa zastój po 9 dniach)

/* ── CLI ─────────────────────────────────────────────────── */
const args = process.argv.slice(2);
const opt = name => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? undefined : (args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true);
};
const OUT    = opt('out') || 'assets/data/availability.json';
const MONTHS = Number(opt('months') || 12);

/* ── Strefy czasowe ──────────────────────────────────────── */
const fmtCache = new Map();
function partsIn(ms, tz) {
  if (!fmtCache.has(tz)) {
    fmtCache.set(tz, new Intl.DateTimeFormat('en-US', {
      timeZone: tz, hourCycle: 'h23',
      year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit',
    }));
  }
  const p = Object.fromEntries(fmtCache.get(tz).formatToParts(new Date(ms)).map(x => [x.type, x.value]));
  return { y: +p.year, m: +p.month, d: +p.day, h: +p.hour, mi: +p.minute, s: +p.second };
}
function tzOffset(ms, tz) {
  const p = partsIn(ms, tz);
  return Date.UTC(p.y, p.m - 1, p.d, p.h, p.mi, p.s) - Math.floor(ms / 1000) * 1000;
}
function zonedToUtc(y, m, d, h, mi, s, tz) {
  const guess = Date.UTC(y, m - 1, d, h, mi, s);
  const off1 = tzOffset(guess - tzOffset(guess, tz), tz);
  return guess - off1;
}
const validTz = tz => { try { partsIn(0, tz); return tz; } catch { return TZ; } };

/* ── Daty jako numer dnia (UTC, bez stref) ───────────────── */
const DAY = 864e5;
const dayNum  = (y, m, d) => Date.UTC(y, m - 1, d) / DAY;
const fromNum = n => { const t = new Date(n * DAY); return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate() }; };
const keyOf   = n => { const { y, m, d } = fromNum(n); return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`; };
const numOfKey = k => { const [y, m, d] = k.split('-').map(Number); return dayNum(y, m, d); };
const dow     = n => (new Date(n * DAY).getUTCDay() + 6) % 7; // pon = 0
const daysInMonth = (y, m) => new Date(Date.UTC(y, m, 0)).getUTCDate();
const warsawDayNum = ms => { const p = partsIn(ms, TZ); return dayNum(p.y, p.m, p.d); };
const hm = ms => { const p = partsIn(ms, TZ); return `${String(p.h).padStart(2, '0')}:${String(p.mi).padStart(2, '0')}`; };

/* ── Parser iCalendar ────────────────────────────────────── */
function parseIcs(text) {
  const lines = text.replace(/\r\n/g, '\n').replace(/\n[ \t]/g, '').split('\n');
  const events = [];
  let cur = null;
  let depth = 0; // pomijamy VALARM itp. wewnątrz VEVENT
  for (const line of lines) {
    if (line === 'BEGIN:VEVENT') { cur = { exdate: [] }; depth = 0; continue; }
    if (!cur) continue;
    if (line.startsWith('BEGIN:')) { depth++; continue; }
    if (line.startsWith('END:') && depth > 0) { depth--; continue; }
    if (line === 'END:VEVENT') { events.push(cur); cur = null; continue; }
    if (depth > 0) continue;

    const colon = line.search(/:(?=(?:[^"]*"[^"]*")*[^"]*$)/);
    if (colon < 0) continue;
    const [name, ...paramList] = line.slice(0, colon).split(';');
    const value = line.slice(colon + 1);
    const params = Object.fromEntries(paramList.map(p => {
      const [k, v = ''] = p.split('=');
      return [k.toUpperCase(), v.replace(/^"|"$/g, '')];
    }));

    switch (name.toUpperCase()) {
      case 'UID':           cur.uid = value; break;
      case 'SUMMARY':       cur.summary = value.replace(/\\n/gi, ' ').replace(/\\([,;\\])/g, '$1'); break;
      case 'STATUS':        cur.status = value.toUpperCase(); break;
      case 'TRANSP':        cur.transp = value.toUpperCase(); break;
      case 'DTSTART':       cur.start = parseDate(value, params); break;
      case 'DTEND':         cur.end = parseDate(value, params); break;
      case 'DURATION':      cur.duration = parseDuration(value); break;
      case 'RRULE':         cur.rrule = Object.fromEntries(value.split(';').map(p => p.split('='))); break;
      case 'RECURRENCE-ID': cur.recurrenceId = parseDate(value, params); break;
      case 'EXDATE':        value.split(',').forEach(v => cur.exdate.push(parseDate(v, params))); break;
    }
  }
  return events;
}

// Zwraca { allDay, day } albo { allDay:false, ms, tz, wall:{y,m,d,h,mi,s} }
function parseDate(value, params = {}) {
  const v = value.trim();
  if (params.VALUE === 'DATE' || /^\d{8}$/.test(v)) {
    return { allDay: true, day: dayNum(+v.slice(0, 4), +v.slice(4, 6), +v.slice(6, 8)) };
  }
  const m = v.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z?)$/);
  if (!m) throw new Error(`Nieznany format daty: ${value}`);
  const [, y, mo, d, h, mi, s, z] = m.map((x, i) => (i && i < 7 ? +x : x));
  const tz = z ? 'UTC' : validTz(params.TZID || TZ);
  const ms = z ? Date.UTC(y, mo - 1, d, h, mi, s) : zonedToUtc(y, mo, d, h, mi, s, tz);
  // Rekurencję liczymy w czasie lokalnym wydarzenia (poprawnie przez zmianę czasu)
  const wallTz = z ? TZ : tz;
  const w = partsIn(ms, wallTz);
  return { allDay: false, ms, tz: wallTz, wall: w };
}

function parseDuration(v) {
  const m = v.match(/^([+-])?P(?:(\d+)W)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/);
  if (!m) return 0;
  const [, sign, w = 0, d = 0, h = 0, mi = 0, s = 0] = m;
  const ms = ((+w * 7 + +d) * 24 * 3600 + +h * 3600 + +mi * 60 + +s) * 1000;
  return sign === '-' ? -ms : ms;
}

const occId = dt => (dt.allDay ? `D${dt.day}` : `T${dt.ms}`);

/* ── Rozwijanie RRULE ────────────────────────────────────── */
const WD = { MO: 0, TU: 1, WE: 2, TH: 3, FR: 4, SA: 5, SU: 6 };

function matchesByDay(n, list, scopeMonth) {
  const { y, m, d } = fromNum(n);
  return list.some(item => {
    const mm = item.match(/^([+-]?\d+)?(MO|TU|WE|TH|FR|SA|SU)$/);
    if (!mm || WD[mm[2]] !== dow(n)) return false;
    if (!mm[1] || !scopeMonth) return true;
    const ord = +mm[1];
    return ord > 0 ? Math.ceil(d / 7) === ord : Math.ceil((daysInMonth(y, m) - d + 1) / 7) === -ord;
  });
}

function* occurrences(ev, horizonDay) {
  const start = ev.start;
  const startDay = start.allDay ? start.day : dayNum(start.wall.y, start.wall.m, start.wall.d);
  const r = ev.rrule;
  if (!r) { yield start; return; }

  const freq     = r.FREQ;
  const interval = Number(r.INTERVAL || 1);
  const count    = r.COUNT ? Number(r.COUNT) : Infinity;
  const byDay    = r.BYDAY ? r.BYDAY.split(',') : null;
  const byMDay   = r.BYMONTHDAY ? r.BYMONTHDAY.split(',').map(Number) : null;
  const byMonth  = r.BYMONTH ? r.BYMONTH.split(',').map(Number) : null;
  let until = Infinity;
  if (r.UNTIL) {
    const u = parseDate(r.UNTIL, {});
    until = u.allDay ? (start.allDay ? u.day : (u.day + 1) * DAY - 1) : (start.allDay ? warsawDayNum(u.ms) : u.ms);
  }

  const s0 = fromNum(startDay);
  const weekStart0 = startDay - dow(startDay);
  let produced = 0;

  for (let n = startDay; n <= horizonDay && produced < count; n++) {
    const { y, m, d } = fromNum(n);
    let ok = false;
    switch (freq) {
      case 'DAILY':
        ok = (n - startDay) % interval === 0 && (!byDay || matchesByDay(n, byDay, false));
        break;
      case 'WEEKLY': {
        const weeks = (n - dow(n) - weekStart0) / 7;
        ok = weeks % interval === 0 && (byDay ? matchesByDay(n, byDay, false) : dow(n) === dow(startDay));
        break;
      }
      case 'MONTHLY': {
        const months = (y - s0.y) * 12 + (m - s0.m);
        if (months % interval !== 0) break;
        if (byDay) ok = matchesByDay(n, byDay, true);
        else if (byMDay) ok = byMDay.some(x => (x > 0 ? x === d : daysInMonth(y, m) + x + 1 === d));
        else ok = d === s0.d;
        break;
      }
      case 'YEARLY': {
        if ((y - s0.y) % interval !== 0) break;
        const monthOk = byMonth ? byMonth.includes(m) : m === s0.m;
        if (!monthOk) break;
        if (byDay) ok = matchesByDay(n, byDay, Boolean(byMonth));
        else if (byMDay) ok = byMDay.includes(d);
        else ok = d === s0.d;
        break;
      }
      default:
        if (n === startDay) ok = true; // nieobsługiwana reguła — tylko pierwsze wystąpienie
    }
    if (!ok) continue;

    let occ;
    if (start.allDay) {
      if (n > until) return;
      occ = { allDay: true, day: n };
    } else {
      const w = start.wall;
      const ms = zonedToUtc(y, m, d, w.h, w.mi, w.s, start.tz);
      if (ms > until) return;
      occ = { allDay: false, ms };
    }
    produced++;
    yield occ;
  }
}

/* ── Zakres dni zajmowanych przez wystąpienie ────────────── */
function spanOf(ev, occ) {
  if (occ.allDay) {
    let len = 1;
    if (ev.end?.allDay) len = Math.max(1, ev.end.day - ev.start.day);
    else if (ev.duration) len = Math.max(1, Math.round(ev.duration / DAY));
    return { from: occ.day, to: occ.day + len - 1, hours: null };
  }
  let dur = 0;
  if (ev.end && !ev.end.allDay) dur = ev.end.ms - ev.start.ms;
  else if (ev.duration) dur = ev.duration;
  const endMs = occ.ms + Math.max(0, dur);
  return {
    from: warsawDayNum(occ.ms),
    to: dur > 0 ? warsawDayNum(endMs - 1) : warsawDayNum(occ.ms),
    hours: dur > 0 ? `${hm(occ.ms)}–${hm(endMs)}` : null,
  };
}

const normalize = s => (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ł/g, 'l');

/* ── Główna logika ───────────────────────────────────────── */
function buildAvailability(events, todayKey, months) {
  const today = numOfKey(todayKey);
  const t = fromNum(today);
  const endMonth = t.m + months;
  const lastY = t.y + Math.floor((endMonth - 1) / 12);
  const lastM = ((endMonth - 1) % 12) + 1;
  const horizon = dayNum(lastY, lastM, daysInMonth(lastY, lastM));

  // Nadpisane pojedyncze wystąpienia (RECURRENCE-ID) wyłączamy z serii
  const overridden = new Map();
  for (const ev of events) {
    if (ev.recurrenceId && ev.uid) {
      if (!overridden.has(ev.uid)) overridden.set(ev.uid, new Set());
      overridden.get(ev.uid).add(occId(ev.recurrenceId));
    }
  }

  const markers = new Map(); // dzień → [godziny | null]
  const busy = new Set();

  for (const ev of events) {
    if (!ev.start || ev.status === 'CANCELLED') continue;
    const isMarker = MARKER.test(normalize(ev.summary));
    // „Pokaż jako dostępny” w Google = TRANSP:TRANSPARENT — takie wydarzenie nie blokuje dnia
    if (!isMarker && ev.transp === 'TRANSPARENT') continue;

    const skip = new Set(ev.exdate.map(occId));
    if (!ev.recurrenceId && overridden.has(ev.uid)) overridden.get(ev.uid).forEach(id => skip.add(id));

    for (const occ of occurrences(ev, horizon)) {
      if (skip.has(occId(occ))) continue;
      const span = spanOf(ev, occ);
      if (span.to < today || span.from > horizon) continue;
      for (let n = Math.max(span.from, today); n <= Math.min(span.to, horizon); n++) {
        if (isMarker) {
          if (!markers.has(n)) markers.set(n, []);
          markers.get(n).push(span.from === span.to ? span.hours : null);
        } else {
          busy.add(n);
        }
      }
    }
  }

  const free = [];
  const hours = {};
  for (const n of [...markers.keys()].sort((a, b) => a - b)) {
    if (busy.has(n)) continue;
    const key = keyOf(n);
    free.push(key);
    const h = markers.get(n);
    if (!h.includes(null)) hours[key] = [...new Set(h)].sort().join(', ');
  }

  return { timezone: TZ, to: keyOf(horizon), free, hours };
}

async function loadIcs() {
  const file = opt('ics');
  if (typeof file === 'string') return readFile(file, 'utf8');
  const url = process.env.GCAL_ICS_URL;
  if (!url) throw new Error('Brak GCAL_ICS_URL (sekret repozytorium) i opcji --ics.');
  const res = await fetch(url, { headers: { 'User-Agent': 'availability-bot' } });
  if (!res.ok) throw new Error(`Pobieranie kalendarza: HTTP ${res.status}`);
  const text = await res.text();
  if (!text.includes('BEGIN:VCALENDAR')) throw new Error('Odpowiedź nie jest plikiem iCalendar — sprawdź adres.');
  return text;
}

async function main() {
  const todayKey = typeof opt('today') === 'string'
    ? opt('today')
    : new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());

  const events = parseIcs(await loadIcs());
  const data = buildAvailability(events, todayKey, MONTHS);

  let previous = null;
  try { previous = JSON.parse(await readFile(OUT, 'utf8')); } catch { /* pierwszy raz */ }

  const comparable = d => JSON.stringify({ to: d.to, free: d.free, hours: d.hours, demo: Boolean(d.demo) });
  const result = { generated: new Date().toISOString(), ...data, ...(opt('demo') ? { demo: true } : {}) };
  const changed = !previous || comparable(previous) !== comparable(result);
  const ageDays = previous?.generated ? (Date.now() - Date.parse(previous.generated)) / DAY : Infinity;

  console.log(`Wydarzeń: ${events.length}, wolnych dni: ${data.free.length} (do ${data.to}).`);

  if (!changed && ageDays < HEARTBEAT_DAYS && !opt('force')) {
    console.log('Bez zmian — plik zostaje.');
    return;
  }
  await mkdir(dirname(OUT), { recursive: true });
  await writeFile(OUT, JSON.stringify(result, null, 2) + '\n');
  console.log(changed ? `Zapisano zmiany → ${OUT}` : `Odświeżono znacznik czasu → ${OUT}`);
}

main().catch(err => {
  console.error(`✗ ${err.message}`);
  process.exit(1);
});
