"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import clsx from "clsx";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import type { CheckedState } from "@radix-ui/react-checkbox";
import { Badge } from "@/components/ui/badge";

import {
  Bell,
  Building2,
  ChevronLeft,
  ChevronRight,
  Factory,
  FileText,
  Grid2X2,
  Home,
  KanbanSquare,
  Languages,
  LogOut,
  Menu,
  Moon,
  Package,
  Search,
  Settings,
  Sun,
  UserCircle2,
  Users,
  Plus,
  ArrowRight,
} from "lucide-react";

/* =========================
   Typen
   ========================= */
type ModuleKey =
  | "dashboard"
  | "employees"
  | "contacts"
  | "prodtypes"
  | "articles"
  | "opps";

type StageKey = "open" | "qualified" | "won" | "lost";

interface Employee {
  id: string;
  name: string;
  first: string;
  code: string;
}
interface Contact {
  id: string;
  name: string;
  city: string;
  email: string;
}
interface ProdType {
  id: string;
  name: string;
}
interface Opportunity {
  id: string;
  title: string;
  owner: string;
  amount: number;
  stage: StageKey;
}

interface Route {
  module: ModuleKey;
  view: string;
  id: string | null;
}

interface NavItem {
  key: ModuleKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}
interface NavGroup {
  group: string;
  items: NavItem[];
}

type CmdModule = {
  type: "Modul";
  id: ModuleKey;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
};
type CmdRecord =
  | { type: "Kontakt"; id: string; title: string; payload: Contact }
  | { type: "Mitarbeiter"; id: string; title: string; payload: Employee }
  | { type: "Opportunity"; id: string; title: string; payload: Opportunity };

function IconEl({ icon: Icon }: { icon: React.ComponentType<{ className?: string }> }) {
  return <Icon className="h-4 w-4 mr-2" />;
}

function formatAmount(a: number) {
  return a.toLocaleString();
}

const OPP_COLUMNS = [
  { id: "open", title: "Open" },
  { id: "qualified", title: "Qualified" },
  { id: "won", title: "Won" },
  { id: "lost", title: "Lost" },
] as const;

/* =========================
   Demo-Daten
   ========================= */
const EMPLOYEES: Employee[] = [
  { id: "APL", name: "Plumacher", first: "Andreas", code: "APL" },
  { id: "TPO", name: "Ponkalo", first: "Thierry", code: "TPO" },
];

