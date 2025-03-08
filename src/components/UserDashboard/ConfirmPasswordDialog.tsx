"use client";

import { useState } from "react";

interface ConfirmPasswordDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (password: string) => Promise<void>;
  title: string;
  message: string;
  confirmButtonText?: string;
  confirmButtonClass?: string;
}

export default function ConfirmPasswordDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmButtonText = "Confirm",
  confirmButtonClass = "bg-black text-white hover:bg-black/80",
}: ConfirmPasswordDialogProps) {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onConfirm(password);
    } catch (error) {
      console.error("Error in password confirmation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="bg-white p-6 rounded-lg w-[400px] animate-[popupIn_0.3s_ease]">
        <h3
          className={`text-xl font-semibold mb-4 ${
            title.toLowerCase().includes("delete")
              ? "text-red-600"
              : "text-gray-900"
          }`}
        >
          {title}
        </h3>
        <p className="text-gray-600 mb-4">{message}</p>

        <form onSubmit={handleSubmit}>
          <div className="relative mb-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-b py-2 peer pt-4 pb-2 focus:outline-none focus:border-black"
              placeholder=" "
              required
            />
            <label className="absolute pointer-events-none text-gray-500 duration-300 transform -translate-y-5 scale-75 top-4 z-10 origin-[0] left-0 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-5">
              Password
            </label>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !password}
              className={`px-4 py-2 rounded-md ${
                isLoading || !password
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : confirmButtonClass
              }`}
            >
              {isLoading ? "..." : confirmButtonText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
