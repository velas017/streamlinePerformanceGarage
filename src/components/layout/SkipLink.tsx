/** First focusable element on every page; visible only when focused (WCAG 2.4.1). */
export function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only z-[100] rounded-md bg-accent px-4 py-3 font-semibold text-accent-fg focus-ring focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
    >
      Skip to main content
    </a>
  );
}
