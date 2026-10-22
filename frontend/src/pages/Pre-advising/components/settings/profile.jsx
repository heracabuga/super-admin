import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ExitModal from "../shared/ExitModal";
import adminAvatar from "../../assets/shared/adminLogo.png"; 

const EditProfile = ({ navigateToTab, navigationState }) => {
  
  const [isModalOpen, setIsModalOpen] = useState(false);

  // State for each input field
  const [fullName, setFullName] = useState("Admin Dela Cruz");
  const [username, setUsername] = useState("Admin");
  const [gsuite, setGsuite] = useState("999999999999");
  const [position, setPosition] = useState("Admin");

  // State to toggle readonly/editable
  const [editFields, setEditFields] = useState({
    fullName: false,
    username: false,
    gsuite: false,
    position: false,
  });

  // Toggle edit mode for a field
  const toggleEdit = (field) => {
    setEditFields((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  useEffect(() => {
    fetch('/bridge/profile')
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          const p = data.data || {}
          setFullName(p.full_name ?? p.fullName ?? p.name ?? fullName)
          setUsername(p.username ?? username)
          setGsuite(p.gsuite ?? gsuite)
          setPosition(p.position ?? position)
        }
      })
      .catch(() => {})
  }, [])

  const handleFileUpload = async (e) => {
    const file = e.target.files && e.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/bridge/profile/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (data.success) {
        alert('Profile picture updated!')
      } else {
        alert('Upload failed: ' + (data.error || 'Unknown error'))
      }
    } catch (err) {
      alert('Upload failed: ' + err.message)
    } finally {
      // clear the input value so same file can be uploaded again if needed
      if (e.target) e.target.value = ''
    }
  }

  return (
    <div className="font-RB w-full bg-white min-h-screen">
      {/* Header */}
      <div className="px-8 pt-4 pb-4 border-b-[3px] border-[#D9D9D9]">
        <h1 className="font-bold text-2xl text-black">Admin Profile</h1>
      </div>

      <div className="p-8 max-w-[1000px]">
        {/* Main Profile Card */}
        <div className="border border-gray-300 rounded-sm bg-white shadow-sm">
          <div className="px-5 py-4 border-b border-gray-300 bg-gray-50">
            <h2 className="text-sm font-bold text-gray-700">Account Information</h2>
          </div>
          
          <div className="p-8 flex flex-col md:flex-row gap-8">
            {/* Avatar Section */}
            <div className="flex flex-col items-center gap-4">
              <div className="w-32 h-32 rounded-full bg-gray-200 border-4 border-white shadow-lg overflow-hidden">
                <img src={adminAvatar} alt="Profile" className="w-full h-full object-cover" />
              </div>
              <button className="text-sm text-[#1C6100] font-medium hover:underline">Change Photo</button>
            </div>

            {/* Form Fields */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500 uppercase">Full Name</label>
                <input type="text" className="border border-gray-300 rounded-sm px-3 py-2 text-sm outline-none focus:border-[#1C6100]" defaultValue="System Admin" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500 uppercase">Email Address</label>
                <input type="email" className="border border-gray-300 rounded-sm px-3 py-2 text-sm outline-none focus:border-[#1C6100]" defaultValue="admin@iiti.edu.ph" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500 uppercase">Department</label>
                <input type="text" className="border border-gray-300 rounded-sm px-3 py-2 text-sm outline-none bg-gray-50" value="IT Department" readOnly />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500 uppercase">Employee ID</label>
                <input type="text" className="border border-gray-300 rounded-sm px-3 py-2 text-sm outline-none bg-gray-50" value="2026-0001" readOnly />
              </div>
            </div>
          </div>

          <div className="px-8 py-4 bg-gray-50 border-t border-gray-300 flex justify-end gap-3">
            <button className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancel</button>
            <button className="bg-[#1C6100] text-white px-6 py-2 rounded-sm text-sm font-medium hover:bg-[#154900] transition-colors shadow-sm">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Reusable Editable Field Component
const EditableField = ({ label, value, setValue, editable, toggleEdit }) => (
  <div>
    <label className="text-[0.75rem] text-gray-500">{label}</label>
    <div className="mt-2 w-127 h-14.5 bg-white border border-gray-300 rounded-[20px] flex items-center justify-between px-5">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full bg-transparent outline-none text-[0.875rem] text-gray-700"
        readOnly={!editable}
      />
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={`w-6 h-6 ml-3 cursor-pointer ${
          editable ? "text-green-500" : "text-gray-400"
        }`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        onClick={toggleEdit}
      >
        <path
          strokeWidth={2}
          d="M15.232 5.232l3.536 3.536M9 13l6.232-6.232a2.5 2.5 0 113.536 3.536L12.536 16.536H9V13z"
        />
      </svg>
    </div>
  </div>
);

export default EditProfile;