import { PRE_ADVISING_API } from '../../services/api';
import React, { useEffect, useState, useMemo } from "react";
import { ArrowLeft, ChevronRight, BookOpen, Users, Search } from "lucide-react";

let studentsData = [];

// Helper function to convert JSON integers to UI ordinals
const getOrdinalYear = (level) => {
  const num = parseInt(level, 10);
  if (num === 1) return "1st Year";
  if (num === 2) return "2nd Year";
  if (num === 3) return "3rd Year";
  if (num === 4) return "4th Year";
  return level ? `${level} Year` : "Unknown";
};

// --- VIEW 1: MASTER YEAR LEVEL DIRECTORY (Matches Pre-Advising UI) ---
const YearDirectory = ({ onSelectYear }) => {
  const displayLevels = [
    { name: "1st Year", level: 1, desc: "Manage 1st year section rosters" },
    { name: "2nd Year", level: 2, desc: "Manage 2nd year section rosters" },
    { name: "3rd Year", level: 3, desc: "Manage 3rd year section rosters" },
    { name: "4th Year", level: 4, desc: "Manage 4th year section rosters" },
    { name: "Irregular Students", level: null, desc: "Manage unassigned or irregular rosters" },
  ];

  const directoryCounts = useMemo(() => {
    const counts = { "1st Year": 0, "2nd Year": 0, "3rd Year": 0, "4th Year": 0, "Irregular Students": 0 };
    studentsData.forEach(student => {
      const isIrregular = (student.status || "").toLowerCase() === "irregular";
      if (isIrregular) {
        counts["Irregular Students"] += 1;
      } else {
        const formattedYear = getOrdinalYear(student.yearLevel || student.year);
        if (counts[formattedYear] !== undefined) {
          counts[formattedYear] += 1;
        }
      }
    });
    return counts;
  }, []);

  return (
    <div className="flex flex-col h-full w-full">
      {/* Main Content */}
      <div className="p-8 flex flex-col gap-6 w-full max-w-[1600px] flex-1 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayLevels.map((item, index) => (
            <div
              key={index}
              onClick={() => onSelectYear(item)}
              className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md hover:border-[#1C6100]/30 transition-all duration-300 cursor-pointer flex flex-col justify-between group relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1.5 h-full bg-[#1C6100] opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className="p-3 bg-emerald-50 text-[#1C6100] rounded-xl group-hover:scale-110 transition-transform">
                    <BookOpen size={24} strokeWidth={2} />
                  </span>
                  <span className="text-xs font-bold px-3 py-1 bg-slate-100 text-slate-600 rounded-full">
                    {directoryCounts[item.name] || 0} Students
                  </span>
                </div>
                <h2 className="text-lg font-bold text-slate-800 group-hover:text-[#1C6100] transition-colors">{item.name}</h2>
                <p className="text-xs text-slate-400 mt-1">{item.desc}</p>
              </div>
              
              <div className="mt-6 flex items-center text-xs font-bold text-[#1C6100] gap-1 group-hover:translate-x-1 transition-transform">
                <span>Manage Section</span>
                <ChevronRight size={16} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- VIEW 2: SECTION DRILL-DOWN ---
const SectionDirectory = ({ yearContext, onBack, onSelectSection }) => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (yearContext.level === null) {
      setSections([{ name: "All Irregular Students", active: true }]);
      return;
    }

    setLoading(true);
    setTimeout(() => {
      // Extract unique sections dynamically using the ordinal helper to match context name
      const yearStudents = studentsData.filter(s => {
        const statusStr = (s.status || "").toLowerCase();
        const isRegularOrBlock = statusStr === "regular" || statusStr === "block";
        return getOrdinalYear(s.yearLevel || s.year) === yearContext.name && isRegularOrBlock;
      });
      
      const uniqueSections = [...new Set(yearStudents.map(s => s.section))].sort();
      
      const mappedSections = uniqueSections.map((secName) => ({
        name: secName,
        active: true 
      }));

      setSections(mappedSections);
      setLoading(false);
    }, 300);
  }, [yearContext]);

  return (
    <div className="flex flex-col h-full w-full">
      {/* Header */}
      <div className="px-8 pt-3 pb-3 flex justify-between items-center bg-white shadow-sm z-10">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all cursor-pointer">
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
              <span>Year Level</span>
              <ChevronRight size={12} />
              <span className="text-slate-700 font-semibold">{yearContext.name}</span>
            </div>
            <h1 className="font-bold text-xl text-slate-800 tracking-tight mt-0.5">{yearContext.name} Sections</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-8 flex flex-col gap-6 w-full max-w-[1600px] flex-1 mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col p-6 flex-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1C6100] mb-4"></div>
              <p className="font-medium">Loading sections...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {sections.length > 0 ? sections.map((sec, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelectSection(sec.name)}
                  className={`flex flex-col items-center justify-center p-6 rounded-xl border transition-all duration-300 shadow-sm hover:shadow-md active:scale-95 cursor-pointer ${
                    sec.active
                      ? "bg-green-50/50 border-[#1C6100]/30 hover:border-[#1C6100]"
                      : "bg-white border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <Users size={28} className={`mb-3 ${sec.active ? "text-[#1C6100]" : "text-slate-400"}`} />
                  <span className="font-bold text-lg text-slate-800">{sec.name}</span>
                  <span className={`text-[10px] mt-2 uppercase tracking-widest font-bold px-2 py-1 rounded-md ${
                    sec.active ? "bg-green-100 text-[#1C6100]" : "bg-slate-100 text-slate-500"
                  }`}>
                    {sec.active ? "Active" : "View Roster"}
                  </span>
                </button>
              )) : (
                <div className="col-span-full py-12 text-center text-slate-400 font-medium">
                  No regular sections found for this year level.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- VIEW 3: STUDENT ROSTER LIST ---
const StudentRosterView = ({ yearContext, sectionContext, onBack }) => {
  const [search, setSearch] = useState("");

  const sectionStudents = useMemo(() => {
    return studentsData.filter(student => {
      const isIrregular = (student.status || "").toLowerCase() === "irregular";
      if (yearContext.isIrregular) return isIrregular;
      return !isIrregular && student.section === sectionContext;
    });
  }, [yearContext, sectionContext]);

  const filteredStudents = sectionStudents.filter(student =>
    `${student.firstName || student.first_name || ""} ${student.lastName || student.last_name || ""}`.toLowerCase().includes(search.toLowerCase()) ||
    (student.studentId || student.number || "").includes(search)
  );

  return (
    <div className="flex flex-col h-full w-full">
      {/* Header */}
      <div className="px-8 pt-3 pb-3 flex justify-between items-center bg-white shadow-sm z-10">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all cursor-pointer"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
              <span>Year Level</span>
              <ChevronRight size={12} />
              <span>{yearContext.name}</span>
              <ChevronRight size={12} />
              <span className="text-slate-700 font-semibold">Roster</span>
            </div>
            <h1 className="font-bold text-xl text-slate-800 tracking-tight mt-0.5">{sectionContext}</h1>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="p-8 flex flex-col gap-6 w-full max-w-[1600px] flex-1 mx-auto">
         <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col p-6 flex-1">
           {/* Search Bar */}
           <div className="flex items-center gap-3 mb-6">
             <div className="flex-1 flex items-center border border-slate-200 rounded-xl overflow-hidden focus-within:border-[#1C6100] transition-all bg-slate-50">
               <div className="pl-4 text-slate-400">
                 <Search size={18} strokeWidth={2} />
               </div>
               <input
                 type="text"
                 placeholder="Search by student name or ID..."
                 className="w-full px-3 py-3 text-sm outline-none bg-transparent text-slate-700 placeholder-slate-400"
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
               />
             </div>
           </div>

           {/* Data Table */}
           <div className="w-full overflow-y-auto flex-1 rounded-xl border border-slate-100">
             <table className="w-full text-sm text-left">
               <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider sticky top-0 z-10">
                 <tr>
                   <th className="px-6 py-4 font-semibold">Application ID</th>
                   <th className="px-6 py-4 font-semibold">Student Name</th>
                   <th className="px-6 py-4 font-semibold">Section</th>
                   <th className="px-6 py-4 font-semibold text-center">Status</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                 {filteredStudents.length > 0 ? (
                   filteredStudents.map((student, index) => {
                     const statusStr = (student.status || "").toLowerCase();
                     const isRegular = statusStr === 'regular' || statusStr === 'block';
                     return (
                       <tr key={index} className="hover:bg-slate-50 transition-colors">
                         <td className="px-6 py-4 font-medium text-slate-700">{student.studentNumber || student.studentId || student.number || "—"}</td>
                         <td className="px-6 py-4 text-slate-600 font-medium">{student.firstName || student.first_name} {student.lastName || student.last_name}</td>
                         <td className="px-6 py-4 text-slate-500">{student.section || "—"}</td>
                         <td className="px-6 py-4 text-center">
                           <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${isRegular ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                             {student.status}
                           </span>
                         </td>
                       </tr>
                     );
                   })
                 ) : (
                   <tr>
                     <td colSpan={4} className="py-16 text-center">
                       <div className="flex flex-col items-center justify-center text-slate-400">
                         <Search size={40} strokeWidth={1.5} className="mb-3 opacity-50" />
                         <p className="text-base font-semibold text-slate-600">No students found.</p>
                         <p className="text-xs mt-1">Try adjusting your search criteria.</p>
                       </div>
                     </td>
                   </tr>
                 )}
               </tbody>
             </table>
           </div>
         </div>
      </div>
    </div>
  );
};

// --- MAIN PARENT COMPONENT ---
export default function YearLevel() {
  const [currentView, setCurrentView] = useState("year"); // 'year' | 'section' | 'list'
  const [yearContext, setYearContext] = useState({ level: 1, name: "", isIrregular: false });
  const [sectionContext, setSectionContext] = useState("");
  const [isDbLoaded, setIsDbLoaded] = useState(false);

  // Fetch live students from MongoDB on mount
  useEffect(() => {
    fetch(`${PRE_ADVISING_API}/students`)
      .then(res => res.json())
      .then(data => {
        studentsData.length = 0;
        studentsData.push(...data);
        setIsDbLoaded(true);
      })
      .catch(err => {
        console.error("Failed to fetch database records:", err);
        setIsDbLoaded(true); // Fallback to allow UI to load even if fetch fails
      });
  }, []);

  const handleSelectYear = (year) => {
    setYearContext({ level: year.level, name: year.name, isIrregular: year.level === null });
    
    // If it's irregular, skip section selection entirely
    if (year.level === null) {
      setSectionContext("Irregular");
      setCurrentView("list");
    } else {
      setCurrentView("section");
    }
  };

  const handleSelectSection = (sectionName) => {
    setSectionContext(sectionName);
    setCurrentView("list");
  };

  if (!isDbLoaded) {
    return <div className="h-screen w-full flex items-center justify-center bg-[#f5f6f8] text-slate-500 font-bold font-RB ">Loading Rosters...</div>;
  }

  return (
    <div className="bg-[#f5f6f8] h-full font-RB w-full min-h-screen">
      {currentView === "year" && (
        <YearDirectory onSelectYear={handleSelectYear} />
      )}
      
      {currentView === "section" && (
        <SectionDirectory 
          yearContext={yearContext} 
          onBack={() => setCurrentView("year")}
          onSelectSection={handleSelectSection}
        />
      )}
      
      {currentView === "list" && (
        <StudentRosterView 
          yearContext={yearContext}
          sectionContext={sectionContext}
          onBack={() => setCurrentView(yearContext.isIrregular ? "year" : "section")}
        />
      )}
    </div>
  );
}