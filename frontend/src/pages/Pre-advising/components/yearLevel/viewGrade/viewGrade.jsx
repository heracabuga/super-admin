import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import React from "react";
import back from "../../assets/photo/arrow.png";
import adminLogo from "../../dashboard/dashboardLOGO/adminLogo.png";
import next from "../../assets/photo/next.png";

const getOrdinal = (n) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
};

const buildSemLabel = (grade) => {
  const raw = grade.semester || "";
  const sy  = grade.schoolYear || "";

  // Explicitly catch our new backend Transferee subjects
  if (raw === "Transferred" || sy === "Previous") return "Credited Subjects";

  if (/semester/i.test(raw) && /\d{4}/.test(raw)) return raw;

  const ordinals = { "1": "1st", "2": "2nd", "3": "3rd" };
  const semOrd = ordinals[String(raw).trim()] || `${raw}`;

  if (!sy || sy.trim() === "") return "Credited Subjects";
  return `${semOrd} Semester ${sy}`;
};

const semesterSortKey = (label) => {
  if (label === "Credited Subjects") return -1; // Pushes it to the bottom of the dropdown
  const match = label.match(/(\d+)(?:st|nd|rd|th)?\s+Semester\s+(\d{4})/i);
  if (!match) return 0;
  return parseInt(match[2]) * 10 + parseInt(match[1]);
};

const semesterOptions = [
  "2nd Semester 2025-2026",
  "1st Semester 2025-2026",
  "2nd Semester 2024-2025",
  "1st Semester 2024-2025",
  "2nd Semester 2023-2024",
  "1st Semester 2023-2024",
  "Credited",
];

