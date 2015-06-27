/// <reference path="../typings/tsd.d.ts" />

import * as parse from 'papaparse';
import * as $ from 'jquery';
import 'jquery-ui';

// The fields present on DNB's CSV format
interface IDNBRowEN {
  Date: string;
  Deposits: string;
  Description: string;
  "From account": string;
  "Interest date": string;
}

interface IDNBRowNO {
  Dato: string;
  Forklaring: string;
  Rentedato: string;
  Uttak: string;
  Innskudd: string;
}

// Handle both EN and NO languages in CSV
type IDNBRow = IDNBRowEN | IDNBRowNO;

class DNBEntry{
  constructor(
    private date: string,
    private payee: string,
    private interest_date: string,
    private outflow: string,
    private inflow: string) {
    
  }
  
  public to_YNAB_entry(): string[] {
    // Slashes for Date formatting
    const date = this.date.replace(/\./g, "/");
    
    // Remove commas from all fields
    const [payee, outflow, inflow] = 
      [this.payee, this.outflow, this.inflow]
          .map(s => (s || "").replace(/,/g, ''))
        
    // Correct field ordering for YNAB  
    return [date, payee, "", "", outflow, inflow]
  }
  
  public isBeforeDate(date: string): boolean {
    //ISO 8601 for Dates
    const [d, m ,y] = this.date.split('.');
    return Date.parse(date) > Date.parse(`${y}-${m}-${d}`);
  }
  
  static FromFields(row: IDNBRow): DNBEntry {
    const englishRow = <IDNBRowEN> row;
    const norskRow = <IDNBRowNO> row;
    return new DNBEntry(
      englishRow.Date || norskRow.Dato,
      englishRow.Description || norskRow.Forklaring,
      englishRow["Interest date"] || norskRow.Forklaring,
      englishRow["From account"] || norskRow.Uttak,
      englishRow.Deposits || norskRow.Innskudd);
  }
}

// Translates DNB CSV in $source into YNAB CSV in $target
const transform_CSV = (source: JQuery, target: JQuery) => {
  const source_text = source.val().replace(/""/g, "");
  const parsed_data = parse.parse(
      source_text,
      { delimiter: ';', header: true, skipEmptyLines: true })
      .data;
  
  const dnb_entries = parsed_data.map(row => DNBEntry.FromFields(row));
  const cutoff_date = $("#datepicker").val()
  const filtered_dnb_entries = cutoff_date
      ? dnb_entries.filter(e => !e.isBeforeDate(cutoff_date))
      : dnb_entries;
  const ynab_entries = filtered_dnb_entries.map(row => row.to_YNAB_entry());
  
  const transformed_csv = parse.unparse({
      fields: ['Date', 'Payee', 'Category', 'Memo', 'Outflow', 'Inflow'],
      data: ynab_entries
    })
  
  target.text(transformed_csv);
}

// Triggers a download of 'transactions.csv' containing the contents of $target
const save_text_to_file = (target: JQuery, filename: string) => {
  const contents = new Blob([target.val()], { type:'text/plain' });
  const download_link = <any>document.createElement('a');
  const w = <any>window;
  
  download_link.download = filename;
  download_link.href = (w.URL || w.webkitURL).createObjectURL(contents);  
  download_link.style.display = "none";
  
  document.body.appendChild(download_link);

  download_link.onclick = event => document.body.removeChild(<any>event.target);
  download_link.click();
}

$(() => {
  $('#transform').click(() => transform_CSV($('#source'), $('#target')));
  
  $('#download').click(() => save_text_to_file($('#target'), 'transactions.csv'));
  
  $('#datepicker').datepicker({ dateFormat: 'yy-mm-dd' });
})
