import React from "react";

const getStudentName = (student) => {
  if (!student) return "—";
  return student.name || `${student.firstName || ""} ${student.lastName || ""}`.trim() || "—";
};

const formatTime = (minutes) => {
  if (minutes === undefined || minutes === null || minutes === "") return "TBA";
  const hour = Math.floor(Number(minutes) / 60);
  const minute = Number(minutes) % 60;
  const hour12 = hour % 12 || 12;
  const period = hour >= 12 ? "PM" : "AM";
  return `${hour12}:${String(minute).padStart(2, "0")} ${period}`;
};

const formatDay = (day) => {
  if (!day) return "";
  return {
    Monday: "Mon",
    Tuesday: "Tue",
    Wednesday: "Wed",
    Thursday: "Thu",
    Friday: "Fri",
    Saturday: "Sat",
    Sunday: "Sun"
  }[day] || String(day).slice(0, 3);
};

const getScheduleDisplay = (schedule = []) => ({
  days: schedule.length ? schedule.map((item) => formatDay(item.day || item.dayOfWeek)).join("/") : "—",
  time: schedule.length
    ? schedule.map((item) => `${formatTime(item.startTime)} - ${formatTime(item.endTime)}`).join("   ")
    : "TBA"
});

export default function EnrollmentPreview({ student, subjects = [], academicYear = "25-26" }) {
  const totalUnits = subjects.reduce((sum, subject) => sum + Number(subject.units || 0), 0);

  return (
    <div className="bg-white border border-slate-300 rounded-lg p-10 shadow-sm print:border-0 print:shadow-none print:p-0" style={{ minHeight: "1100px" }}>
      <div className="text-center mb-2 pb-3 border-b-2 border-slate-900">
        <p className="text-[10px] font-bold text-slate-700 uppercase tracking-widest mb-1">Institute of Information Technology and Innovation</p>
        <h1 className="text-lg font-black text-slate-900 uppercase tracking-tight">ENROLLMENT FORM</h1>
        <p className="text-[9px] text-slate-600 mt-1 font-semibold">Academic Year {academicYear}</p>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-4 text-[10px]">
        <div>
          <p className="font-bold text-slate-700 uppercase tracking-wide mb-0.5">Application ID:</p>
          <p className="font-semibold text-slate-900">{student?.studentNumber || student?.studentId || "—"}</p>
        </div>
        <div>
          <p className="font-bold text-slate-700 uppercase tracking-wide mb-0.5">Name:</p>
          <p className="font-semibold text-slate-900">{getStudentName(student)}</p>
        </div>
        <div>
          <p className="font-bold text-slate-700 uppercase tracking-wide mb-0.5">Year/Section:</p>
          <p className="font-semibold text-slate-900">{student?.year || student?.yearLevel || "—"} / {student?.section || "—"}</p>
        </div>
        <div>
          <p className="font-bold text-slate-700 uppercase tracking-wide mb-0.5">Status:</p>
          <p className="font-semibold text-blue-700 uppercase">{student?.status || "ADVISED"}</p>
        </div>
      </div>

      <div className="mb-4">
        <table className="w-full text-[9px] border-collapse">
          <thead>
            <tr className="bg-slate-900 text-white">
              {['CODE', 'DESCRIPTION', 'UNIT', 'TIME', 'DAYS', 'ROOM', 'TARGET', 'INSTRUCTOR'].map((heading) => (
                <th key={heading} className="border border-slate-600 px-1.5 py-1.5 text-left font-bold">{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {subjects.length > 0 ? subjects.map((subject, index) => (
              (() => {
                const scheduleDisplay = getScheduleDisplay(subject.schedule);

                return (
              <tr key={`${subject.code || subject.subjectId || "subject"}-${index}`} className={index % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                <td className="border border-slate-300 px-1.5 py-1 font-bold text-slate-900">{subject.code || subject.subjectId || "—"}</td>
                <td className="border border-slate-300 px-1.5 py-1 text-slate-800">{subject.title || "—"}</td>
                <td className="border border-slate-300 px-1.5 py-1 text-center font-bold text-slate-900">{subject.units || 0}</td>
                <td className="border border-slate-300 px-1.5 py-1 text-center text-slate-700 whitespace-pre-line">{scheduleDisplay.time}</td>
                <td className="border border-slate-300 px-1.5 py-1 text-center text-slate-700">{scheduleDisplay.days}</td>
                <td className="border border-slate-300 px-1.5 py-1 text-slate-700">{subject.room || "TBA"}</td>
                <td className="border border-slate-300 px-1.5 py-1 text-slate-700 text-[8px]">{subject.target || "—"}</td>
                <td className="border border-slate-300 px-1.5 py-1 text-slate-700 text-[8px]">{subject.instructor || "—"}</td>
              </tr>
                );
              })()
            )) : (
              <tr><td colSpan="8" className="border border-slate-300 px-1.5 py-2 text-center text-slate-400 italic">No advised subjects</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mb-4 grid grid-cols-3 gap-4 text-center text-[10px]">
        <div className="border-2 border-slate-900 p-2 rounded"><p className="font-bold text-slate-700 uppercase tracking-wide mb-1">Total Units</p><p className="text-2xl font-black text-slate-900">{totalUnits}</p></div>
        <div className="border-2 border-slate-900 p-2 rounded"><p className="font-bold text-slate-700 uppercase tracking-wide mb-1">Total Subjects</p><p className="text-2xl font-black text-slate-900">{subjects.length}</p></div>
        <div className="border-2 border-slate-900 p-2 rounded"><p className="font-bold text-slate-700 uppercase tracking-wide mb-1">Status</p><p className="text-lg font-bold text-blue-700 uppercase">{student?.status || "ADVISED"}</p></div>
      </div>

      <div className="grid grid-cols-3 gap-6 mt-6 pt-6 border-t-2 border-slate-900 text-center text-[9px]">
        {['Academic Adviser', "Student's Signature", 'Date'].map((label) => (
          <div key={label}><div className="h-12 mb-1" /><div className="border-b-2 border-slate-900 mb-1" /><p className="font-bold text-slate-800 uppercase">{label}</p></div>
        ))}
      </div>

      <div className="text-center text-[8px] text-slate-600 mt-6 pt-4 border-t border-slate-300">ITTI Registrar Office • Pre-Advising System</div>
    </div>
  );
}