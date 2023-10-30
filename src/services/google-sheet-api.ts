import { Product, ProductStatus, TransactionBaseService } from "@medusajs/medusa";
import { google, sheets_v4 } from "googleapis";
import { buildLocationTree, getLocationPathWithLastID } from "utils/convertIntoNestedLocations";
import CategoryService from "./category";

export type ProductData = {
  'Product title': string;
  'Product ID': string;
  Description: string;
  Location: string;
  Category: string;
  Draft: boolean;
  Stocks: number;
  Image_1: string;
  Image_2: string;
  Image_3: string;
  Thumbnail: string;
  rowNumber: number;
}

class GoogleSheetAPIService extends TransactionBaseService {
  // Initialize Google Sheet API service
  sheets: sheets_v4.Sheets;
  sheetId: string;
  categoryService: CategoryService;

  constructor(container) {
    super(container);

    this.sheetId = process.env.GSHEET_ID;

    // Initialize Google Authentication and create the Google Sheets service
    const auth = new google.auth.GoogleAuth({
      keyFile: process.env.KEY_FILE_PATH, // Specify the path to your service account key file
      scopes: ["https://www.googleapis.com/auth/spreadsheets"], // Define required scopes
    });
    this.sheets = google.sheets({ version: 'v4', auth });
    this.categoryService = container.categoryService
  }

  // Retrieve data from a Google Sheet by its ID, specifying sheet name and cell range
  // Original function for retrieving data as an object of arrays
  async getProductDataBySheetId(sheetName = process.env.PRODUCT_SHEET_NAME, cellSelection = 'A1:Z') {
    // Fetch data from the specified Google Sheet
    const response = await this.sheets.spreadsheets.values.get({
      spreadsheetId: this.sheetId,
      range: `${sheetName}!${cellSelection}`,
    });

    // Extract headers from the response data
    const headers = response.data.values?.[0];

    // Create an array to store the result objects (each object represents a single item)
    const csvDataArray = [];

    // Filter and process the data to create the array of objects
    const filteredData = response.data.values?.filter(row => row.slice(1).every((cell) => cell !== '' && cell !== null));

    filteredData.slice(1).forEach((row, index) => {
      const itemData = {
        rowNumber: index + 2 // 1 for index, 2nd for header. so adding 2.
      };

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
              const columnAsNumber = /^-?\d+$/.test(cell) && parseInt(cell);
              if (columnAsNumber && !Number.isNaN(columnAsNumber)) {
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

  async updateProductId(payload: { id: string; rowNumber: number }[]) {

    const valueUpdates = payload.map(p => ({ range: `${process.env.PRODUCT_SHEET_NAME}!A${p.rowNumber}`, values: [[p.id]] }));

    const response = await this.sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: this.sheetId,
      requestBody: {
        valueInputOption: 'RAW',
        data: valueUpdates
      }
    })

    return response.data.totalUpdatedCells
  }

  async syncProducts(products: Product[]) {

    Promise.all(products.map(async (product) => {
      const location = product.categories?.filter(c => c.handle.startsWith('loc:'))[0];
      const category = product.categories?.filter(c => !c.handle.startsWith('loc:'))[0];

      return [
        // product id
        product.id,

        // product title
        product.title,

        // description
        product.description,

        // location
        !location ? '' : await this.categoryService.getLocationWithParentNames(location.id),

        // category
        !category ? '' : category.name,

        // Draft
        product.status === ProductStatus.DRAFT,

        // Stocks

        product.variants?.[0].inventory_quantity || ''
      ]
    })).then(async (sheetProducts) => {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.sheetId,
        range: `${process.env.PRODUCT_SHEET_NAME}!A2:A`,
      })

      const cellLength = response.data.values?.length || 0;

      const targetedLength = Math.max(sheetProducts.length, cellLength)

      const values = Array(targetedLength).fill(null).map((_, i) => sheetProducts[i] || ['', '', '', '', '', '', '']);

      return this.sheets.spreadsheets.values.update({
        spreadsheetId: this.sheetId,
        range: `${process.env.PRODUCT_SHEET_NAME}!A2:G`,
        valueInputOption: 'RAW',
        requestBody: { range: `${process.env.PRODUCT_SHEET_NAME}!A2:G`, values }
      })
    });

  }

  async syncCategories(categories: string[] = []) {
    const response = await this.sheets.spreadsheets.values.get({
      spreadsheetId: this.sheetId,
      range: `${process.env.DROPDOWN_LIST_SHEET_NAME}!A2:A`,
    })

    const cellLength = response.data.values?.length;

    const targetedLength = Math.max(categories.length, cellLength || 0)
    const values = Array(targetedLength).fill(null).map((_, i) => categories[i] || '').sort((a, z) => !a.length ? 0 : a > z ? 1 : -1).map(c => [c]);
    return this.sheets.spreadsheets.values.update({
      spreadsheetId: this.sheetId,
      range: `${process.env.DROPDOWN_LIST_SHEET_NAME}!A2:A`,
      valueInputOption: 'RAW',
      requestBody: { range: `${process.env.DROPDOWN_LIST_SHEET_NAME}!A2:A`, values }
    })
  }

  async syncLocations(locations: string[] = []) {
    const response = await this.sheets.spreadsheets.values.get({
      spreadsheetId: this.sheetId,
      range: `${process.env.DROPDOWN_LIST_SHEET_NAME}!B2:B`,
    })

    const cellLength = response.data.values?.length || 0;

    const targetedLength = Math.max(locations.length, cellLength)
    const values = Array(targetedLength).fill(null).map((_, i) => locations[i] || '').sort((a, z) => !a.length ? 0 : a > z ? 1 : -1).map(c => [c]);
    return this.sheets.spreadsheets.values.update({
      spreadsheetId: this.sheetId,
      range: `${process.env.DROPDOWN_LIST_SHEET_NAME}!B2:B`,
      valueInputOption: 'RAW',
      requestBody: { range: `${process.env.DROPDOWN_LIST_SHEET_NAME}!B2:B`, values }
    })
  }
}

export default GoogleSheetAPIService;