const CONTACTS: Contact[] = [
  { id: "C001", name: "AB AUTOMOTIVE", city: "Vilvoorde", email: "info@ab-automotive.be" },
  { id: "C002", name: "ABAX", city: "Diegem", email: "info@abax.com" },
  { id: "C003", name: "AB LEASE NV", city: "Sint-Pieters-Leeuw", email: "info@ablease.com" },
];
const PROD_TYPES: ProdType[] = [
  { id: "PT001", name: "Standard" },
  { id: "PT002", name: "Premium" },
  { id: "PT003", name: "Custom" },
];
export default function ERPFrontendDemo() {
  // small helpers & missing pieces restored to keep demo compiling
  const [openCmd, setOpenCmd] = useState<boolean>(false);
  const [quick, setQuick] = useState<string>("");
  const [route, setRoute] = useState<Route>({ module: "dashboard", view: "list", id: null });
  const [opps, setOpps] = useState<Opportunity[]>([]);
  const [dark, setDark] = useState<boolean>(false);

  // Initialize theme: read saved preference or system preference on client
  useEffect(() => {
    try {
      const stored = localStorage.getItem("theme-pref");
      if (stored) {
        setDark(stored === "dark");
      } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
        setDark(true);
      }
    } catch (e) {}
  }, []);

  // apply/remove class on document root and persist
  useEffect(() => {
    try {
      const el = document.documentElement;
      if (dark) el.classList.add("dark");
      else el.classList.remove("dark");
      localStorage.setItem("theme-pref", dark ? "dark" : "light");
    } catch (e) {}
  }, [dark]);

  const labelForModule = (m: ModuleKey) => {
    switch (m) {
      case "dashboard":
        return "Dashboard";
      case "employees":
        return "Mitarbeiter";
      case "contacts":
        return "Kontakte";
      case "prodtypes":
        return "Produktionstypen";
      case "articles":
        return "Artikel";
      case "opps":
        return "Opportunitäten";
    }
  };

  function IconEl({ icon: Icon }: { icon: React.ComponentType<{ className?: string }> }) {
    return <Icon className="h-4 w-4 mr-2" />;
  }

  function formatAmount(a: number) {
    return a.toLocaleString();
  }

  const OPP_COLUMNS = [
    { id: "open", title: "Open" },
    { id: "qualified", title: "Qualified" },
    { id: "won", title: "Won" },
    { id: "lost", title: "Lost" },
  ] as const;

  // alias for missing icon used in markup
  const Loupe2 = Search;
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      // Open command palette: Ctrl/Cmd+K or '/'
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpenCmd(true);
        return;
      }
      if (e.key === "/") {
        setOpenCmd(true);
        return;
      }

      // Quick-jump: press 'g' then one of c/o/a/e
      if (e.key.toLowerCase() === "g") {
        const handler = (ev: KeyboardEvent) => {
          const map: Record<"c" | "o" | "a" | "e", ModuleKey> = {
            c: "contacts",
            o: "opps",
            a: "articles",
            e: "employees",
          };
          const k = ev.key.toLowerCase() as "c" | "o" | "a" | "e";
          const m = map[k];
          if (m) {
            setRoute({ module: m, view: m === "opps" ? "board" : m === "articles" ? "new" : "list", id: null });
          }
          window.removeEventListener("keydown", handler, true);
        };
        window.addEventListener("keydown", handler, true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Globale Suche (Index)
  const globalIndex = useMemo(() => {
    const mods: CmdModule[] = [
      { type: "Modul", id: "contacts", title: "Kontakte", icon: Users },
      { type: "Modul", id: "opps", title: "Opportunitäten", icon: KanbanSquare },
      { type: "Modul", id: "articles", title: "Artikel", icon: Package },
      { type: "Modul", id: "employees", title: "Mitarbeiter", icon: UserCircle2 },
      { type: "Modul", id: "prodtypes", title: "Produktionstypen", icon: Factory },
    ];
    const records: CmdRecord[] = [
      ...CONTACTS.map((c): CmdRecord => ({ type: "Kontakt", id: c.id, title: c.name, payload: c })),
      ...EMPLOYEES.map((e): CmdRecord => ({ type: "Mitarbeiter", id: e.id, title: `${e.first} ${e.name}`, payload: e })),
      ...opps.map((o): CmdRecord => ({ type: "Opportunity", id: o.id, title: o.title, payload: o })),
    ];
    return { mods, records };
  }, [opps]);

  function handleCmdSelect(item: CmdModule | CmdRecord) {
    if (item.type === "Modul") {
      const view = item.id === "opps" ? "board" : item.id === "articles" ? "new" : "list";
      setRoute({ module: item.id, view, id: null });
    } else if (item.type === "Kontakt") {
      setRoute({ module: "contacts", view: "detail", id: item.id });
    } else if (item.type === "Mitarbeiter") {
      setRoute({ module: "employees", view: "detail", id: item.id });
    } else {
      setRoute({ module: "opps", view: "board", id: item.id });
    }
    setOpenCmd(false);
  }

  function tryQuickJump() {
    const q = quick.trim().toLowerCase();
    if (!q) return setOpenCmd(true);

    const byId = <T extends { id: string; code?: string }>(arr: T[]) =>
      arr.find((x) => x.id.toLowerCase() === q || (x.code && x.code.toLowerCase() === q));

    const e = byId(EMPLOYEES);
    if (e) return setRoute({ module: "employees", view: "detail", id: e.id });

    const c = byId(CONTACTS);
    if (c) return setRoute({ module: "contacts", view: "detail", id: c.id });

    const o = byId(opps);
    if (o) return setRoute({ module: "opps", view: "board", id: o.id });

    setOpenCmd(true);
  }

  // Navigation
  const NAV: NavGroup[] = [
    {
      group: "Stammdaten",
      items: [
        { key: "employees", label: "Mitarbeiter", icon: UserCircle2 },
        { key: "contacts", label: "Kontakte", icon: Users },
        { key: "prodtypes", label: "Produktionstypen", icon: Factory },
        { key: "articles", label: "Artikel", icon: Package },
      ],
    },
    { group: "Verkäufe", items: [{ key: "opps", label: "Opportunitäten", icon: KanbanSquare }] },
  ];

  // Mobile-Nav + collapsed sidebar + employees state
  const [openNav, setOpenNav] = useState<boolean>(false);
  const [collapsed, setCollapsed] = useState<boolean>(false);

  // Sidebar sizing (user-resizable)
  const [sidebarWidth, setSidebarWidth] = useState<number>(260);
  const collapsedWidth = 72;
  const minSidebar = 56;
  const maxSidebar = 480;
  const lastSidebarRef = React.useRef<number>(260);
  const draggingRef = React.useRef<boolean>(false);
  const startXRef = React.useRef<number>(0);
  const startWidthRef = React.useRef<number>(260);

  // load saved width on client
  useEffect(() => {
    try {
      const v = localStorage.getItem("sidebar-width");
      if (v) {
        const n = Number(v);
        if (!Number.isNaN(n)) setSidebarWidth(Math.min(maxSidebar, Math.max(minSidebar, n)));
      }
    } catch (e) {}
  }, []);

  // persist width when it changes (but avoid persisting collapsed width)
  useEffect(() => {
    try {
      if (!collapsed) localStorage.setItem("sidebar-width", String(sidebarWidth));
    } catch (e) {}
  }, [sidebarWidth, collapsed]);

  const [employees, setEmployees] = useState<Employee[]>(EMPLOYEES);
  function addEmployee(emp: Employee) {
    setEmployees((s) => [emp, ...s]);
  }
  function updateEmployee(emp: Employee) {
    setEmployees((s) => s.map((e) => (e.id === emp.id ? emp : e)));
  }
  function removeEmployee(id: string) {
    setEmployees((s) => s.filter((e) => e.id !== id));
    if (route.module === "employees" && route.id === id) setRoute({ module: "employees", view: "list", id: null });
  }

  useEffect(() => {
    const onUpdate = (ev: Event) => {
      const detail = (ev as CustomEvent).detail as Employee;
      if (detail) updateEmployee(detail);
    };
    const onRemove = (ev: Event) => {
      const id = (ev as CustomEvent).detail as string;
      if (id) removeEmployee(id);
    };
    window.addEventListener('erp:updateEmployee', onUpdate as EventListener);
    window.addEventListener('erp:removeEmployee', onRemove as EventListener);
    return () => {
      window.removeEventListener('erp:updateEmployee', onUpdate as EventListener);
      window.removeEventListener('erp:removeEmployee', onRemove as EventListener);
    };
  }, [route]);

  // handle collapse restore/save
  useEffect(() => {
    if (collapsed) {
      lastSidebarRef.current = sidebarWidth;
      setSidebarWidth(collapsedWidth);
    } else {
      const restore = lastSidebarRef.current || 260;
      setSidebarWidth(Math.min(maxSidebar, Math.max(minSidebar, restore)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collapsed]);

  // Drag handlers
  function onResizerMouseDown(e: React.MouseEvent) {
    e.preventDefault();
    draggingRef.current = true;
    startXRef.current = e.clientX;
    startWidthRef.current = sidebarWidth;
    document.addEventListener("mousemove", onResizerMouseMove);
    document.addEventListener("mouseup", onResizerMouseUp);
  }
  function onResizerMouseMove(e: MouseEvent) {
    if (!draggingRef.current) return;
    const dx = e.clientX - startXRef.current;
    const newW = Math.min(maxSidebar, Math.max(minSidebar, startWidthRef.current + dx));
    setSidebarWidth(newW);
  }
  function onResizerMouseUp() {
    draggingRef.current = false;
    try {
      if (!collapsed) localStorage.setItem("sidebar-width", String(sidebarWidth));
    } catch (e) {}
    document.removeEventListener("mousemove", onResizerMouseMove);
    document.removeEventListener("mouseup", onResizerMouseUp);
  }
  function onResizerTouchStart(e: React.TouchEvent) {
    const t = e.touches[0];
    draggingRef.current = true;
    startXRef.current = t.clientX;
    startWidthRef.current = sidebarWidth;
    document.addEventListener("touchmove", onResizerTouchMove);
    document.addEventListener("touchend", onResizerTouchEnd);
  }
  function onResizerTouchMove(e: TouchEvent) {
    if (!draggingRef.current) return;
    const t = e.touches[0];
    const dx = t.clientX - startXRef.current;
    const newW = Math.min(maxSidebar, Math.max(minSidebar, startWidthRef.current + dx));
    setSidebarWidth(newW);
  }
  function onResizerTouchEnd() {
    draggingRef.current = false;
    try {
      if (!collapsed) localStorage.setItem("sidebar-width", String(sidebarWidth));
    } catch (e) {}
    document.removeEventListener("touchmove", onResizerTouchMove);
    document.removeEventListener("touchend", onResizerTouchEnd);
  }

  return (
  <div className={clsx("min-h-screen w-full font-sans")}>
      <div className="grid grid-rows-[56px_1fr] grid-cols-1 bg-background text-foreground transition-colors duration-300">
        {/* Topbar */}
        <header className="border-b bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/40">
          <div className="h-14 px-3 sm:px-4 flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Sheet open={openNav} onOpenChange={setOpenNav}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="sm:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-72">
                  <SideNav nav={NAV} route={route} setRoute={(r) => { setRoute(r); setOpenNav(false); }} collapsed={collapsed} setCollapsed={setCollapsed} />
                </SheetContent>
              </Sheet>
              {/* Desktop collapse toggle */}
              <Button variant="ghost" size="icon" className="hidden sm:inline-flex" onClick={() => setCollapsed((c) => !c)}>
                {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
              </Button>
              <nav className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground" aria-label="Breadcrumb">
                <button
                  type="button"
                  onClick={() => setRoute({ module: 'dashboard', view: 'home', id: null })}
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:underline"
                >
                  <Home className="h-4 w-4" />
                </button>
                <ChevronRight className="h-4 w-4" />
                <button
                  type="button"
                  onClick={() => setRoute({ module: route.module, view: route.module === 'opps' ? 'board' : route.module === 'articles' ? 'new' : 'list', id: null })}
                  className="font-medium hover:underline"
                >
                  {labelForModule(route.module)}
                </button>
                {route.id && (
                  <>
                    <ChevronRight className="h-4 w-4" />
                    <button
                      type="button"
                      onClick={() => setRoute({ module: route.module, view: 'detail', id: route.id })}
                      className="truncate max-w-[240px] text-sm text-muted-foreground hover:underline"
                      title={route.id}
                    >
                      {route.id}
                    </button>
                  </>
                )}
              </nav>
            </div>

            <div className="flex-1" />

            {/* Quick Search */}
            <div className="hidden md:flex items-center gap-2 w-[540px]">
              <div className="relative w-full">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  value={quick}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuick(e.target.value)}
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === "Enter" && tryQuickJump()}
                  placeholder="Suchen / IDs (Strg+K oder /)"
                  className="pl-9"
                />
              </div>
              <Button variant="secondary" onClick={tryQuickJump}>Suchen</Button>
            </div>

            <div className="flex-1 md:hidden" />

            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpenCmd(true)}>
              <Search className="h-5 w-5" />
            </Button>

            <Button variant="ghost" size="icon" aria-label="Benachrichtigungen">
              <Bell className="h-5 w-5" />
            </Button>

            <Button variant="ghost" size="icon" onClick={() => setDark((d) => !d)} aria-label="Theme umschalten">
              {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Languages className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Sprache</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Deutsch</DropdownMenuItem>
                <DropdownMenuItem>Français</DropdownMenuItem>
                <DropdownMenuItem>Nederlands</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" className="pl-2 pr-3">
                  <Avatar className="mr-2 h-6 w-6">
                    <AvatarFallback>TP</AvatarFallback>
                  </Avatar>
                  Thierry P.
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Profil</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-2"><Settings className="h-4 w-4" /> Einstellungen</DropdownMenuItem>
                <DropdownMenuItem className="gap-2"><Grid2X2 className="h-4 w-4" /> Module verwalten</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-2 text-destructive"><LogOut className="h-4 w-4" /> Ausloggen</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Body */}
        <main
          className="h-[calc(100dvh-56px)] grid"
          style={{ gridTemplateColumns: `${sidebarWidth}px 4px 1fr` }}
        >
          {/* Sidebar Desktop */}
          <aside className="border-r hidden sm:block" style={{ width: sidebarWidth }}>
            <SideNav nav={NAV} route={route} setRoute={setRoute} collapsed={collapsed} setCollapsed={setCollapsed} />
          </aside>

          {/* resizer (desktop only) */}
          <div
            className="hidden sm:block w-1 cursor-col-resize bg-transparent hover:bg-slate-100/40"
            role="separator"
            aria-orientation="vertical"
            onMouseDown={onResizerMouseDown}
            onTouchStart={onResizerTouchStart}
            style={{ touchAction: "none" }}
          />

          {/* Content */}
          <section className="overflow-hidden">
            {route.module === "dashboard" && <Dashboard setRoute={setRoute} />}
            {route.module === "employees" && <Employees route={route} setRoute={setRoute} employees={employees} addEmployee={addEmployee} />}
            {route.module === "contacts" && <Contacts route={route} setRoute={setRoute} />}
            {route.module === "opps" && <Opportunities route={route} setRoute={setRoute} opps={opps} setOpps={setOpps} />}
            {route.module === "articles" && <ArticlesNew />}
            {route.module === "prodtypes" && <ProdTypes />}
          </section>
        </main>
      </div>

      {/* Command Palette */}
      <CommandDialog open={openCmd} onOpenChange={setOpenCmd}>
        <CommandInput placeholder="Suche: Module, Kontakte, Mitarbeiter, Opportunities…" />
        <CommandList>
          <CommandEmpty>Nichts gefunden…</CommandEmpty>
          <CommandGroup heading="Module">
            {globalIndex.mods.map((m) => (
              <CommandItem key={m.id} onSelect={() => handleCmdSelect(m)}>
                <IconEl icon={m.icon} /> {m.title}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Datensätze">
            {globalIndex.records.map((r) => (
              <CommandItem key={r.id} onSelect={() => handleCmdSelect(r)}>
                <Badge variant="secondary" className="mr-2 text-xs">{r.type}</Badge>
                {r.title}
                <span className="ml-auto text-muted-foreground">{r.id}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>

      {/* Theme Klassen */}
      <style>{`
        :root { color-scheme: light dark; }
        .dark { color-scheme: dark; }
      `}</style>
    </div>
  );
}

/* =========================
   Sidebar
   ========================= */
function SideNav({
  nav,
  route,
  setRoute,
  collapsed,
  setCollapsed,
}: {
  nav: NavGroup[];
  route: Route;
  setRoute: (r: Route) => void;
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [filter, setFilter] = useState<string>("");

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => setCollapsed((c) => !c)}>
          {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </Button>
        {!collapsed && (
          <Input
            value={filter}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilter(e.target.value)}
            placeholder="Module suchen"
            className="h-9"
          />
        )}
      </div>
      <ScrollArea className="flex-1">
        <div className="py-2">
          {nav.map((group) => (
            <div key={group.group} className="px-2">
              {!collapsed && (
                <div className="px-2 pt-2 pb-1 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {group.group}
                </div>
              )}
              <div className="flex flex-col gap-1">
                {group.items
                  .filter((i) => i.label.toLowerCase().includes(filter.toLowerCase()))
                  .map((i) => {
                    const active = route.module === i.key;
                    return (
                      <Button
                        key={i.key}
                        variant={active ? "secondary" : "ghost"}
                        className={clsx("justify-start gap-3 h-10", collapsed ? "px-2" : "px-3")}
                        onClick={() =>
                          setRoute({
                            module: i.key,
                            view: i.key === "opps" ? "board" : i.key === "articles" ? "new" : "list",
                            id: null,
                          })
                        }
                        title={collapsed ? i.label : undefined}
                      >
                        <IconEl icon={i.icon} />
                        {!collapsed && <span className="truncate">{i.label}</span>}
                      </Button>
                    );
                  })}
              </div>
              <div className="h-3" />
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="p-2 border-t">
        <Button variant="ghost" className={clsx("w-full justify-start gap-3", collapsed ? "px-2" : "px-3")}>
          <FileText className="h-4 w-4" /> {!collapsed && "Dokumentation"}
        </Button>
      </div>
    </div>
  );
}

/* =========================
   Dashboard
   ========================= */
function Dashboard({ setRoute }: { setRoute: (r: Route) => void }) {
  return (
    <div className="h-full p-4 sm:p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Schnellstart</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button onClick={() => setRoute({ module: "contacts", view: "list", id: null })} variant="secondary">
              <Users className="h-4 w-4 mr-2" /> Kontakte
            </Button>
            <Button onClick={() => setRoute({ module: "opps", view: "board", id: null })} variant="secondary">
              <KanbanSquare className="h-4 w-4 mr-2" /> Opportunitäten
            </Button>
            <Button onClick={() => setRoute({ module: "articles", view: "new", id: null })} variant="secondary">
              <Package className="h-4 w-4 mr-2" /> Artikel anlegen
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Tastenkürzel</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-1">
            <div><kbd className="px-1.5 py-0.5 border rounded">Strg</kbd> + <kbd className="px-1.5 py-0.5 border rounded">K</kbd> – Globale Suche</div>
            <div><kbd className="px-1.5 py-0.5 border rounded">/</kbd> – Suche öffnen</div>
            <div><kbd className="px-1.5 py-0.5 border rounded">g</kbd> <kbd className="px-1.5 py-0.5 border rounded">c</kbd> – Kontakte</div>
            <div><kbd className="px-1.5 py-0.5 border rounded">g</kbd> <kbd className="px-1.5 py-0.5 border rounded">o</kbd> – Opportunitäten</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Hinweise</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            UI-Demo orientiert an Odoo (bunte Kacheln), Notion-Suche & Jira-Kanban. Light/Dark Mode, responsive, Sidebar mit Icon-Only-Modus.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* =========================
   Mitarbeiter
   ========================= */
function Employees({ route, setRoute, employees, addEmployee }: { route: Route; setRoute: (r: Route) => void; employees: Employee[]; addEmployee: (e: Employee) => void; }) {
  const current = employees.find((e) => e.id === route.id);
  const [edit, setEdit] = useState<{ first: string; name: string; code: string } | null>(null);
  useEffect(() => {
    if (current) setEdit({ first: current.first, name: current.name, code: current.code });
    else setEdit(null);
  }, [current]);
  return (
    <div className="h-full grid grid-cols-1 lg:grid-cols-[380px_1fr]">
      <div className="border-r p-4 sm:p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Mitarbeiter</h2>
          <Button size="sm" variant="secondary" onClick={() => addEmployee({ id: `X${Date.now()}`, name: "Neu", first: "Mitarbeiter", code: `X${Date.now()}` })}><Plus className="h-4 w-4 mr-1" /> Hinzufügen</Button>
        </div>
        <Input placeholder="Suchen…" className="mb-3" />
        <ScrollArea className="h-[calc(100dvh-56px-140px)] pr-3">
          <div className="space-y-1">
            {employees.map((e) => (
              <Button
                key={e.id}
                variant={route.id === e.id ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => setRoute({ module: "employees", view: "detail", id: e.id })}
              >
                <UserCircle2 className="h-4 w-4 mr-2" /> {e.name}, {e.first}
                <span className="ml-auto text-muted-foreground text-xs">{e.code}</span>
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>
      <div className="p-4 sm:p-6 overflow-auto">
        {current ? (
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCircle2 className="h-5 w-5" /> {current.first} {current.name} <Badge variant="secondary">{current.code}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Vorname</Label>
                  <Input defaultValue={current.first} />
                </div>
                <div>
                  <Label>Nachname</Label>
                  <Input defaultValue={current.name} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label>Code</Label>
                  <Input defaultValue={current.code} />
                </div>
                <div>
                  <Label>Rolle</Label>
                  <Input placeholder="z. B. Vertrieb" />
                </div>
                <div>
                  <Label>Status</Label>
                  <Input placeholder="Aktiv" />
                </div>
              </div>
              <div className="pt-2 flex gap-2">
                <Button onClick={() => {
                  if (current && edit) {
                    // update via parent handler using event dispatch
                    const updated: Employee = { id: current.id, first: edit.first, name: edit.name, code: edit.code };
                    // emit a CustomEvent so parent can catch (simpler than prop drilling here)
                    const ev = new CustomEvent('erp:updateEmployee', { detail: updated });
                    window.dispatchEvent(ev);
                    setRoute({ module: 'employees', view: 'detail', id: updated.id });
                  }
                }}>Speichern</Button>
                <Button variant="secondary" onClick={() => setEdit(current ? { first: current.first, name: current.name, code: current.code } : null)}>Abbrechen</Button>
                <Button variant="destructive" onClick={() => {
                  if (current) {
                    const ev = new CustomEvent('erp:removeEmployee', { detail: current.id });
                    window.dispatchEvent(ev);
                  }
                }}>Löschen</Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="text-muted-foreground">Bitte einen Mitarbeiter wählen…</div>
        )}
      </div>
    </div>
  );
}

/* =========================
   Kontakte
   ========================= */
function Contacts({ route, setRoute }: { route: Route; setRoute: (r: Route) => void }) {
  // local contacts state so we can add new items in-session
  const [contacts, setContacts] = useState<Contact[]>(CONTACTS);
  const current = contacts.find((c) => c.id === route.id);
  const [query, setQuery] = useState<string>("");
  const filtered = contacts.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()));

  // resizable left panel (contacts list)
  const [leftWidth, setLeftWidth] = useState<number>(() => {
    try {
      const v = localStorage.getItem("contacts-left-width");
      return v ? Number(v) : 420;
    } catch (e) {
      return 420;
    }
  });
  const minLeft = 280;
  const maxLeft = 900;
  const dragging = React.useRef(false);
  const startX = React.useRef(0);
  const startW = React.useRef(leftWidth);

  useEffect(() => {
    try {
      localStorage.setItem("contacts-left-width", String(leftWidth));
    } catch (e) {}
  }, [leftWidth]);

  function onMouseDown(e: React.MouseEvent) {
    dragging.current = true;
    startX.current = e.clientX;
    startW.current = leftWidth;
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }
  function onMouseMove(e: MouseEvent) {
    if (!dragging.current) return;
    const dx = e.clientX - startX.current;
    const newW = Math.min(maxLeft, Math.max(minLeft, startW.current + dx));
    setLeftWidth(newW);
  }
  function onMouseUp() {
    dragging.current = false;
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
  }
  function onTouchStart(e: React.TouchEvent) {
    const t = e.touches[0];
    dragging.current = true;
    startX.current = t.clientX;
    startW.current = leftWidth;
    document.addEventListener("touchmove", onTouchMove);
    document.addEventListener("touchend", onTouchEnd);
  }
  function onTouchMove(e: TouchEvent) {
    if (!dragging.current) return;
    const t = e.touches[0];
    const dx = t.clientX - startX.current;
    const newW = Math.min(maxLeft, Math.max(minLeft, startW.current + dx));
    setLeftWidth(newW);
  }
  function onTouchEnd() {
    dragging.current = false;
    document.removeEventListener("touchmove", onTouchMove);
    document.removeEventListener("touchend", onTouchEnd);
  }

  // dialog for creating new contact
  const [newOpen, setNewOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCity, setNewCity] = useState("");
  const [newEmail, setNewEmail] = useState("");

  function createNew() {
    const id = `C${String(Date.now()).slice(-6)}`;
    const item: Contact = { id, name: newName || "Neuer Kontakt", city: newCity || "", email: newEmail || "" };
    setContacts((s) => [item, ...s]);
    setNewOpen(false);
    setNewName("");
    setNewCity("");
    setNewEmail("");
    setRoute({ module: "contacts", view: "detail", id: item.id });
  }

  // responsive: on small screens keep single column; on lg use explicit columns
  const isLg = typeof window !== "undefined" ? window.innerWidth >= 1024 : true;

  return (
    <div className="h-full" style={isLg ? { display: "grid", gridTemplateColumns: `${leftWidth}px 4px 1fr` } : undefined}>
      <div className="border-r p-4 sm:p-6" style={isLg ? { width: leftWidth } : undefined}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Kontakte</h2>
          <Button size="sm" variant="secondary" onClick={() => setNewOpen(true)}><Plus className="h-4 w-4 mr-1" /> Neu</Button>
        </div>
        <Input value={query} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)} placeholder="Suchen…" className="mb-3" />
        <ScrollArea className="h-[calc(100dvh-56px-140px)] pr-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {filtered.map((c) => (
              <Card
                key={c.id}
                className={clsx("cursor-pointer transition", route.id === c.id ? "ring-2 ring-primary" : "hover:shadow")}
                onClick={() => setRoute({ module: "contacts", view: "detail", id: c.id })}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Building2 className="h-4 w-4" /> {c.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  {c.city}
                  <div className="mt-1">{c.email}</div>
                  <div className="mt-2"><Badge variant="secondary">{c.id}</Badge></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* resizer */}
      <div
        className="hidden lg:block w-1 cursor-col-resize bg-transparent hover:bg-slate-100/40"
        role="separator"
        aria-orientation="vertical"
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        style={{ touchAction: "none" }}
      />

      <div className="p-4 sm:p-6 overflow-auto">
        {current ? (
          <Card className="max-w-3xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" /> {current.name} <Badge variant="secondary">{current.id}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Name</Label>
                  <Input defaultValue={current.name} />
                </div>
                <div>
                  <Label>Ort</Label>
                  <Input defaultValue={current.city} />
                </div>
                <div className="col-span-2">
                  <Label>E-Mail</Label>
                  <Input defaultValue={current.email} />
                </div>
              </div>
              <div className="pt-2 flex gap-2">
                <Button>Speichern</Button>
                <Button variant="secondary">Abbrechen</Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="text-muted-foreground">Bitte einen Kontakt wählen…</div>
        )}
      </div>

      {/* New contact dialog */}
      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Neuen Kontakt anlegen</DialogTitle>
            <DialogDescription>Erstelle einen neuen Kontakt für die Demo.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 mt-2">
            <Label>Name</Label>
            <Input value={newName} onChange={(e) => setNewName(e.target.value)} />
            <Label>Ort</Label>
            <Input value={newCity} onChange={(e) => setNewCity(e.target.value)} />
            <Label>E-Mail</Label>
            <Input value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setNewOpen(false)}>Abbrechen</Button>
            <Button onClick={createNew}>Anlegen</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* =========================
   Opportunities (Kanban)
   ========================= */
function Opportunities({
  route,
  setRoute,
  opps,
  setOpps,
}: {
  route: Route;
  setRoute: (r: Route) => void;
  opps: Opportunity[];
  setOpps: React.Dispatch<React.SetStateAction<Opportunity[]>>;
}) {
  function move(id: string, stage: StageKey) {
    setOpps((prev: Opportunity[]) => prev.map((o) => (o.id === id ? { ...o, stage } : o)));
  }

  return (
    <div className="h-full p-4 sm:p-6 overflow-auto">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2"><KanbanSquare className="h-5 w-5" /> Opportunitäten</h2>
        <Button variant="secondary"><Plus className="h-4 w-4 mr-1" /> Neu</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 min-w-[900px]">
        {OPP_COLUMNS.map((col) => (
          <Card key={col.id}>
            <CardHeader className="py-3">
              <CardTitle className="text-sm flex items-center justify-between">
                {col.title}
                <Badge variant="secondary">{opps.filter((o) => o.stage === col.id).length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {opps.filter((o) => o.stage === col.id).map((o) => (
                <div
                  key={o.id}
                  className={clsx("rounded-xl border p-3 bg-card text-card-foreground", route.id === o.id ? "ring-2 ring-primary" : "")}
                  onClick={() => setRoute({ module: "opps", view: "board", id: o.id })}
                >
                  <div className="text-sm font-medium flex items-center justify-between">
                    {o.title}
                    <span className="text-muted-foreground">{formatAmount(o.amount)}</span>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">{o.owner}</div>
                  <div className="mt-2 flex gap-1">
                    {OPP_COLUMNS.filter((c) => c.id !== o.stage).map((c) => (
                      <Button key={c.id} size="sm" variant="secondary" className="h-7 px-2" onClick={() => move(o.id, c.id)}>
                        <ArrowRight className="h-3 w-3 mr-1" /> {c.title}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* =========================
   Artikel / Neu
   ========================= */
function ArticlesNew() {
  const [prodTypeOpen, setProdTypeOpen] = useState<boolean>(false);
  const [prodType, setProdType] = useState<ProdType | null>(null);
  const [sellable, setSellable] = useState<boolean>(false);
  const [buyable, setBuyable] = useState<boolean>(false);

  return (
    <div className="h-full p-4 sm:p-6 overflow-auto">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2"><Package className="h-5 w-5" /> Artikel / Neu</h2>
        <div className="flex gap-2">
          <Button variant="secondary">Entwurf speichern</Button>
          <Button>Erstellen</Button>
        </div>
      </div>

      <Card className="max-w-5xl">
        <CardContent className="pt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-3">
              <Label>Typ</Label>
              <Input placeholder="z. B. Dienstleistung, Produkt…" />
            </div>
            <div>
              <Label>Bezeichnung (de)</Label>
              <Input placeholder="z. B. Workshop" />
            </div>
            <div>
              <Label>Bezeichnung (fr)</Label>
              <Input placeholder="p. ex. Atelier" />
            </div>
            <div>
              <Label>Bezeichnung (nl)</Label>
              <Input placeholder="bv. Workshop" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Checkbox id="sellable" checked={sellable} onCheckedChange={(v: CheckedState) => setSellable(!!v)} />
              <Label htmlFor="sellable">Kann verkauft werden</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="buyable" checked={buyable} onCheckedChange={(v: CheckedState) => setBuyable(!!v)} />
              <Label htmlFor="buyable">Kann gekauft werden</Label>
            </div>
            <div>
              <Label>Verkaufspreis</Label>
              <Input type="number" placeholder="0,00" />
            </div>
            <div>
              <Label>Kosten</Label>
              <Input type="number" placeholder="0,00" />
            </div>
          </div>

          <div>
            <Label>Produktionstyp</Label>
            <div className="flex gap-2 mt-1">
              <Input readOnly value={prodType ? prodType.name : "—"} className="max-w-sm" />
              <Dialog open={prodTypeOpen} onOpenChange={setProdTypeOpen}>
                <DialogTrigger asChild>
                  <Button variant="secondary">Auswählen</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[560px]">
                  <DialogHeader>
                    <DialogTitle>Produktionstyp wählen</DialogTitle>
                    <DialogDescription>Suche und wähle einen Typ aus.</DialogDescription>
                  </DialogHeader>
                  <ProdTypePicker onPick={(x) => { setProdType(x); setProdTypeOpen(false); }} />
                  <DialogFooter>
                    <Button variant="secondary" onClick={() => setProdTypeOpen(false)}>Schließen</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ProdTypePicker({ onPick }: { onPick: (x: ProdType) => void }) {
  const [q, setQ] = useState<string>("");
  const list = PROD_TYPES.filter((x) => x.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <div>
      <Input value={q} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQ(e.target.value)} placeholder="Suche…" className="mb-3" />
      <div className="space-y-2">
        {list.map((x) => (
          <Card key={x.id} className="cursor-pointer hover:shadow" onClick={() => onPick(x)}>
            <CardContent className="py-3 flex items-center gap-2">
              <Factory className="h-4 w-4" />
              <div className="font-medium">{x.name}</div>
              <Badge variant="secondary" className="ml-auto">{x.id}</Badge>
            </CardContent>
          </Card>
        ))}
        {list.length === 0 && <div className="text-sm text-muted-foreground">Keine Treffer…</div>}
      </div>
    </div>
  );
}

/* =========================
   Produktionstypen Übersicht
   ========================= */
function ProdTypes() {
  return (
    <div className="h-full p-4 sm:p-6 overflow-auto">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2"><Factory className="h-5 w-5" /> Produktionstypen</h2>
        <Button variant="secondary"><Plus className="h-4 w-4 mr-1" /> Neu</Button>
      </div>
      <Card className="max-w-2xl">
        <CardContent className="pt-4">
          <div className="grid grid-cols-2 gap-3">
            {PROD_TYPES.map((p) => (
              <Card key={p.id}>
                <CardContent className="py-3 px-4 flex items-center gap-2">
                  <Factory className="h-4 w-4" />
                  {p.name}
                  <Badge variant="secondary" className="ml-auto">{p.id}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
