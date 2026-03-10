import React from "react";

const WhatsAppButton: React.FC = () => {
  return (
    <a
      href="https://wa.me/916397255377" // <-- Replace with your WhatsApp number
      target="_blank"
      rel="noopener noreferrer"
      className="
        fixed bottom-20 right-5
        z-50
        md:bottom-40 md:right-8
      "
    >
      <img
        src="/whatsapp.png" // <-- Place your icon in public folder
        alt="WhatsApp Chat"
        className="
          w-12 h-12         /* mobile size */
          md:w-16 md:h-16   /* desktop size */
          drop-shadow-xl
          rounded-full
          hover:scale-110
          transition-all
        "
      />
    </a>
  );
};

export default WhatsAppButton;
