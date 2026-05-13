/**
 * Тойға қатысу формасынан деректерді Google Sheets-ке жазады.
 *
 * ОРНАТУ:
 * 1) Таблица: https://docs.google.com/spreadsheets/d/1g6DMfHaPhjkHdKIRqsCaVcUgLgJrRgeDY9yN5j7UZJE/edit
 * 2) Extensions → Apps Script — жаңа жоба, осы файлдағы кодты қойыңыз.
 * 3) Deploy → New deployment → Type: Web app
 *    - Execute as: Me
 *    - Who has access: Anyone (қонақтар авторизациясыз жібереді)
 * 4) Deploy басып, шыққан Web App URL-ді көшіріңіз де `js/main.js` ішіндегі RSVP_WEBAPP_URL-ға қойыңыз.
 *
 * Бірінші жол (тақырып) бос болса, скрипт автоматты қояды:
 * Уақыт | Аты-жөні | Қатысу | Адам саны
 */
var RSVP_SPREADSHEET_ID = '1g6DMfHaPhjkHdKIRqsCaVcUgLgJrRgeDY9yN5j7UZJE';
var RSVP_SHEET_NAME = 'Sheet1';

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, message: 'RSVP endpoint' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var raw = e.postData && e.postData.contents;
    if (!raw) {
      return jsonOut({ ok: false, error: 'empty_body' });
    }

    var data = JSON.parse(raw);
    var hp = (data.website || '').toString().trim();
    if (hp) {
      return jsonOut({ ok: false, error: 'spam' });
    }

    var name = (data.name || '').toString().trim();
    var attendance = (data.attendance || '').toString().trim();
    var guests = parseInt(data.guestCount, 10);
    if (isNaN(guests) || guests < 0) guests = 0;
    if (guests > 99) guests = 99;

    if (!name) {
      return jsonOut({ ok: false, error: 'name_required' });
    }
    if (!attendance) {
      return jsonOut({ ok: false, error: 'attendance_required' });
    }

    var ss = SpreadsheetApp.openById(RSVP_SPREADSHEET_ID);
    var sh = ss.getSheetByName(RSVP_SHEET_NAME);
    if (!sh) {
      sh = ss.getSheets()[0];
    }

    ensureHeaderRow_(sh);

    sh.appendRow([new Date(), name, attendance, guests]);

    return jsonOut({ ok: true, message: 'OK' });
  } catch (err) {
    return jsonOut({ ok: false, error: String(err.message || err) });
  }
}

function ensureHeaderRow_(sh) {
  var a1 = sh.getRange(1, 1).getValue();
  if (a1 === '' || a1 === null || String(a1).trim() === '') {
    sh.getRange(1, 1, 1, 4).setValues([['Уақыт', 'Аты-жөні', 'Қатысу', 'Адам саны']]);
    sh.setFrozenRows(1);
    var header = sh.getRange(1, 1, 1, 4);
    header.setFontWeight('bold');
    header.setBackground('#eddfc8');
  }
}

function jsonOut(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
