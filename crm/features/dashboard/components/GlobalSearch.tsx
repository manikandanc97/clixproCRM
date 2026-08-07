"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Command as CommandIcon, User, Building, CheckSquare, KanbanSquare, Loader2 } from "lucide-react";
import { useCRMStore } from "@/shared/store/useCRMStore";
import { useCurrency } from "@/shared/hooks/use-currency";

export default function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  
  const { leads, customers, pipelineItems, tasks } = useCRMStore();
  const { formatCurrency } = useCurrency();

  // Handle Debounce
  useEffect(() => {
    (() => setIsSearching(true))();
    const timer = setTimeout(() => {
      (() => setDebouncedQuery(query))();
      setIsSearching(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Handle Command+K shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen(true);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter Data
  const results = (() => {
    if (!debouncedQuery) return [];
    
    const lowerQuery = debouncedQuery.toLowerCase();
    const matched: { id: string, title: string, subtitle: string, type: string, url: string, icon: ReturnType<typeof JSON.parse> }[] = [];

    // Leads
    leads.forEach(lead => {
      if (lead.name?.toLowerCase().includes(lowerQuery) || lead.company?.toLowerCase().includes(lowerQuery) || lead.email?.toLowerCase().includes(lowerQuery)) {
        matched.push({ id: lead.id, title: lead.name, subtitle: lead.company || lead.email || "Lead", type: "Lead", url: `/leads/${lead.id}`, icon: User });
      }
    });

    // Customers
    customers.forEach(customer => {
      if (customer.name?.toLowerCase().includes(lowerQuery) || customer.company?.toLowerCase().includes(lowerQuery) || customer.email?.toLowerCase().includes(lowerQuery)) {
        matched.push({ id: customer.id, title: customer.name, subtitle: customer.company || customer.email || "Customer", type: "Customer", url: `/customers/${customer.id}`, icon: Building });
      }
    });

    // Deals (Pipeline Items)
    pipelineItems.forEach(deal => {
      if (deal.name?.toLowerCase().includes(lowerQuery)) {
        const val = deal.valueAmount ? formatCurrency(deal.valueAmount) : formatCurrency(Number(String(deal.value).replace(/[^0-9.-]+/g,"")));
        matched.push({ id: deal.id, title: deal.name, subtitle: `Value: ${val}`, type: "Deal", url: `/pipeline`, icon: KanbanSquare });
      }
    });

    // Tasks
    tasks.forEach(task => {
      if (task.title?.toLowerCase().includes(lowerQuery)) {
        matched.push({ id: task.id, title: task.title, subtitle: task.priority || "Task", type: "Task", url: `/tasks`, icon: CheckSquare });
      }
    });

    return matched.slice(0, 10);
  })();

  // Reset selected index when results change
  useEffect(() => {
    (() => setSelectedIndex(0))();
  }, [debouncedQuery]);

  // Handle Keyboard Navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === "Enter" && results.length > 0) {
      e.preventDefault();
      handleSelect(results[selectedIndex]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  const handleSelect = (result: ReturnType<typeof JSON.parse>) => {
    setIsOpen(false);
    setQuery("");
    setDebouncedQuery("");
    router.push(result.url);
  };

  // Open search input manually
  const openSearch = () => {
    setIsOpen(true);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  return (
    <div ref={containerRef} className="relative flex flex-1 max-w-full md:max-w-[450px]">
      {!isOpen ? (
        <button 
          onClick={openSearch}
          className="w-full flex items-center justify-between bg-muted/30 hover:bg-muted/50 border border-border/50 hover:border-border px-4 h-[46px] rounded-xl transition-all duration-200 group shadow-[0_1px_2px_rgba(0,0,0,0.03)] outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary"
        >
          <div className="flex items-center gap-3">
            <Search className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" strokeWidth={1.5} />
            <span className="text-muted-foreground text-[15px] font-medium tracking-tight hidden sm:inline truncate">Search leads, customers, tasks...</span>
          </div>
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium text-muted-foreground bg-background/50 rounded-md shadow-sm border border-border/50 backdrop-blur-sm">
            <CommandIcon className="w-3 h-3" /> K
          </kbd>
        </button>
      ) : (
        <div className="w-full flex items-center bg-background border border-primary px-4 h-[46px] rounded-xl shadow-[0_0_0_4px_rgba(var(--primary),0.1)] outline-none relative z-50">
          <Search className="w-5 h-5 text-primary shrink-0" strokeWidth={1.5} />
          <input
            ref={inputRef}
            autoFocus
            className="flex-1 bg-transparent border-none outline-none px-3 text-[15px] font-medium placeholder:text-muted-foreground"
            placeholder="Type to search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          {isSearching && query && (
            <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
          )}
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium text-muted-foreground bg-muted/50 rounded-md ml-2 cursor-pointer hover:bg-muted" onClick={() => setIsOpen(false)}>
            ESC
          </kbd>
        </div>
      )}

      {/* Dropdown Results */}
      {isOpen && query && (
        <div className="absolute top-[54px] left-0 w-full bg-popover/95 backdrop-blur-xl border border-border shadow-elevated rounded-xl overflow-hidden z-50 p-2 animate-in fade-in slide-in-from-top-2 duration-200">
          {results.length > 0 ? (
            <div className="space-y-1">
              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Results
              </div>
              {results.map((result, idx) => {
                const Icon = result.icon;
                const isSelected = idx === selectedIndex;
                
                // Highlight matching text (simple implementation)
                const highlightText = (text: string) => {
                  if (!debouncedQuery) return text;
                  const parts = text.split(new RegExp(`(${debouncedQuery})`, 'gi'));
                  return parts.map((part, i) => 
                    part.toLowerCase() === debouncedQuery.toLowerCase() ? <span key={i} className="text-primary font-bold bg-primary/10 rounded px-0.5">{part}</span> : part
                  );
                };

                return (
                  <button
                    key={`${result.type}-${result.id}`}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    onClick={() => handleSelect(result)}
                    className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors text-left ${isSelected ? 'bg-accent/80' : 'hover:bg-accent/50'}`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? 'bg-background shadow-sm' : 'bg-muted'}`}>
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-foreground truncate">
                        {highlightText(result.title)}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {highlightText(result.subtitle)}
                      </div>
                    </div>
                    <span className="text-[10px] font-medium text-muted-foreground uppercase bg-muted/50 px-1.5 py-0.5 rounded">
                      {result.type}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            !isSearching && (
              <div className="p-6 text-center flex flex-col items-center justify-center">
                <Search className="w-8 h-8 text-muted-foreground/30 mb-3" />
                <p className="text-sm font-semibold text-foreground">No matching records found.</p>
                <p className="text-xs text-muted-foreground mt-1">Try searching with a different keyword</p>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
