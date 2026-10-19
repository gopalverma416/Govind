import { Link } from "react-router-dom";

// Thin promo strip under the global nav, like apple.com's homepage ribbon
const Ribbon = ({ children, linkText, to }) => (
  <div className="bg-mist">
    <p className="mx-auto max-w-content px-4 py-[13px] text-center text-[14px] leading-[1.43] text-ink">
      {children}{" "}
      {linkText && (
        <Link to={to} className="whitespace-nowrap text-brand hover:underline">
          {linkText}
          <span aria-hidden="true"> ›</span>
        </Link>
      )}
    </p>
  </div>
);

export default Ribbon;
