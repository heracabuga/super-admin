import React from "react";
import { AlertCircle, CheckCircle2, Trash2 } from "lucide-react";

const ConfirmModal = ({ 
  show, 
  onCancel, 
  onConfirm, 
  title, 
  message, 
  type = "danger", 
  confirmText = "Yes", 
  cancelText = "Cancel" 
}) => {
  if (!show) return null;

  // Dynamically map colors and icons based on the requested modal type
  const isDanger = type === "danger";
  const isSuccess = type === "success";

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-[90] p-4 font-RB">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-[400px] text-center space-y-4 border border-slate-100 flex flex-col items-center">
        
        {/* Dynamic Icon Wrapper */}
        <div className={`flex items-center justify-center w-16 h-16 rounded-full border shadow-sm ${
          isDanger ? 'bg-red-50 text-red-600 border-red-100' : 
          isSuccess ? 'bg-emerald-50 text-[#1C6100] border-emerald-100' : 
          'bg-blue-50 text-blue-600 border-blue-100'
        }`}>
          {isDanger && <Trash2 size={32} />}
          {isSuccess && <CheckCircle2 size={32} />}
          {!isDanger && !isSuccess && <AlertCircle size={32} />}
        </div>
        
        {/* Text Content */}
        <div className="w-full">
          {title && <h2 className="text-xl font-bold text-slate-800 mb-2">{title}</h2>}
          <p className="text-sm text-slate-500 leading-relaxed">
            {message || "Are you sure you want to proceed?"}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-3 pt-4 mt-2 w-full">
          {onCancel && (
            <button
              className="px-5 py-2.5 bg-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-300 transition w-full"
              onClick={onCancel}
            >
              {cancelText}
            </button>
          )}
          
          <button
            className={`px-5 py-2.5 text-white font-semibold rounded-xl transition shadow-sm w-full ${
              isDanger ? 'bg-red-600 hover:bg-red-700' : 
              isSuccess ? 'bg-[#1C6100] hover:bg-[#154900]' : 
              'bg-blue-600 hover:bg-blue-700'
            }`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;