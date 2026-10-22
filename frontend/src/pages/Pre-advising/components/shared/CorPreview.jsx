import React from "react";

const formatTime = (minutes) => {
  if (minutes === undefined || minutes === null || minutes === "") return "TBA";
  const hour = Math.floor(Number(minutes) / 60);
  const minute = Number(minutes) % 60;
  return `${hour % 12 || 12}:${String(minute).padStart(2, "0")} ${hour >= 12 ? "PM" : "AM"}`;
};

const shortDay = (day) => ({
  Monday: "Mon",
  Tuesday: "Tue",
  Wednesday: "Wed",
  Thursday: "Thu",
  Friday: "Fri",
  Saturday: "Sat",
  Sunday: "Sun"
}[day] || String(day || "").slice(0, 3));

const scheduleText = (schedule = []) => ({
  days: schedule.length ? schedule.map((item) => shortDay(item.day || item.dayOfWeek)).join(" / ") : "—",
  times: schedule.length ? schedule.map((item) => `${formatTime(item.startTime)} - ${formatTime(item.endTime)}`).join(" / ") : "TBA"
});

export default function CorPreview({ student, subjects = [], academicYear = "25-26" }) {
  const totalUnits = subjects.reduce((sum, subject) => sum + Number(subject.units || 0), 0);
  const totalHours = subjects.reduce((sum, subject) => sum + Number(subject.hours || subject.units || 0), 0);
  const studentName = student?.name || `${student?.lastName || ""}, ${student?.firstName || ""}`.replace(/^, |, $/g, "");

  return (
    <>
      <style>{`
        .cor-dashboard-sheet { width: 8.5in; height: 7in; max-height: 7in; margin: 0 auto; padding: .24in .14in .18in .22in; background: #fff; color: #000; font-family: "Times New Roman", Times, serif; font-size: 7.8pt; box-sizing: border-box; box-shadow: 0 0 6px rgba(0,0,0,.3); overflow: hidden; position: relative; }
        .cor-dashboard-sheet * { box-sizing: border-box; }
        .cor-dashboard-hdr { text-align: center; margin-bottom: 7px; }
        .cor-dashboard-school { font-size: 11pt; font-weight: bold; line-height: 1.05; }
        .cor-dashboard-addr { font-size: 8pt; line-height: 1.05; }
        .cor-dashboard-title { font-size: 10pt; font-weight: bold; letter-spacing: .5px; margin-top: 1px; line-height: 1.05; }
        .cor-dashboard-info { white-space: nowrap; overflow: hidden; margin-bottom: 4px; line-height: 1.2; }
        .cor-dashboard-field { display: inline-block; border-bottom: 1px solid #000; padding: 0 2px; min-height: 1.05em; vertical-align: bottom; text-align: center; }
        .cor-dashboard-top { display: flex; flex-wrap: nowrap; align-items: flex-start; gap: .06in; margin-top: 6px; width: 7.7in; }
        .cor-dashboard-left { flex: 0 0 5.6in; width: 5.6in; }
        .cor-dashboard-right { flex: 0 0 2in; width: 2in; }
        .cor-dashboard-fields, .cor-dashboard-labels { display: flex; white-space: nowrap; }
        .cor-dashboard-seg { display: inline-block; border-bottom: 1px solid #000; height: 1.05em; }
        .cor-dashboard-labels { margin-top: 1px; margin-bottom: 8px; font-size: 6.4pt; }
        .cor-dashboard-checks { display: flex; align-items: flex-start; }
        .cor-dashboard-checkbox { border: 1px solid #000; padding: 3px 4px; font-size: 6.2pt; white-space: nowrap; margin-right: 2px; }
        .cor-dashboard-checkrow { display: flex; align-items: center; white-space: nowrap; margin: 1.5px 0; }
        .cor-dashboard-box { width: 7px; height: 7px; border: 1px solid #000; display: inline-block; margin-right: 3px; flex: 0 0 7px; }
        .cor-dashboard-subject-title { text-align: center; font-weight: bold; font-size: 9pt; margin: 6px 0 4px; }
        .cor-dashboard-table-row { display: flex; flex-wrap: nowrap; align-items: flex-start; width: 7.7in; gap: .1in; }
        .cor-dashboard-table { border-collapse: collapse; table-layout: fixed; width: 6in; flex: 0 0 6in; }
        .cor-dashboard-table th, .cor-dashboard-table td { border: 1px solid #000; padding: 1px 1px; font-size: 6.5pt; line-height: 1.1; overflow: hidden; height: .19in; vertical-align: middle; text-align: center; white-space: nowrap; }
        .cor-dashboard-table th { font-size: 6.7pt; height: .27in; white-space: normal; line-height: 1.05; }
        .cor-dashboard-table td:nth-child(4) { height: .29in; white-space: normal; overflow: visible; line-height: 1.05; }
        .cor-dashboard-table td:first-child, .cor-dashboard-table td:nth-child(4), .cor-dashboard-table td:nth-child(8) { text-align: left; }
        .cor-dashboard-fees { flex: 0 0 1.5in; width: 1.5in; border: 1px solid #000; height: 2.25in; padding: 3px; font-size: 6.8pt; line-height: 1.25; }
        .cor-dashboard-fees-title { text-align: center; font-weight: bold; font-size: 8.5pt; margin-bottom: 3px; }
        .cor-dashboard-lower { display: flex; border: 1px solid #000; margin-top: 7px; width: 7.7in; font-size: 7.2pt; }
        .cor-dashboard-lower-left { flex: 0 0 3.5in; width: 3.5in; padding: 3px 5px; border-right: 1px solid #000; }
        .cor-dashboard-lower-right { flex: 0 0 4.19in; width: 4.19in; padding: 3px 5px; }
        .cor-dashboard-elig-row { display: flex; white-space: nowrap; margin-bottom: 8px; }
        .cor-dashboard-elig-item { display: flex; align-items: center; margin-right: 14px; }
        .cor-dashboard-elig-item .cor-dashboard-box { width: 9px; height: 9px; margin-right: 4px; flex: 0 0 9px; }
        .cor-dashboard-optout { display: flex; align-items: center; margin-bottom: 6px; }
        .cor-dashboard-pledge2 { font-style: italic; font-size: 7.2pt; line-height: 1.25; margin-bottom: 14px; }
        .cor-dashboard-sign-row { display: flex; white-space: nowrap; width: 100%; gap: .12in; align-items: flex-end; }
        .cor-dashboard-sign-name { flex: 1 1 auto; width: 2.15in; max-width: 2.15in; border-top: 1px solid #000; text-align: center; font-size: 7.2pt; padding-top: 1px; }
        .cor-dashboard-sign-date { flex: 0 0 .9in; width: .9in; border-top: 1px solid #000; text-align: center; font-size: 7.2pt; padding-top: 1px; }
        .cor-dashboard-payment-title { text-align: center; font-weight: bold; margin-bottom: 4px; }
        .cor-dashboard-pay-cols { display: flex; }
        .cor-dashboard-pay-col { flex: 0 0 2in; width: 2in; font-size: 7.2pt; line-height: 1.7; }
        .cor-dashboard-pay-line { display: flex; justify-content: space-between; white-space: nowrap; }
        .cor-dashboard-pay-value { border-bottom: 1px solid #000; min-width: .75in; text-align: right; padding: 0 2px; }
        .cor-dashboard-pledge { text-align: center; font-size: 6.5pt; margin-top: 7px; line-height: 1.15; padding: 0 .1in; }
        .cor-dashboard-sign { text-align: center; margin-top: 14px; font-size: 6.5pt; }
        @media print {
          @page { size: 8.5in 7in; margin: 0; }
          html, body { margin: 0; padding: 0; background: #fff; }
          body * { visibility: hidden !important; }
          .cor-dashboard-sheet { visibility: visible !important; width: 8.5in; height: 7in; margin: 0 !important; box-shadow: none; position: absolute; top: 0; left: 0; page-break-inside: avoid; }
          .cor-dashboard-sheet * { visibility: visible !important; }
        }
      `}</style>
      <div className="cor-dashboard-sheet">
        <div className="cor-dashboard-hdr">
          <div className="cor-dashboard-school">Baliwag Polytechnic College</div>
          <div className="cor-dashboard-addr">Baliwag, Bulacan</div>
          <div className="cor-dashboard-title">CERTIFICATE OF REGISTRATION</div>
        </div>

        <div className="cor-dashboard-info">
          <span className="cor-dashboard-field" style={{ width: ".55in" }}>{student?.semester || "1st"}</span>
          <span> Semester/Summer</span><span> AY </span>
          <span className="cor-dashboard-field" style={{ width: ".34in" }}>{academicYear.split("-")[0]}</span><span> - </span><span className="cor-dashboard-field" style={{ width: ".34in" }}>{academicYear.split("-")[1]}</span>
          <span> Course </span><span className="cor-dashboard-field" style={{ width: ".72in" }}>{student?.course || "BSIT"}</span>
          <span> Year Level </span><span className="cor-dashboard-field" style={{ width: ".42in" }}>{student?.year || student?.yearLevel || ""}</span>
          <span> Section </span><span className="cor-dashboard-field" style={{ width: ".8in" }}>{student?.section || ""}</span>
          <span> Application ID </span><span className="cor-dashboard-field" style={{ width: "1.1in" }}>{student?.studentNumber || student?.studentId || ""}</span>
        </div>

        <div className="cor-dashboard-top">
          <div className="cor-dashboard-left">
            <div className="cor-dashboard-fields"><span className="cor-dashboard-seg" style={{ width: "2.6in" }}>{student?.lastName || studentName}</span><span className="cor-dashboard-seg" style={{ width: "1.5in" }}>{student?.firstName || ""}</span><span className="cor-dashboard-seg" style={{ width: "1.5in" }}>{student?.middleName || ""}</span></div>
            <div className="cor-dashboard-labels"><span style={{ width: "2.6in" }}>Name(PRINT) Surname</span><span style={{ width: "1.5in" }}>First Name</span><span style={{ width: "1.5in" }}>Middle Name</span></div>
            <div className="cor-dashboard-fields"><span className="cor-dashboard-seg" style={{ width: ".8in" }}></span><span className="cor-dashboard-seg" style={{ width: "1in" }}></span><span className="cor-dashboard-seg" style={{ width: ".9in" }}></span><span className="cor-dashboard-seg" style={{ width: ".55in" }}></span><span className="cor-dashboard-seg" style={{ width: ".5in" }}></span><span className="cor-dashboard-seg" style={{ width: ".75in" }}></span><span className="cor-dashboard-seg" style={{ width: "1.1in" }}></span></div>
            <div className="cor-dashboard-labels"><span style={{ width: ".8in" }}>Street No.</span><span style={{ width: "1in" }}>Barangay/District</span><span style={{ width: ".9in" }}>Town/City</span><span style={{ width: ".55in" }}>Province</span><span style={{ width: ".5in" }}>Zip Code</span><span style={{ width: ".75in" }}>Contact No.</span><span style={{ width: "1.1in" }}>Email Address</span></div>
          </div>
          <div className="cor-dashboard-right"><div className="cor-dashboard-checks"><div className="cor-dashboard-checkbox"><div className="cor-dashboard-checkrow"><span className="cor-dashboard-box" />Female</div><div className="cor-dashboard-checkrow"><span className="cor-dashboard-box" />Male</div></div><div className="cor-dashboard-checkbox"><div className="cor-dashboard-checkrow"><span className="cor-dashboard-box" />Blocked Section</div><div className="cor-dashboard-checkrow"><span className="cor-dashboard-box" />Irregular Section</div></div><div className="cor-dashboard-checkbox"><div className="cor-dashboard-checkrow"><span className="cor-dashboard-box" />New Student</div><div className="cor-dashboard-checkrow"><span className="cor-dashboard-box" />Old Student</div><div className="cor-dashboard-checkrow"><span className="cor-dashboard-box" />Transferee</div><div className="cor-dashboard-checkrow"><span className="cor-dashboard-box" />Returnee</div></div></div></div>
        </div>

        <div className="cor-dashboard-subject-title">SUBJECT ENROLLED</div>
        <div className="cor-dashboard-table-row">
          <table className="cor-dashboard-table">
            <colgroup><col style={{ width: ".85in" }} /><col style={{ width: ".4in" }} /><col style={{ width: ".4in" }} /><col style={{ width: "1.1in" }} /><col style={{ width: ".65in" }} /><col style={{ width: ".55in" }} /><col style={{ width: ".75in" }} /><col style={{ width: "1.3in" }} /></colgroup>
            <thead><tr><th>SUBJECT CODE</th><th>UNIT</th><th>HRS</th><th>TIME</th><th>DAYS</th><th>ROOM</th><th>SECTION</th><th>INSTRUCTOR'S NAME/SIGNATURE</th></tr></thead>
            <tbody>
              {subjects.map((subject, index) => {
                const formatted = scheduleText(subject.schedule);
                return <tr key={`${subject.code}-${index}`}><td>{subject.code}</td><td>{subject.units || 0}</td><td>{subject.hours || subject.units || 0}</td><td>{formatted.times}</td><td>{formatted.days}</td><td>{subject.room || "TBA"}</td><td>{subject.target || "—"}</td><td>{subject.instructor || "TBA"}</td></tr>;
              })}
            </tbody>
            <tfoot><tr><td></td><td>{totalUnits}</td><td>{totalHours}</td><td colSpan="5"></td></tr></tfoot>
          </table>
          <div className="cor-dashboard-fees">
            <div className="cor-dashboard-fees-title">SCHOOL FEES</div>
            {['TUITION: Php 6900.00', 'MISC: Php 2700.00', 'Athletics: 100.00', 'Cultural: 100.00', 'Devt: 400.00', 'Guidance: 200.00', 'Handbook: 0.00', 'Library: 500.00', 'Medical/Dental: 250.00', 'Registration: 500.00', 'Com.Outreach: 450.00', 'ALCU: 200.00', 'Computer: Php 2000.00', 'ID Card: Php 0.00', 'Lab Fee: 0.00'].map((fee) => <div key={fee}>{fee}</div>)}
          </div>
        </div>

        <div className="cor-dashboard-lower">
          <div className="cor-dashboard-lower-left">
            <div className="cor-dashboard-elig-row"><div className="cor-dashboard-elig-item"><span className="cor-dashboard-box" />Eligible for R.A 10931</div><div className="cor-dashboard-elig-item"><span className="cor-dashboard-box" />Not Qualified for Free HE</div></div>
            <div className="cor-dashboard-optout"><span className="cor-dashboard-box" />Opt Out Mechanism</div>
            <div className="cor-dashboard-pledge2">I am aware of the benefits and responsibilities of R.A 10931. However, I voluntarily opt out by paying my tuition and school fees to BTech.</div>
            <div className="cor-dashboard-sign-row"><div className="cor-dashboard-sign-name">Printed Name &amp; Signature of Student</div><div className="cor-dashboard-sign-date">Date</div></div>
          </div>
          <div className="cor-dashboard-lower-right">
            <div className="cor-dashboard-payment-title">PAYMENT SCHEME</div>
            <div className="cor-dashboard-pay-cols">
              <div className="cor-dashboard-pay-col">
                <div className="cor-dashboard-pay-line"><span>Total Assessment:</span><span className="cor-dashboard-pay-value">11,600.00</span></div>
                <div className="cor-dashboard-pay-line"><span>Eligible for R.A 10931:</span><span className="cor-dashboard-pay-value">10,950.00</span></div>
                <div className="cor-dashboard-pay-line"><span>Subsidized by LGU:</span><span className="cor-dashboard-pay-value">650.00</span></div>
                <div className="cor-dashboard-pay-line"><span>Back Accounts/Adjustment:</span><span className="cor-dashboard-pay-value">0.00</span></div>
              </div>
              <div className="cor-dashboard-pay-col">
                <div className="cor-dashboard-pay-line"><span>DOWN PAYMENT:</span><span className="cor-dashboard-pay-value">0.00</span></div>
                <div className="cor-dashboard-pay-line"><span>BALANCE:</span><span className="cor-dashboard-pay-value">0.00</span></div>
                <div className="cor-dashboard-pay-line"><span>O.R. NO.:</span><span className="cor-dashboard-pay-value"></span></div>
                <div className="cor-dashboard-pay-line"><span>DATE:</span><span className="cor-dashboard-pay-value"></span></div>
              </div>
            </div>
          </div>
        </div>
        <div className="cor-dashboard-pledge">Upon my admission on the Baliwag Polytechnic College, I hereby pledge to abide by and comply with all rules and regulations governing student&rsquo;s academic performance, conduct and discipline.</div>
        <div className="cor-dashboard-sign"><span className="inline-block w-[2.6in] border-t border-black"></span><br />Student&rsquo;s Signature and Date</div>
      </div>
    </>
  );
}