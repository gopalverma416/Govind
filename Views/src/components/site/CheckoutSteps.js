const STEPS = ["Bag", "Delivery", "Review"];

// Bag → Delivery → Review progress shown at the top of checkout pages
const CheckoutSteps = ({ current }) => (
  <ol className="mb-10 flex items-center justify-center gap-3 text-[12px]" aria-label="Checkout progress">
    {STEPS.map((label, i) => {
      const state = i < current ? "done" : i === current ? "current" : "todo";
      return (
        <li key={label} className="flex items-center gap-3">
          {i > 0 && <span className="h-px w-8 bg-black/15 md:w-14" aria-hidden="true" />}
          <span className={`flex items-center gap-1.5 ${state === "current" ? "font-semibold text-ink" : state === "done" ? "text-brand" : "text-muted"}`} aria-current={state === "current" ? "step" : undefined}>
            <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] ${state === "todo" ? "bg-black/10 text-muted" : "bg-brand text-white"}`}>{i + 1}</span>
            {label}
          </span>
        </li>
      );
    })}
  </ol>
);

export default CheckoutSteps;
