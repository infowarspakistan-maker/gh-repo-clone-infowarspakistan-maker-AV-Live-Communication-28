import { google } from 'googleapis';

export async function getSheetsClient(accessToken: string) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  return google.sheets({ version: 'v4', auth });
}

export async function updateSheetData(spreadsheetId: string, range: string, values: any[][], accessToken: string) {
  const sheets = await getSheetsClient(accessToken);
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values },
  });
}
