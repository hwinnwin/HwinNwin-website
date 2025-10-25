export function SkipNav() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-background focus:text-foreground focus:shadow-lg focus:rounded-md focus:m-4"
      data-testid="skip-nav-link"
    >
      Skip to main content
    </a>
  );
}
