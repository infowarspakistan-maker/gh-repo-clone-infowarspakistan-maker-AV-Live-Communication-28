import { google } from 'googleapis';

export async function getSheetsClient(accessToken: string) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  return google.sheets({ version: 'v4', auth });
}

export async function updateSheetData(spreadsheetId: string, range: string, values: any[][], accessToken: string) {
  const sheets = await getSheetsClient(accessToken);
  const sheetName = range.includes('!') ? range.split('!')[0] : 'Sheet1';
  try {
    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: `${sheetName}!A1:AZ1000`,
    });
  } catch {
    // Proceed with update even if clear range falls back
  }
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values },
  });
}