const StudentGrades = ({ navigateToTab, navigationState }) => {
  
  

  const passedStudent = navigationState?.student ?? null;
  const isIrregular   = navigationState?.isIrregular ?? navigationState?.irregular ?? false;
  const section       = navigationState?.section;
  const yearLevel     = navigationState?.yearLevel;
  const yearName      = navigationState?.yearName;
  const yearTitle     = navigationState?.yearTitle;
  const from          = navigationState?.from ?? "list";

  const [currentStudent, setCurrentStudent] = useState(passedStudent);

  const [studentName,   setStudentName]   = useState(currentStudent?.name ?? "");
  const [yearSection,   setYearSection]   = useState(currentStudent?.section ?? "");
  const [studentNumber, setStudentNumber] = useState(
    currentStudent?.number ?? currentStudent?.student_no ?? currentStudent?.student_number ?? ""
  );

  const [allGrades,        setAllGrades]        = useState([]);
  const [semesters,        setSemesters]        = useState([]);
  const [selectedSemester, setSelectedSemester] = useState("");
  const [loading,          setLoading]          = useState(false);
  const [error,            setError]            = useState("");

  useEffect(() => {
    const idFromState = currentStudent?.number ?? currentStudent?.student_no ?? currentStudent?.student_number;
    const idFallback = navigationState?.studentId ?? navigationState?.id;
    const id = idFromState || idFallback;
    if (!id) return;

    setLoading(true);
    fetch(`/bridge/student/${encodeURIComponent(id)}`)
      .then(r => r.json())
      .then(data => {
        try {
          if (data.success) {
            const s      = data.data?.student || {};
            const grades = data.data?.grades  || [];

            setStudentName(s.name    || currentStudent?.name    || "");
            setYearSection(s.section || currentStudent?.section || "");
            setStudentNumber(s.number || s.student_no || id);
            
            if (!currentStudent) setCurrentStudent(s);
            setAllGrades(grades);

            const semMap = new Map();
            grades.forEach(g => {
              const label = buildSemLabel(g);
              if (!semMap.has(label)) semMap.set(label, semesterSortKey(label));
            });

            const sorted = [...semMap.entries()]
              .sort((a, b) => b[1] - a[1])
              .map(([label]) => label);

            const finalSemesters = sorted.length > 0 ? sorted : semesterOptions;
            setSemesters(finalSemesters);
            if (finalSemesters.length > 0) setSelectedSemester(finalSemesters[0]);
          }
        } catch (e) {
          console.error("Error processing student data:", e);
          setError("Failed to process student data.");
        }
      })
      .catch((e) => {
        console.error("Fetch error:", e);
        setError("Failed to load grades.");
      })
      .finally(() => setLoading(false));
  }, [currentStudent]);

  if (!currentStudent) {
    return (
      <div className="h-full w-full flex items-center justify-center text-gray-400 min-h-screen">
        <p>No student selected. Please go back and select a student.</p>
      </div>
    );
  }

  const filteredGrades = allGrades.filter(g => buildSemLabel(g) === selectedSemester);

  const validGrades = filteredGrades
    .map(g => parseFloat(g.finalGrade))
    .filter(n => !isNaN(n) && n > 0);

  const gwa = validGrades.length > 0
    ? (validGrades.reduce((a, b) => a + b, 0) / validGrades.length).toFixed(2)
    : "—";

  const backPath = from === 'dashboard'
    ? '/dashboard'
    : from === 'pre-advising'
    ? '/pre-advising-list'
    : '/list';

  const backState = from === 'pre-advising'
    ? {
        yearTitle: navigationState?.yearTitle,
        irregular: navigationState?.isIrregular ?? navigationState?.irregular ?? false,
      }
    : isIrregular
    ? { irregular: true, yearTitle: navigationState?.yearTitle ?? yearTitle }
    : { section, yearLevel, yearTitle };

  const handleBack = () => {
    const backTab = backPath === '/dashboard' ? 'pre-advising-dashboard' : backPath === '/pre-advising-list' ? 'pre-advising-advising' : 'pre-advising-roster';
    navigateToTab(backTab, backState);
  };

  
  const renderBreadcrumb = () => {
    if (from === "dashboard") {
      return (
        <>
          <span className="font-bold text-black/50">Dashboard</span>
          <img src={next} alt="Next" className="w-4 h-4" />
          <span className="font-bold text-black">Student</span>
        </>
      );
    }
    if (from === "pre-advising") {
      return (
        <>
          <span className="font-bold text-black/50">Pre-Advising  ►  Students</span>
        </>
      );
    }
    if (isIrregular) {
      return (
        <>
          <span className="font-bold text-black/50">Irregular Students</span>
          <img src={next} alt="Next" className="w-4 h-4" />
          <span className="font-bold text-black">Student</span>
        </>
      );
    }
    return (
      <>
        <span className="font-bold text-black/50">
          {yearName || `BSIT ${yearLevel}${getOrdinal(yearLevel)} Year`}
        </span>
        <img src={next} alt="Next" className="w-4 h-4" />
        <span className="font-bold text-black/50">Sections</span>
        <img src={next} alt="Next" className="w-4 h-4" />
        <span className="font-bold text-black/50">{section || "—"}</span>
        <img src={next} alt="Next" className="w-4 h-4" />
        <span className="font-bold text-black">Student</span>
      </>
    );
  };

  return (
    <div className="h-full font-RB w-full bg-[#F5F5F5] min-h-screen">

      {/* Header */}
      <div className="p-5 bg-gray-100 pt-14 flex justify-between border-b-5 border-[#D9D9D9] sticky top-0">
        <div className="flex flex-col items-start gap-1 text-[1.5625rem]">
          <div onClick={handleBack} className="cursor-pointer active:scale-95">
            <img src={back} alt="Back" className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-3">
            {renderBreadcrumb()}
          </div>
        </div>
        <Link to="/profile">
          <div className="flex-col cursor-pointer active:scale-95">
            <img src={adminLogo} alt="admin" className="h-10.5 w-10.5" />
            <h1 className="text-xs text-center">Admin</h1>
          </div>
        </Link>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-8 text-sm">

        <div className="flex justify-between items-start mb-8">
          <div className="space-y-2">
            <h1>Name : <span className="ml-2">{studentName}</span></h1>
            <h1>Year and Section : <span className="ml-2">{yearSection}</span></h1>
          </div>
        </div>

        <div className="flex justify-between items-center mb-10">
          <div className="flex flex-col">
            <label className="bg-[#F5F5F5] px-1 text-[0.625rem] text-gray-500">
              Select Semester
            </label>
            <select
              value={selectedSemester}
              onChange={e => setSelectedSemester(e.target.value)}
              className="border border-gray-400 px-4 py-2 pr-8 bg-white text-sm outline-none"
            >
              {semesters.length === 0 && (
                <option value="">No semesters available</option>
              )}
              {semesters.map(sem => (
                <option key={sem} value={sem}>{sem}</option>
              ))}
            </select>
          </div>

          <div className="border border-gray-300 bg-white shadow px-6 py-2 text-sm">
            Application ID : <span className="ml-2">{studentNumber}</span>
          </div>
        </div>

        {loading && <p className="text-center text-gray-500 py-4">Loading grades…</p>}
        {error   && <p className="text-center text-red-500 py-4">{error}</p>}

        {!loading && (
          <>
            <div className="grid grid-cols-6 text-center text-sm mb-6 px-2">
              <div></div>
              <div>Prelim</div>
              <div>Midterm</div>
              <div>Pre-Final</div>
              <div>Final</div>
              <div>Final Grade</div>
            </div>

            <div className="space-y-2">
              {filteredGrades.length === 0 ? (
                <div className="text-center py-6 text-gray-400 text-sm">
                  No grades found for this semester.
                </div>
              ) : (
                filteredGrades.map((subject, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-6 items-center border-b border-gray-300 py-2 px-2 text-sm"
                  >
                    <div className="text-left">
                      <h2>{subject.code}</h2>
                      <p className="text-[0.6875rem] text-gray-600">{subject.title}</p>
                    </div>
                    <div className="text-center">{subject.prelim     || "-"}</div>
                    <div className="text-center">{subject.midterm    || "-"}</div>
                    <div className="text-center">{subject.preFinal   || "-"}</div>
                    <div className="text-center">{subject.final      || "-"}</div>
                    <div className="text-center">
                      {subject.finalGrade != null && subject.finalGrade !== "" ? subject.finalGrade : "-"}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end mt-4 text-sm">
              <span className="mr-3">GWA :</span>
              <span className="text-green-700">{gwa}</span>
            </div>
          </>
        )}

      </main>
    </div>
  );
};

export default StudentGrades;