import { useState } from "react";
import { Search, Filter, ArrowUpDown } from "lucide-react";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";

interface PipelineToolbarProps {
  onSearch: (value: string) => void;
  onSort: (value: string) => void;
  onFilter: (value: string) => void;
}

export function PipelineToolbar({ onSearch, onSort, onFilter }: PipelineToolbarProps) {
  const [searchValue, setSearchValue] = useState("");
  const [sortValue, setSortValue] = useState("created_desc");
  const [filterValue, setFilterValue] = useState("all");

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    onSearch(e.target.value);
  };

  const handleSort = (value: string) => {
    setSortValue(value);
    onSort(value);
  };

  const handleFilter = (value: string) => {
    setFilterValue(value);
    onFilter(value);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6 items-center justify-between">
      <div className="relative w-full sm:max-w-[300px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search deals..." 
          value={searchValue}
          onChange={handleSearch}
          className="pl-9 bg-card border-border h-10 w-full"
        />
      </div>

      <div className="flex items-center gap-3 w-full sm:w-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-10 bg-card border-border flex-1 sm:flex-none">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuRadioGroup value={filterValue} onValueChange={handleFilter}>
              <DropdownMenuRadioItem value="all">All Deals</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="hot">Hot Deals</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="stuck">Stuck Deals</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-10 bg-card border-border flex-1 sm:flex-none">
              <ArrowUpDown className="w-4 h-4 mr-2" />
              Sort
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuRadioGroup value={sortValue} onValueChange={handleSort}>
              <DropdownMenuRadioItem value="created_desc">Newest First</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="value_desc">Highest Value</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="prob_desc">Highest Probability</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
