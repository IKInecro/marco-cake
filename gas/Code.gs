// gas/Code.gs - copy paste ke https://script.google.com
// ponytail: 10 line core, no abstraction
const SHEET_ID = "1aYbh3JyvQfU67d3WY6O4r3NotCqpM3DLcIv8e1m9Lmc";
const SHEET_NAME = "PESANAN";

function doGet(){ return HtmlService.createHtmlOutput("web-jualan GAS ready"); }

function doPost(e){
  try{
    const data = JSON.parse(e.postData.contents);
    if(data.type === "request"){
      const sh2 = SpreadsheetApp.openById(SHEET_ID).getSheetByName("REQUEST");
      if(!sh2) throw new Error("Sheet REQUEST not found - buat tab REQUEST dulu");
      sh2.appendRow([new Date(), data.nama, data.wa, data.request]);
      return ContentService.createTextOutput(JSON.stringify({ok:true})).setMimeType(ContentService.MimeType.JSON);
    }
    const sh = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    if(!sh) throw new Error("Sheet " + SHEET_NAME + " not found");
    sh.appendRow([new Date(), data.nama, data.wa, data.kategori || "-", data.items.join(", "), data.total, data.catatan, data.metode]);
    return ContentService.createTextOutput(JSON.stringify({ok:true})).setMimeType(ContentService.MimeType.JSON);
  }catch(err){
    return ContentService.createTextOutput(JSON.stringify({ok:false, error: err.message})).setMimeType(ContentService.MimeType.JSON);
  }
}
// setup sekali: buat header row — auto bikin tab kalau belum ada
function setup(){
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sh = ss.getSheetByName(SHEET_NAME);
  if(!sh) sh = ss.insertSheet(SHEET_NAME);
  sh.clear();
  sh.appendRow(["Waktu","Nama","WA","Kategori","Pesanan","Total","Catatan","Metode"]);
  let sh2 = ss.getSheetByName("REQUEST");
  if(!sh2) sh2 = ss.insertSheet("REQUEST");
  sh2.clear();
  sh2.appendRow(["Waktu","Nama","WA","Request"]);
}
