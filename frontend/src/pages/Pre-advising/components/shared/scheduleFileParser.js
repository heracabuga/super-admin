import * as XLSX from "xlsx";
import mammoth from "mammoth/mammoth.browser";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

const normalizeKey = (value) => String(value || "")
  .toLowerCase()
  .replace(/[^a-z0-9]/g, "");

const fieldAliases = {
  subjectCode: ["subjectcode", "subject", "code", "coursecode"],
  title: ["title", "subjecttitle", "description", "subjectdescription"],
  day: ["day", "days", "dayofweek"],
  startTime: ["starttime", "start", "from"],
  endTime: ["endtime", "end", "to"],
  roomName: ["room", "roomname", "roomnumber", "venue"],
  profName: ["professor", "profname", "instructor", "instructorsname", "faculty"]
};

const findValue = (row, aliases) => {
  const key = Object.keys(row).find(candidate => aliases.includes(normalizeKey(candidate)));
  return key ? row[key] : "";
};

const parseTime = (value) => {
  if (typeof value === "number") return value < 24 ? Math.round(value * 60) : Math.round(value);
  const text = String(value || "").trim().toLowerCase();
  if (!text) return null;
  const match = text.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
  if (!match) return null;
  let hour = Number(match[1]);
  const minute = Number(match[2] || 0);
  const period = match[3];
  if (period === "pm" && hour < 12) hour += 12;
  if (period === "am" && hour === 12) hour = 0;
  return hour * 60 + minute;
};

const splitDays = (value) => String(value || "")
  .split(/[,;&]+|\s+(?:and|to)\s+|\s+/i)
  .map(day => day.trim())
  .filter(Boolean)
  .map(day => ({ mon: "Monday", tue: "Tuesday", wed: "Wednesday", thu: "Thursday", fri: "Friday", sat: "Saturday", sun: "Sunday" }[day.slice(0, 3).toLowerCase()] || day));

const normalizeRows = (rows) => rows.flatMap((row) => {
  const subjectCode = String(findValue(row, fieldAliases.subjectCode) || "").trim();
  if (!subjectCode) return [];
  const days = splitDays(findValue(row, fieldAliases.day));
  const startTime = parseTime(findValue(row, fieldAliases.startTime));
  const endTime = parseTime(findValue(row, fieldAliases.endTime));
  const common = {
    subjectCode,
    title: String(findValue(row, fieldAliases.title) || subjectCode).trim(),
    startTime,
    endTime,
    roomName: String(findValue(row, fieldAliases.roomName) || "TBA").trim(),
    profName: String(findValue(row, fieldAliases.profName) || "TBA").trim()
  };
  return (days.length ? days : [""]).map(day => ({ ...common, day }));
}).filter(item => item.startTime !== null && item.endTime !== null);

const rowsFromWorkbook = (workbook) => {
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  return XLSX.utils.sheet_to_json(firstSheet, { defval: "" });
};

const rowsFromText = (text) => text.split(/\r?\n/).map(line => {
  const cells = line.split(/\t|\s{2,}|\|/).map(value => value.trim());
  return {
    subjectCode: cells[0],
    title: cells[1],
    day: cells[2],
    startTime: cells[3],
    endTime: cells[4],
    roomName: cells[5],
    profName: cells.slice(6).join(" ")
  };
});

const parsePdf = async (buffer) => {
  const document = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;
  const lines = [];
  for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
    const page = await document.getPage(pageNumber);
    const content = await page.getTextContent();
    lines.push(content.items.map(item => item.str).join("  "));
  }
  return normalizeRows(rowsFromText(lines.join("\n")));
};

export const parseScheduleFile = async (file) => {
  const extension = file.name.toLowerCase().split(".").pop();
  const buffer = await file.arrayBuffer();
  if (["xlsx", "xls"].includes(extension)) {
    return normalizeRows(rowsFromWorkbook(XLSX.read(buffer, { type: "array" })));
  }
  if (extension === "docx") {
    const result = await mammoth.extractRawText({ arrayBuffer: buffer });
    return normalizeRows(rowsFromText(result.value));
  }
  if (extension === "pdf") return parsePdf(buffer);
  if (extension === "doc") throw new Error("Please save the Word file as .docx before uploading.");
  throw new Error("Unsupported file. Upload an Excel, PDF, or Word (.docx) schedule.");
};
