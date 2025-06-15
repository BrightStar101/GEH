import React from "react";

export default function PurchasePromptModal({ open, onClose, onConfirm }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Need More Prompts?</h2>
        <p className="text-gray-600">You’ve used all your current prompts. Would you like to purchase 50 more for $3?</p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
          >
            Buy 50 Prompts
          </button>
        </div>
      </div>
    </div>
  );
}