"use client";

import { Toaster, ToastBar } from "react-hot-toast";

export function Toast() {
  return (
    <Toaster position="bottom-center">
      {(t) => (
        <ToastBar
          toast={t}
          style={{
            ...t.style,
            background: "white",
            padding: "16px",
            borderRadius: "8px",
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            animation: t.visible
              ? "popupIn 0.3s ease"
              : "popupOut 0.3s ease forwards",
          }}
        >
          {({ icon, message }) => (
            <>
              {icon}
              {message}
            </>
          )}
        </ToastBar>
      )}
    </Toaster>
  );
}
