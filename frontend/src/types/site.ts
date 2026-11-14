/** Single source of truth for pages, subpages and routes. */

export interface SubPage {
  id: string;
  label: string;
}

export interface PageDef {
  id: string;
  label: string;
  path: string;
  subs?: SubPage[];
}

export const PAGES: PageDef[] = [
  { id: "home", label: "Home", path: "/" },
  {
    id: "explorer",
    label: "Explorer",
    path: "/explorer",
    subs: [
      { id: "sky", label: "Sky" },
      { id: "object", label: "Object" },
      { id: "spectral", label: "Spectral" },
    ],
  },
  { id: "time", label: "Time Machine", path: "/time-machine" },
  {
    id: "lab",
    label: "Lab",
    path: "/lab",
    subs: [
      { id: "discovery", label: "Discovery" },
      { id: "light-curves", label: "Light Curves" },
      { id: "my-discovery", label: "My Discoveries" },
    ],
  },
  { id: "mission", label: "Mission", path: "/mission" },
];

export const pageById = (id: string): PageDef | undefined => PAGES.find((p) => p.id === id);
export const subPath = (p: PageDef, s: SubPage | { id: string }): string => `${p.path}/${s.id}`;
export const firstPath = (p: PageDef): string => (p.subs && p.subs.length > 0 ? subPath(p, p.subs[0]) : p.path);
