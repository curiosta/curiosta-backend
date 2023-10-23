import { TransactionBaseService } from "@medusajs/medusa";
import { google, sheets_v4 } from "googleapis";

type ProductData = {
  'Product title': string;
  Description: string;
  Location: string;
  Category: string;
  Draft: boolean;
  Stocks: number;
  Image_1: string;
  Image_2: string;
  Image_3: string;
  Thumbnail: string;
}

class GoogleSheetAPIService extends TransactionBaseService {
  // Initialize Google Sheet API service
  sheets: sheets_v4.Sheets;

  constructor(container) {
    super(container);
    // Initialize Google Authentication and create the Google Sheets service
    const auth = new google.auth.GoogleAuth({
      keyFile: process.env.KEY_FILE_PATH, // Specify the path to your service account key file
      scopes: ["https://www.googleapis.com/auth/spreadsheets"], // Define required scopes
    });
    this.sheets = google.sheets({ version: 'v4', auth });
  }

  // Retrieve data from a Google Sheet by its ID, specifying sheet name and cell range
  // Original function for retrieving data as an object of arrays
  async getProductDataBySheetId(id: string, sheetName = 'Sheet1', cellSelection = 'A1:Z') {
    // Fetch data from the specified Google Sheet
    const response = await this.sheets.spreadsheets.values.get({
      spreadsheetId: id,
      range: `${sheetName}!${cellSelection}`,
    });

    // Extract headers from the response data
    const headers = response.data.values?.[0];

    // Create an array to store the result objects (each object represents a single item)
    const csvDataArray = [];

    // Filter and process the data to create the array of objects
    const filteredData = response.data.values?.filter(row => row.every(cell => cell !== '' && cell !== null));

    filteredData.slice(1).forEach((row) => {
      const itemData = {}; // Create an object to represent an item

      row.forEach((cell, columnIndex) => {
        const header = headers[columnIndex];

        // Check for missing header
        if (!header) throw new Error('Header not found but data is present. Failed to map data!');

        // Process cell values and add them to the itemData object
        switch (cell) {
          case 'TRUE':
            itemData[header] = true;
            break;
          case 'FALSE':
            itemData[header] = false;
            break;
          default:
            try {
              const columnAsNumber = parseInt(cell);
              if (!Number.isNaN(columnAsNumber)) {
                itemData[header] = columnAsNumber;
              } else {
                itemData[header] = cell;
              }
            } catch (error) {
              // Handle any potential errors during data processing
              itemData[header] = cell;
            }
        }
      });
      csvDataArray.push(itemData)
    });

    return csvDataArray as ProductData[]
  }
}

export default GoogleSheetAPIService;
