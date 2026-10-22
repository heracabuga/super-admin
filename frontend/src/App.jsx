import React, { useState } from 'react';
import { AdminLogin } from './pages/Portal/AdminLogin';
import { Sidebar } from './components/Portal/Sidebar';
import { Header } from './components/Portal/Header';
import { Broadcast } from './pages/Portal/Broadcast';
import { StudentsRequest } from './pages/Portal/StudentsRequest';
import Dashboard from './pages/Pre-Admission/pages/Dashboard';
import Admission from './pages/Pre-Admission/pages/Admission';
import Applications from './pages/Pre-Admission/pages/Applications';
import Settings from './pages/Pre-Admission/pages/Settings'
import PreAdmission from './pages/Pre-Admission/pages/Pre-Admission.jsx';
import PostAdmission from './pages/Pre-Admission/pages/PostAdmission.jsx';
import { ToastProvider } from './pages/Pre-Admission/components/Toast.jsx';
import EvaluationAdmin from './pages/Evaluation/EvaluationAdmin'
import EnrollmentDashboard from './pages/Enrollment/Dashboard';
import EnrollmentStudents from './pages/Enrollment/StudentList';
import EnrollmentCurriculum from './pages/Enrollment/Curriculum';
import EnrollmentSections from './pages/Enrollment/SectionList';
import EnrollmentSchedules from './pages/Enrollment/Schedules';
import GradingAccounts from './pages/Grading/pages/ManageAccounts';
import GradingViewGrade from './pages/Grading/pages/ViewGrade';
import GradingComponents from './pages/Grading/pages/GradeComponents';
import GradingDeadlines from './pages/Grading/pages/DeadlineAndReminders.jsx';
import { Toaster } from 'react-hot-toast';
import PADashboard from './pages/Pre-Advising/components/dashboard/dashboard';
import PARoster from './pages/Pre-Advising/components/yearLevel/yearLevel';
import PAPreAdvising from './pages/Pre-Advising/components/pre-advising/pre-Advising';
import PASchedule from './pages/Pre-Advising/components/schedule/schedule';
import PAReport from './pages/Pre-Advising/components/report/report';
import PAExternalSchedules from './pages/Pre-Advising/components/schedule/externalschedules';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => localStorage.getItem('isAdminAuthenticated') === 'true'
  );
  const [activeTab, setActiveTab] = useState('pre-admission-dashboard');
  const [navigationState, setNavigationState] = useState(null);

  const navigateToTab = (tabId, state = null) => {
    setActiveTab(tabId);
    setNavigationState(state);
  };

  const handleLogout = () => {
    localStorage.removeItem('isAdminAuthenticated');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <AdminLogin onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  const getTabTitle = () => {
    switch (activeTab) {
      case 'pre-admission-dashboard': return 'Dashboard';
      case 'pre-admission-applications': return 'Applications';
      case 'pre-admission-pre-admission': return 'Pre-Admission';
      case 'pre-admission-post-admission': return 'Post-Admission';
      case 'pre-admission-settings': return 'Settings';
      case 'pre-enrollment-dashboard': return 'Enrollment Dashboard';
      case 'pre-enrollment-students': return 'Enrollment - Students';
      case 'pre-enrollment-curriculum': return 'Enrollment - Curriculum';
      case 'pre-enrollment-sections': return 'Enrollment - Sections';
      case 'pre-enrollment-schedules': return 'Enrollment - Schedules';
      case 'evaluation': return 'Faculty & Course Evaluation';
      case 'grading-accounts': return 'Grading - Manage Accounts';
      case 'grading-view-grade': return 'Grading - View Grade';
      case 'grading-components': return 'Grading - Grade Components';
      case 'grading-deadlines': return 'Grading - Deadlines & Reminders';
      case 'broadcast': return 'Student Portal - Broadcast & Announcements';
      case 'students-request': return 'Student Portal - Students Request';
      case 'pre-advising-dashboard': return 'Pre-Advising Dashboard';
      case 'pre-advising-roster': return 'Student Roster';
      default: return 'Admin Portal';
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>

      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
      />

      <div style={{ flex: 1 }}>
        <Toaster position="top-right" />
        {!['pre-advising-advising', 'pre-advising-schedule', 'pre-advising-report'].includes(activeTab) && <Header title={getTabTitle()} />}
        <main style={{ marginLeft: '260px', padding: activeTab.startsWith('pre-admission') || activeTab.startsWith('pre-enrollment-') || activeTab.startsWith('pre-advising-') ? '0px' : '32px' }}>
          {activeTab === 'broadcast' && <Broadcast />}
          {activeTab === 'students-request' && <StudentsRequest />}

          {activeTab === 'pre-enrollment-dashboard' && <EnrollmentDashboard />}
          {activeTab === 'pre-enrollment-students' && <EnrollmentStudents />}
          {activeTab === 'pre-enrollment-curriculum' && <EnrollmentCurriculum />}
          {activeTab === 'pre-enrollment-sections' && <EnrollmentSections />}
          {activeTab === 'pre-enrollment-schedules' && <EnrollmentSchedules />}

          {activeTab === 'pre-admission-dashboard' && <ToastProvider><Dashboard navigateToTab={navigateToTab} /></ToastProvider>}
          {activeTab === 'pre-admission-applications' && <ToastProvider><Applications navigateToTab={navigateToTab} navigationState={navigationState} /></ToastProvider>}
          {activeTab === 'pre-admission-pre-admission' && <ToastProvider><PreAdmission navigateToTab={navigateToTab} /></ToastProvider>}
          {activeTab === 'pre-admission-post-admission' && <ToastProvider><PostAdmission navigateToTab={navigateToTab} /></ToastProvider>}
          {activeTab === 'pre-admission-settings' && <ToastProvider><Settings navigateToTab={navigateToTab} /></ToastProvider>}
          {activeTab === 'evaluation' && <EvaluationAdmin />}
          {activeTab === 'grading-accounts' && <GradingAccounts />}
          {activeTab === 'grading-view-grade' && <GradingViewGrade />}
          {activeTab === 'grading-components' && <GradingComponents />}
          {activeTab === 'grading-deadlines' && <GradingDeadlines />}

          {activeTab === 'pre-advising-dashboard' && <PADashboard navigateToTab={navigateToTab} navigationState={navigationState} />}
          {activeTab === 'pre-advising-roster' && <PARoster navigateToTab={navigateToTab} navigationState={navigationState} />}
          {activeTab === 'pre-advising-advising' && <PAPreAdvising navigateToTab={navigateToTab} navigationState={navigationState} />}
          {activeTab === 'pre-advising-schedule' && <PASchedule navigateToTab={navigateToTab} navigationState={navigationState} />}
          {activeTab === 'pre-advising-report' && <PAReport navigateToTab={navigateToTab} navigationState={navigationState} />}
          {activeTab === 'pre-advising-external-schedules' && <PAExternalSchedules onBack={() => navigateToTab('pre-advising-schedule')} />}
        </main>
      </div>
    </div>
  );
}