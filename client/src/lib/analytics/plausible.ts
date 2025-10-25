export function loadPlausible(domain: string) {
  if (document.querySelector('script[src*="plausible.io/js/script.js"]')) return;
  const s = document.createElement("script");
  s.async = true;
  s.defer = true;
  s.dataset.domain = domain;
  s.src = "https://plausible.io/js/script.js";
  document.head.appendChild(s);
}

export function track(event: string, props?: Record<string, any>) {
  // @ts-ignore
  window.plausible?.(event, { props });
}
