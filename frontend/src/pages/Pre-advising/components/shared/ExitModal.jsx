import React from "react";
import exitIcon from "../../assets/shared/exit.png";

export default function ExitModal({ isOpen, onClose, onConfirm, message }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      {/* Modal */}
      <div className="bg-white w-107.5 py-12 text-center rounded-[20px] shadow-md pointer-events-auto">
        {/* Exit Image */}
        <div className="flex justify-center mb-5">
          <img
            src={exitIcon}
            alt="exit icon"
            className="w-25 h-25 object-contain"
          />
        </div>

        {/* Text */}
        <p className="text-gray-700 text-[0.9375rem] mb-7">
          {message || "Are you sure you want to exit?"}
        </p>

        {/* Buttons */}
        <div className="flex justify-center gap-5">
          <button
            onClick={onConfirm}
            className="bg-[#2E7D32] text-white text-sm px-7 py-2 rounded-[10px] hover:opacity-90 transition"
          >
            Yes
          </button>

          <button
            onClick={onClose}
            className="bg-[#CFCFCF] text-gray-700 text-sm px-7 py-2 rounded-[10px] hover:opacity-90 transition"
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
}