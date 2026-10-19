import { useLocation } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { BRAND } from "../../content/site";

export const whatsappLink = (message) =>
  `https://wa.me/${BRAND.whatsapp}?text=${encodeURIComponent(message)}`;

const HIDDEN_ON = ["/chat", "/admin"];

// Floating click-to-chat button shown on every page except chat and admin
const WhatsAppButton = () => {
  const { pathname } = useLocation();
  if (HIDDEN_ON.some((path) => pathname.startsWith(path))) return null;

  return (
    <a
      href={whatsappLink(`Hi ${BRAND.name}, I'd like some help choosing a piece.`)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="group fixed bottom-5 right-5 z-40 flex h-14 items-center gap-2 rounded-full bg-[#25D366] pl-4 pr-4 text-white shadow-[0_8px_24px_rgba(0,0,0,0.18)] transition-all duration-300 hover:pr-5 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#25D366]/40 md:bottom-8 md:right-8"
    >
      <MessageCircle size={24} fill="currentColor" strokeWidth={1.5} className="text-white" />
      <span className="max-w-0 overflow-hidden whitespace-nowrap text-[14px] font-semibold transition-all duration-300 group-hover:max-w-[160px] group-focus-visible:max-w-[160px]">
        Chat on WhatsApp
      </span>
    </a>
  );
};

export default WhatsAppButton;
