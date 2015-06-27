/// <reference path="../typings/tsd.d.ts" />

import * as parse from 'papaparse';
import * as $ from 'jquery';

// The fields present on DNB's CSV format
interface IDNBRow {
  Date: string;
  Deposits: string;
  Description: string;
  "From account": string;
  "Interest date": string;
}

class DNBEntry{
  constructor(
    private date: string,
    private payee: string,
    private interest_date: string,
    private outflow: string,
    private inflow: string) {
    
  }
  
  public to_YNAB_entry() {
    // Slashes for Date formatting
    const date = this.date.replace(/\./g, "/");
    
    // Remove commas from all fields
    const [payee, outflow, inflow] = 
      [this.payee, this.outflow, this.inflow]
          .map(s => s.replace(/,/g, ''))
        
    // Correct field ordering for YNAB  
    return [date, payee, "", "", outflow, inflow]
  }
  
  static FromFields(row: IDNBRow){
    return new DNBEntry(
      row.Date,
      row.Description,
      row["Interest date"],
      row["From account"],
      row.Deposits);
  }
}

// Translates DNB CSV in $source into YNAB CSV in $target
const transform_CSV = (source: JQuery, target: JQuery) => {
  const source_text = source.val(); 
  const parsed_data = parse.parse(
      source_text,
      { delimiter: ';', header: true, skipEmptyLines: true })
      .data;
  
  const dnb_entries = parsed_data.map(row => DNBEntry.FromFields(row));
      
  const ynab_entries = dnb_entries.map(row => row.to_YNAB_entry());
  
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
})
