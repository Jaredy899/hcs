import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { useMemo, useState, KeyboardEvent } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Archive, Users } from "lucide-react";
import { ClientRow, ClientData } from "@/components/ClientRow";
import { ClientFilters } from "@/components/ClientFilters";
import { CaseloadFilter, CASELOAD_FILTERS } from "@/lib/caseloadFilters";
import { getCaseloadFlags, getUpcomingDates, FACE_TO_FACE_MAX_DAYS } from "@/lib/dateUtils";

interface ClientListProps {
  onSelectClient: (id: Id<"clients">) => void;
  isCompactMode: boolean;
}

type SortColumn = 'name' | 'nextQR' | 'lastContact' | 'lastF2F' | 'nextF2F';
type SortDirection = 'asc' | 'desc';
type NameSortBy = 'first' | 'last';

const DAY_MS = 1000 * 60 * 60 * 24;

function compareClients(a: ClientData, b: ClientData, column: SortColumn, nameSortBy: NameSortBy): number {
  switch (column) {
    case 'name': {
      const namePart = (name: string) => {
        const parts = name.split(' ');
        return nameSortBy === 'first' ? parts[0] : parts[parts.length - 1];
      };
      return namePart(a.name).localeCompare(namePart(b.name));
    }
    case 'nextQR':
      return getUpcomingDates(a).nextQRDate.getTime() - getUpcomingDates(b).nextQRDate.getTime();
    case 'lastContact':
      return (a.lastContactDate ?? 0) - (b.lastContactDate ?? 0);
    case 'lastF2F':
      return (a.lastFaceToFaceDate ?? 0) - (b.lastFaceToFaceDate ?? 0);
    case 'nextF2F': {
      const nextDue = (client: ClientData) =>
        client.lastFaceToFaceDate ? client.lastFaceToFaceDate + FACE_TO_FACE_MAX_DAYS * DAY_MS : 0;
      return nextDue(a) - nextDue(b);
    }
  }
}

export function ClientList({ onSelectClient, isCompactMode }: ClientListProps) {
  const [showArchived, setShowArchived] = useState(false);
  const activeClients = useQuery(api.clients.list) || [];
  const archivedClients = useQuery(api.clients.listArchived, showArchived ? {} : "skip") || [];
  const todoCounts = useQuery(api.todos.getClientTodoCounts) || {};
  const unarchiveClient = useMutation(api.clients.unarchive);

  const [nameSortBy, setNameSortBy] = useState<NameSortBy>('last');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<SortColumn>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [activeFilters, setActiveFilters] = useState<CaseloadFilter[]>([]);

  const clients: ClientData[] = showArchived ? archivedClients : activeClients;

  const filterCounts = useMemo(() => {
    const counts = Object.fromEntries(
      CASELOAD_FILTERS.map((filter) => [filter.key, 0])
    ) as Record<CaseloadFilter, number>;

    for (const client of clients) {
      const flags = getCaseloadFlags(client);
      for (const filter of CASELOAD_FILTERS) {
        if (flags[filter.key]) counts[filter.key] += 1;
      }
    }
    return counts;
  }, [clients]);

  const visibleClients = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return clients
      .filter((client) => {
        if (query && !client.name.toLowerCase().includes(query)) return false;
        if (activeFilters.length === 0) return true;
        const flags = getCaseloadFlags(client);
        return activeFilters.every((filter) => flags[filter]);
      })
      .sort((a, b) => {
        const comparison = compareClients(a, b, sortColumn, nameSortBy);
        return sortDirection === 'asc' ? comparison : -comparison;
      });
  }, [clients, searchTerm, activeFilters, sortColumn, sortDirection, nameSortBy]);

  const handleColumnSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && visibleClients.length === 1 && !showArchived) {
      onSelectClient(visibleClients[0]._id);
    } else if (e.key === 'Escape') {
      setSearchTerm('');
    }
  };

  const handleUnarchive = async (id: Id<"clients">) => {
    try {
      await unarchiveClient({ id });
      toast.success("Consumer restored to your caseload");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to restore consumer");
    }
  };

  const toggleFilter = (filter: CaseloadFilter) =>
    setActiveFilters((prev) =>
      prev.includes(filter) ? prev.filter((f) => f !== filter) : [...prev, filter]
    );

  const rowProps = (client: ClientData) => ({
    client,
    onSelect: () => onSelectClient(client._id),
    todoCount: todoCounts[client._id]?.incomplete,
    onUnarchive: showArchived ? () => void handleUnarchive(client._id) : undefined,
  });

  const sortableHeader = (column: SortColumn, label: string) => (
    <TableHead
      className="text-center cursor-pointer hover:bg-muted/50"
      onClick={() => handleColumnSort(column)}
    >
      {label}
      {sortColumn === column && (sortDirection === 'asc' ? ' ▲' : ' ▼')}
    </TableHead>
  );

  return (
    <div>
      {/* Search and sort controls */}
      <div className="mb-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="search" className="block text-sm font-medium mb-2">
              Search Consumers
            </Label>
            <Input
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search by name... (Press Enter when one result, Esc to clear)"
              autoFocus
            />
          </div>
          <div>
            <Label className="block text-sm font-medium mb-2">Sort names by:</Label>
            <Select value={nameSortBy} onValueChange={(value: NameSortBy) => setNameSortBy(value)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="first">First Name</SelectItem>
                <SelectItem value="last">Last Name</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <ClientFilters
            counts={filterCounts}
            active={activeFilters}
            onToggle={toggleFilter}
            onClear={() => setActiveFilters([])}
          />
          <Button
            onClick={() => setShowArchived(!showArchived)}
            variant={showArchived ? "default" : "outline"}
            size="sm"
            className="h-7 gap-1 px-2 text-xs"
          >
            {showArchived ? <Users className="h-3 w-3" /> : <Archive className="h-3 w-3" />}
            {showArchived ? "Show Active" : "Show Archived"}
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {/* Desktop table view */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                {sortableHeader('name', 'Consumer')}
                {sortableHeader('nextQR', 'Next QR')}
                {sortableHeader('lastContact', 'Last Contact')}
                {sortableHeader('lastF2F', 'Last Face to Face')}
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleClients.map((client) => (
                <ClientRow key={client._id} {...rowProps(client)} isCompact={isCompactMode} variant="table" />
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile card view */}
        <div className={`md:hidden ${isCompactMode ? "space-y-1" : "space-y-4"}`}>
          {visibleClients.map((client) => (
            <ClientRow key={client._id} {...rowProps(client)} isCompact={isCompactMode} variant="card" />
          ))}
        </div>

        {/* Empty state */}
        {visibleClients.length === 0 && (
          <Card>
            <CardContent className="p-4 text-center text-muted-foreground">
              {clients.length === 0
                ? showArchived
                  ? "No archived consumers"
                  : "No consumers yet"
                : "No consumers match the current search and filters"}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
