/** Тақырып қатарының нөмірі (1 = бірінші жол) */
const HEADER_ROW = 1;

/** «Келемін / Иә» деп есептелетін мәтіндер (қажетіне өзгертіңіз) */
const YES_VALUES = ['иә', 'yes', 'келемін', 'барамын', '+', '1', 'true'];

/**
 * Меню кесте ашылғанда
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Той қонақтары')
    .addItem('Тақырыпты безендіру', 'formatHeaderRow')
    .addItem('Бос жауаптарды бөлектеу (B бағаны)', 'highlightEmptyInColumnB')
    .addItem('Санақ: иә / жоқ', 'countYesNoSummary')
    .addSeparator()
    .addItem('Бөлектеуді тазалау', 'clearHighlights')
    .addToUi();
}

/**
 * Бірінші жолды тақырып ретінде қалыптастырады
 */
function formatHeaderRow() {
  var sheet = SpreadsheetApp.getActiveSheet();
  var lastCol = sheet.getLastColumn();
  if (lastCol < 1) return;

  var header = sheet.getRange(HEADER_ROW, 1, HEADER_ROW, lastCol);
  header
    .setFontFamily('Spectral')
    .setFontWeight('bold')
    .setFontSize(11)
    .setBackground('#f5ede0')
    .setFontColor('#6b5030')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle')
    .setWrap(true);

  sheet.setFrozenRows(1);
  sheet.autoResizeColumns(1, lastCol);
}

/**
 * B бағанындағы бос ұяшықтарды сарымен бөлектейді (өзгерту: colIdx)
 */
function highlightEmptyInColumnB() {
  var sheet = SpreadsheetApp.getActiveSheet();
  var colIdx = 2; // B = 2
  var lastRow = sheet.getLastRow();
  if (lastRow <= HEADER_ROW) {
    SpreadsheetApp.getUi().alert('Деректер жоқ.');
    return;
  }

  var range = sheet.getRange(HEADER_ROW + 1, colIdx, lastRow, colIdx);
  var values = range.getValues();
  for (var i = 0; i < values.length; i++) {
    var cell = range.getCell(i + 1, 1);
    var v = values[i][0];
    var empty = v === '' || v === null || String(v).trim() === '';
    if (empty) {
      cell.setBackground('#fff3cd');
    } else {
      cell.setBackground(null);
    }
  }
}

/**
 * B бағанын «иә» деп тану арқылы қысқаша санақ (сөздікке YES_VALUES қосыңыз)
 */
function countYesNoSummary() {
  var sheet = SpreadsheetApp.getActiveSheet();
  var colIdx = 2;
  var lastRow = sheet.getLastRow();
  if (lastRow <= HEADER_ROW) {
    SpreadsheetApp.getUi().alert('Деректер жоқ.');
    return;
  }

  var values = sheet.getRange(HEADER_ROW + 1, colIdx, lastRow, colIdx).getValues();
  var yes = 0;
  var no = 0;
  var empty = 0;

  for (var i = 0; i < values.length; i++) {
    var raw = values[i][0];
    if (raw === '' || raw === null || String(raw).trim() === '') {
      empty++;
      continue;
    }
    var s = String(raw).trim().toLowerCase();
    if (YES_VALUES.indexOf(s) !== -1) {
      yes++;
    } else {
      no++;
    }
  }

  SpreadsheetApp.getUi().alert(
    'Санақ (B бағаны):\n\n' +
      'Иә / келемін: ' +
      yes +
      '\n' +
      'Басқа жауап: ' +
      no +
      '\n' +
      'Бос: ' +
      empty
  );
}

/**
 * Ағымдағы парақтағы фон түстерін тазалайды (тақырыпты қалдыруға болады — қолмен түзетіңіз)
 */
function clearHighlights() {
  var sheet = SpreadsheetApp.getActiveSheet();
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  if (lastRow < 1 || lastCol < 1) return;

  sheet.getRange(HEADER_ROW + 1, 1, lastRow, lastCol).setBackground(null);
}
