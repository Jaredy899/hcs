import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { useState, KeyboardEvent, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { ClientRow } from "@/components/ClientRow";

interface ClientListProps {
  selectedClientId: Id<"clients"> | null;
  onSelectClient: (id: Id<"clients">) => void;
  onCloseClient: () => void;
  isCompactMode: boolean;
}

type SortColumn = 'name' | 'annualAssessment' | 'lastContact' | 'lastF2F' | 'nextF2F';
type SortDirection = 'asc' | 'desc';
type NameSortBy = 'first' | 'last';

export function ClientList({
  selectedClientId,
  onSelectClient,
  onCloseClient,
  isCompactMode,
}: ClientListProps) {
  const clients = useQuery(api.clients.list) || [];
  const todoCounts = useQuery(api.todos.getClientTodoCounts) || {};
  
  const [sortBy, setSortBy] = useState<NameSortBy>('last');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<SortColumn>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Clear search when client is deselected
  useEffect(() => {
    if (!selectedClientId) {
      setSearchTerm('');
      searchInputRef.current?.focus();
    }
  }, [selectedClientId]);

  const handleColumnSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Sort clients
  const sortedClients = [...clients].sort((a, b) => {
    let comparison = 0;
    
    switch (sortColumn) {
      case 'name': {
        const aName = a.name.split(' ');
        const bName = b.name.split(' ');
        if (sortBy === 'first') {
          comparison = aName[0].localeCompare(bName[0]);
        } else {
          comparison = aName[aName.length - 1].localeCompare(bName[bName.length - 1]);
        }
        break;
      }
      case 'annualAssessment':
        comparison = (a.nextAnnualAssessment || 0) - (b.nextAnnualAssessment || 0);
        break;
      case 'lastContact':
        comparison = (a.lastContactDate || 0) - (b.lastContactDate || 0);
        break;
      case 'lastF2F':
        comparison = (a.lastFaceToFaceDate || 0) - (b.lastFaceToFaceDate || 0);
        break;
      case 'nextF2F': {
        const aNextF2F = a.lastFaceToFaceDate ? a.lastFaceToFaceDate + (90 * 24 * 60 * 60 * 1000) : 0;
        const bNextF2F = b.lastFaceToFaceDate ? b.lastFaceToFaceDate + (90 * 24 * 60 * 60 * 1000) : 0;
        comparison = aNextF2F - bNextF2F;
        break;
      }
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  // Filter clients
  const filteredClients = sortedClients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && filteredClients.length === 1) {
      onSelectClient(filteredClients[0]._id);
    } else if (e.key === 'Escape') {
      setSearchTerm('');
      if (selectedClientId) {
        onCloseClient();
      }
    }
  };

  const renderSortIndicator = (column: SortColumn) => {
    if (sortColumn === column) {
      return sortDirection === 'asc' ? ' ▲' : ' ▼';
    }
    return '';
  };

  // Table headers - shared between compact and full modes
  const tableHeaders = (
    <TableHeader>
      <TableRow>
        <TableHead 
          className="text-center cursor-pointer hover:bg-muted/50"
          onClick={() => handleColumnSort('name')}
        >
          Consumer{renderSortIndicator('name')}
        </TableHead>
        <TableHead className="text-center">
          Next QR
        </TableHead>
        <TableHead 
          className="text-center cursor-pointer hover:bg-muted/50"
          onClick={() => handleColumnSort('lastContact')}
        >
          Last Contact{renderSortIndicator('lastContact')}
        </TableHead>
        <TableHead 
          className="text-center cursor-pointer hover:bg-muted/50"
          onClick={() => handleColumnSort('lastF2F')}
        >
          Last Face to Face{renderSortIndicator('lastF2F')}
        </TableHead>
      </TableRow>
    </TableHeader>
  );

  return (
    <div>
      {/* Search and Sort Controls */}
      <div className="mb-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-foreground mb-2">
              Search Clients
            </label>
            <Input
              id="search"
              ref={searchInputRef}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search by name... (Press Enter when one result, Esc to clear)"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Sort by:</label>
            <Select value={sortBy} onValueChange={(value: NameSortBy) => setSortBy(value)}>
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
      </div>

      <div className="space-y-4">
        {/* Desktop table view */}
        <div className="hidden md:block">
          <Table>
            {tableHeaders}
            <TableBody>
              {filteredClients.map((client) => (
                <ClientRow
                  key={client._id}
                  client={client}
                  isSelected={client._id === selectedClientId}
                  onSelect={() => onSelectClient(client._id)}
                  todoCount={todoCounts[client._id]?.incomplete}
                  isCompact={isCompactMode}
                  variant="table"
                />
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile card view */}
        <div className="md:hidden space-y-4">
          {isCompactMode ? (
            <div className="space-y-1">
              {filteredClients.map((client) => (
                <ClientRow
                  key={client._id}
                  client={client}
                  isSelected={client._id === selectedClientId}
                  onSelect={() => onSelectClient(client._id)}
                  todoCount={todoCounts[client._id]?.incomplete}
                  isCompact={true}
                  variant="card"
                />
              ))}
            </div>
          ) : (
            filteredClients.map((client) => (
              <ClientRow
                key={client._id}
                client={client}
                isSelected={client._id === selectedClientId}
                onSelect={() => onSelectClient(client._id)}
                todoCount={todoCounts[client._id]?.incomplete}
                isCompact={false}
                variant="card"
              />
            ))
          )}
        </div>

        {/* Empty state */}
        {clients.length === 0 && (
          <Card>
            <CardContent className="p-4 text-center text-muted-foreground">
              No consumers yet
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
