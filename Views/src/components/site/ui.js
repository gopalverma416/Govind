import { forwardRef } from "react";
import { AlertCircle, CheckCircle2, ChevronDown, Info, Loader2 } from "lucide-react";

// Shared form and layout pieces so every page uses the same Apple-style controls

export const inputClass =
  "w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-[17px] text-ink placeholder:text-muted/70 transition-shadow focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/15 disabled:bg-mist disabled:text-muted";

export const Field = ({ label, htmlFor, hint, children, className = "" }) => (
  <div className={className}>
    {label && (
      <label htmlFor={htmlFor} className="mb-1.5 block text-[12px] font-semibold text-ink/80">
        {label}
      </label>
    )}
    {children}
    {hint && <p className="mt-1 text-[12px] text-muted">{hint}</p>}
  </div>
);

export const Input = forwardRef(({ className = "", ...props }, ref) => (
  <input ref={ref} className={`${inputClass} ${className}`} {...props} />
));

export const Select = ({ className = "", children, ...props }) => (
  <div className="relative">
    <select className={`${inputClass} appearance-none pr-10 ${className}`} {...props}>
      {children}
    </select>
    <ChevronDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted" />
  </div>
);

export const Button = ({ variant = "primary", loading = false, loadingText, children, className = "", disabled, ...props }) => {
  const styles = {
    primary: "bg-brand text-white hover:bg-brand-hover disabled:bg-brand/50",
    secondary: "border border-black/15 bg-white text-ink hover:bg-mist disabled:text-muted",
    dark: "bg-ink text-white hover:bg-black disabled:bg-ink/50",
  };
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-[17px] font-medium transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-brand/30 disabled:cursor-not-allowed ${styles[variant]} ${className}`}
      {...props}
    >
      {loading && <Loader2 size={18} className="animate-spin" />}
      {loading && loadingText ? loadingText : children}
    </button>
  );
};

export const Alert = ({ tone = "error", children, className = "" }) => {
  if (!children) return null;
  const tones = {
    error: { box: "bg-red-50 text-red-800", Icon: AlertCircle },
    success: { box: "bg-emerald-50 text-emerald-800", Icon: CheckCircle2 },
    info: { box: "bg-mist text-ink/80", Icon: Info },
  };
  const { box, Icon } = tones[tone];
  return (
    <div role={tone === "error" ? "alert" : "status"} className={`flex items-start gap-2.5 rounded-xl px-4 py-3 text-[14px] leading-[1.43] ${box} ${className}`}>
      <Icon size={18} className="mt-px shrink-0" />
      <div>{children}</div>
    </div>
  );
};

export const Card = ({ className = "", children, ...props }) => (
  <div className={`rounded-[18px] bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.06)] md:p-8 ${className}`} {...props}>
    {children}
  </div>
);

// Centred single-column page for sign in, sign up and similar flows
export const AuthShell = ({ title, subtitle, children, footer }) => (
  <main className="min-h-screen bg-mist px-4 pb-16 pt-24 md:pt-28">
    <div className="mx-auto w-full max-w-[460px]">
      <div className="mb-8 text-center">
        <h1 className="text-[32px] font-semibold leading-[1.125] tracking-[0.004em] text-ink md:text-[40px] md:leading-[1.1]">{title}</h1>
        {subtitle && <p className="mt-2 text-[17px] text-muted">{subtitle}</p>}
      </div>
      <Card>{children}</Card>
      {footer && <div className="mt-6 text-center text-[14px] text-muted">{footer}</div>}
    </div>
  </main>
);

export const Divider = ({ children }) => (
  <div className="my-6 flex items-center gap-3 text-[12px] text-muted">
    <span className="h-px flex-1 bg-black/10" />
    {children}
    <span className="h-px flex-1 bg-black/10" />
  </div>
);

export const Spinner = ({ className = "" }) => (
  <div className={`flex justify-center py-16 ${className}`}>
    <Loader2 size={28} className="animate-spin text-muted" />
  </div>
);
