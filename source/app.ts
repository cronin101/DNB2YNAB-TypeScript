/// <reference path="../typings/tsd.d.ts" />

import * as parse from 'papaparse';
import * as $ from 'jquery';
import 'jquery-ui';

import * as DNB from "./DNB";

// Translates DNB CSV in $source into YNAB CSV in $target
const transform_CSV = (source: JQuery, target: JQuery) => {
  const source_text = source.val().replace(/""/g, "");
  const parsed_data = parse.parse(
      source_text,
      { delimiter: ';', header: true, skipEmptyLines: true })
      .data;
  
  const dnb_entries = parsed_data.map(row => DNB.Transaction.FromFields(row));
  const cutoff_date = $("#datepicker").val()
  const filtered_dnb_entries = cutoff_date
      ? dnb_entries.filter(e => !e.isBeforeDate(cutoff_date))
      : dnb_entries;
  const ynab_entries = filtered_dnb_entries.map(row => row.to_YNAB_format());
  
  const transformed_csv = parse.unparse({
      fields: ['Date', 'Payee', 'Category', 'Memo', 'Outflow', 'Inflow'],
      data: ynab_entries
    })
  
  target.text(transformed_csv);
}

// Triggers a download of containing the contents of $target
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
