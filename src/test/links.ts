/**
 * Links into the location area (/locations, /service-areas/*). The
 * `locationPages` switch in content/visibility.ts hides every one of them, so
 * tests assert these exist exactly while that switch is on.
 */
export function locationPageLinks(container: Element): Element[] {
  return [
    ...container.querySelectorAll('a[href^="/locations"], a[href^="/service-areas"]'),
  ];
}
