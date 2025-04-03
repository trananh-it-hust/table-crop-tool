import axios from "axios";

export const getDataFromSheet = async (spreadsheetId: string, sheetName: string, apiKey: string) => {
  try {
    const { data } = await axios.get(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}`, {
      params: {
        key: apiKey,
      },
    });

    return data;
  } catch (error) {
    console.error(error);
  }
};
