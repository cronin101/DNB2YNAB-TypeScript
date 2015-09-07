// The fields present on DNB's CSV format (English)
export interface IDNBRowEN {
  Date: string;
  Deposits: string;
  Description: string;
  Withdrawals: string;
  "Interest date": string;
}

// The fields present on DNB's CSV format (Norwegian)
export interface IDNBRowNO {
  Dato: string;
  Forklaring: string;
  Rentedato: string;
  Uttak: string;
  Innskudd: string;
}

// Handle both EN and NO languages in CSV
export type IDNBRow = IDNBRowEN | IDNBRowNO;

export class Transaction{
  constructor(
    private date: string,
    private payee: string,
    private interest_date: string,
    private outflow: string,
    private inflow: string) {}

  // Returns the transaction in a format understood by YNAB
  public to_YNAB_format(): string[] {
    // Slashes for Date formatting
    const date = this.date.replace(/\./g, "/");

    // Remove commas from all fields
    const payee = this.payee.replace(/,/g, '');

    // Norwegian format has "." before the "," when traversing ltr
    const amount_example = this.outflow || this.inflow;
    const is_norsk_format = amount_example.indexOf('.') < amount_example.indexOf(',');

  // The monetary amount should be in US/British format with no commas
    const format_amount = is_norsk_format
        ? (amount: string) => amount.replace(/\./g, '').replace(/,/g, '.')
        : (amount: string) => amount.replace(/,/g, '');
    const [outflow, inflow] = [this.outflow, this.inflow].map(s => format_amount(s || ""))

    // Correct field ordering for YNAB  
    return [date, payee, "", "", outflow, inflow]
  }

  public isBeforeDate(date: string): boolean {
    //ISO 8601 for Dates
    const [d, m ,y] = this.date.split('.');
    return Date.parse(date) > Date.parse(`${y}-${m}-${d}`);
  }

  static FromFields(row: IDNBRow): Transaction {
    const englishRow = <IDNBRowEN> row;
    const norskRow = <IDNBRowNO> row;
    return new Transaction(
      englishRow.Date || norskRow.Dato,
      englishRow.Description || norskRow.Forklaring,
      englishRow["Interest date"] || norskRow.Rentedato,
      englishRow.Withdrawals || norskRow.Uttak,
      englishRow.Deposits || norskRow.Innskudd);
  }
}
