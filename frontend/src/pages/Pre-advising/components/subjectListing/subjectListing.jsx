import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import adminLogo from "../../assets/shared/adminLogo.png";
import back from "../../assets/shared/arrow.png";
import next from "../../assets/shared/next.png";

const defaultSubjects = [
  { code: "CC101", title: "Introduction to Programming" },
  { code: "PFT61", title: "Physical Fitness and Training" },
];

const SubjectListing = ({ navigateToTab, navigationState }) => {
  const [view, setView] = useState("listing"); // 'listing' | 'students'
  const [selectedSubject, setSelectedSubject] = useState(null);

  // --- LISTING STATE ---
  const [searchListing, setSearchListing] = useState("");
  const [subjects, setSubjects] = useState(defaultSubjects);

  // --- STUDENTS STATE ---
  const [searchStudents, setSearchStudents] = useState("");
  const [professors, setProfessors] = useState([]);
  const [selectedProfessorId, setSelectedProfessorId] = useState(null);
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Fetch Subjects on mount
  useEffect(() => {
    fetch("/bridge/subject-listing")
      .then((r) => r.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setSubjects(data.data);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch Students/Professors when view changes to 'students'
  useEffect(() => {
    if (view === "students" && selectedSubject) {
      const subjectCode = selectedSubject.code;

      fetch(`/bridge/subject-professors/${encodeURIComponent(subjectCode)}`)
        .then((r) => r.json())
        .then((data) => {
          setProfessors(data.success && Array.isArray(data.data) ? data.data : []);
        })
        .catch(() => setProfessors([]));

      setLoadingStudents(true);
      fetch(`/bridge/subject-students/${encodeURIComponent(subjectCode)}`)
        .then((r) => r.json())
        .then((data) => {
          setStudents(data.success && Array.isArray(data.data) ? data.data : []);
        })
        .catch(() => setStudents([]))
        .finally(() => setLoadingStudents(false));
    } else {
      setProfessors([]);
      setStudents([]);
      setSearchStudents("");
      setSelectedProfessorId(null);
    }
  }, [view, selectedSubject]);

  // --- LISTING LOGIC ---
  const filteredSubjects = subjects.filter(
    (s) =>
      (s.code || "").toLowerCase().includes(searchListing.toLowerCase()) ||
      (s.title || "").toLowerCase().includes(searchListing.toLowerCase())
  );

  const handleSubjectClick = (subject) => {
    setSelectedSubject(subject);
    setView("students");
  };

  // --- STUDENTS LOGIC ---
  const visibleStudents = students
    .filter((s) => (selectedProfessorId ? s.professorId === selectedProfessorId : true))
    .filter(
      (s) =>
        (s.name || "").toLowerCase().includes(searchStudents.toLowerCase()) ||
        (s.number || "").toString().includes(searchStudents)
    );

  const toggleProfessor = (id) => {
    setSelectedProfessorId((prev) => (prev === id ? null : id));
  };

  const handlePrint = () => {
    window.print();
  };

  const handlePrintAll = () => {
    const previousFilter = selectedProfessorId;
    setSelectedProfessorId(null);
    setTimeout(() => {
      window.print();
      setSelectedProfessorId(previousFilter);
    }, 100);
  };

  // --- RENDER ---
  return (
    <div className="bg-gray-100 h-full font-RB w-full min-h-screen flex flex-col">
      {view === "listing" ? (
        <>
          {/* LISTING HEADER */}
          <div className="p-5 pt-14 flex justify-between border-b-5 border-[#D9D9D9]">
            <h1 className="font-bold text-2xl p-5">Subject Listing</h1>

            <div className="flex items-center gap-4">
              <div className="flex items-center bg-[#E5E5E5] rounded-full px-4 py-2 w-65">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
                </svg>
                <div className="w-px h-5 bg-gray-400 mr-2"></div>
                <input
                  type="text"
                  placeholder="Search Subject"
                  value={searchListing}
                  onChange={(e) => setSearchListing(e.target.value)}
                  className="bg-transparent outline-none text-sm w-full placeholder-gray-500"
                />
              </div>
            </div>
          </div>

          {/* LISTING CONTENT */}
          <main className="px-8 py-8 flex-1">
            <div className="flex flex-col gap-3 max-w-4xl">
              {filteredSubjects.length > 0 ? (
                filteredSubjects.map((subject, index) => (
                  <div
                    key={index}
                    onClick={() => handleSubjectClick(subject)}
                    className="bg-[#1C6100] text-white rounded-xl px-5 py-3.5 shadow-md cursor-pointer hover:bg-green-800 transition text-center"
                  >
                    <h2 className="text-base font-bold">{subject.code}</h2>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-gray-400 text-sm">No subjects found.</div>
              )}
            </div>
          </main>
        </>
      ) : (
        <>
          {/* STUDENTS HEADER */}
          <div className="p-5 pt-14 flex justify-between border-b-5 border-[#D9D9D9] items-start">
            <div className="flex flex-col items-start gap-1">
              <button onClick={() => setView("listing")} className="cursor-pointer">
                <img src={back} alt="Back" className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-3 text-[20px]">
                <button onClick={() => setView("listing")} className="font-bold text-black/50 cursor-pointer hover:underline">
                  Subject Listing
                </button>
                <img src={next} alt="Next" className="w-4 h-4" />
                <span className="font-bold text-black">{selectedSubject?.code}</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center bg-[#E5E5E5] rounded-full px-4 py-2 w-56">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
                </svg>
                <div className="w-px h-5 bg-gray-400 mr-2"></div>
                <input
                  type="text"
                  placeholder="Search"
                  value={searchStudents}
                  onChange={(e) => setSearchStudents(e.target.value)}
                  className="bg-transparent outline-none text-sm w-full placeholder-gray-500"
                />
              </div>

              <Link to="/profile">
                <div className="flex flex-col items-center cursor-pointer active:scale-95">
                  <img src={adminLogo} alt="admin" className="h-10.5 w-10.5" />
                  <h1 className="text-xs text-center">Admin</h1>
                </div>
              </Link>
            </div>
          </div>

          {/* STUDENTS MAIN */}
          <main className="px-8 py-6 flex-1">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h1 className="text-2xl font-bold">{selectedSubject?.code}</h1>
                {selectedSubject?.title && <p className="text-sm text-gray-600">{selectedSubject.title}</p>}
              </div>

              <div className="flex gap-3">
                <button onClick={handlePrint} className="px-6 py-2 bg-[#1C6100] text-white rounded-md text-sm font-bold cursor-pointer hover:bg-green-800">
                  Print
                </button>
                <button onClick={handlePrintAll} className="px-6 py-2 bg-[#1C6100] text-white rounded-md text-sm font-bold cursor-pointer hover:bg-green-800">
                  Print All
                </button>
              </div>
            </div>

            <div className="flex gap-3 my-4 flex-wrap">
              {professors.map((prof) => {
                const isActive = selectedProfessorId === prof.id;
                return (
                  <button
                    key={prof.id}
                    onClick={() => toggleProfessor(prof.id)}
                    className={`px-5 py-1.5 rounded-full text-sm font-semibold cursor-pointer transition-colors ${
                      isActive ? "bg-[#1C6100] text-white" : "bg-white text-[#1C6100] border border-[#1C6100] hover:bg-green-50"
                    }`}
                  >
                    {prof.name}
                  </button>
                );
              })}
            </div>

            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#1C6100] text-white text-sm">
                  <th className="border border-[#1C6100] p-2 text-left">Application ID</th>
                  <th className="border border-[#1C6100] p-2 text-left">Student Name</th>
                  <th className="border border-[#1C6100] p-2 text-left">Section</th>
                  <th className="border border-[#1C6100] p-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white text-sm">
                {loadingStudents ? (
                  <tr><td colSpan={4} className="text-center py-6 text-gray-400">Loading students…</td></tr>
                ) : visibleStudents.length > 0 ? (
                  visibleStudents.map((student, index) => (
                    <tr key={index}>
                      <td className="border p-2">{student.number}</td>
                      <td className="border p-2">{student.name}</td>
                      <td className="border p-2">{student.section}</td>
                      <td className="border p-2">{student.status}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={4} className="text-center py-6 text-gray-400">No students found.</td></tr>
                )}
              </tbody>
            </table>
          </main>
        </>
      )}
    </div>
  );
};

export default SubjectListing;