import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { useState, KeyboardEvent, useEffect } from "react";

function getUpcomingDates(client: any) {
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  
  // Check if annual assessment is due this month
  const annualDate = new Date(client.nextAnnualAssessment);
  const annualMonth = annualDate.getMonth() + 1;
  const isAnnualDue = annualMonth === currentMonth && !client.lastAnnualCompleted;
  const isAnnualDueNextMonth = annualMonth === currentMonth + 1 && !client.lastAnnualCompleted;

  // Get quarterly review dates
  const qrDates = getQuarterlyReviewDates(client.nextAnnualAssessment);
  
  // Find the next QR date based on completed QRs
  let nextQRIndex = 0;
  if (client.qr1Completed) nextQRIndex = 1;
  if (client.qr2Completed) nextQRIndex = 2;
  if (client.qr3Completed) nextQRIndex = 3;
  if (client.qr4Completed) nextQRIndex = 0; // Reset to Q1 if all are completed
  
  // Use custom date if it exists, otherwise use calculated date
  let nextQRDate;
  const customDate = client[`qr${nextQRIndex + 1}Date`];
  if (customDate && customDate !== null) {
    nextQRDate = new Date(customDate);
  } else {
    nextQRDate = qrDates[nextQRIndex];
  }

  // Only show red if the QR is due in the current month
  const isQRDue = nextQRDate && nextQRDate.getMonth() + 1 === currentMonth;

  // If it's Q4, we need to show both QR and Annual Assessment
  const isQ4 = qrDates.some(qr => {
    const qrMonth = qr.getMonth() + 1;
    return qrMonth === currentMonth && annualMonth === currentMonth + 1;
  });

  return {
    isAnnualDue,
    isAnnualDueNextMonth,
    isQRDue,
    isQ4,
    annualDate: annualDate,
    qrDates: qrDates,
    nextQRDate: nextQRDate,
    nextQRIndex: nextQRIndex
  };
}

function getQuarterlyReviewDates(annualAssessmentDate: number) {
  const date = new Date(annualAssessmentDate);
  const year = date.getFullYear();
  const month = date.getMonth();
  
  // Calculate the dates for each quarter (3 months after annual assessment)
  const q1 = new Date(year, (month + 3) % 12, date.getDate());
  const q2 = new Date(year, (month + 6) % 12, date.getDate());
  const q3 = new Date(year, (month + 9) % 12, date.getDate());
  
  // For Q4, we need to handle the end of the month before the annual assessment
  const q4Month = month === 0 ? 11 : month - 1;
  const q4Year = month === 0 ? year - 1 : year;
  const lastDay = new Date(q4Year, q4Month + 1, 0).getDate(); // Get last day of the month
  const q4 = new Date(q4Year, q4Month, lastDay);

  // Adjust years for quarters that cross into next year
  if (month + 3 >= 12) q1.setFullYear(year + 1);
  if (month + 6 >= 12) q2.setFullYear(year + 1);
  if (month + 9 >= 12) q3.setFullYear(year + 1);

  return [q1, q2, q3, q4];
}

export function ClientList({
  selectedClientId,
  onSelectClient,
  onCloseClient,
}: {
  selectedClientId: Id<"clients"> | null;
  onSelectClient: (id: Id<"clients">) => void;
  onCloseClient: () => void;
}) {
  const clients = useQuery(api.clients.list) || [];
  const updateClient = useMutation(api.clients.updateContact);
  const [sortBy, setSortBy] = useState<'first' | 'last'>('last');
  const [searchTerm, setSearchTerm] = useState('');
  
  // New sort state
  const [sortColumn, setSortColumn] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Clear search when client is deselected
  useEffect(() => {
    if (!selectedClientId) {
      setSearchTerm('');
    }
  }, [selectedClientId]);

  const handleColumnSort = (column: string) => {
    if (sortColumn === column) {
      // Toggle direction if same column
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New column, default to ascending
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Sort clients based on selected column and direction
  const sortedClients = [...clients].sort((a, b) => {
    let comparison = 0;
    
    switch (sortColumn) {
      case 'name':
        const aName = a.name.split(' ');
        const bName = b.name.split(' ');
        
        if (sortBy === 'first') {
          comparison = aName[0].localeCompare(bName[0]);
        } else {
          const aLast = aName[aName.length - 1];
          const bLast = bName[bName.length - 1];
          comparison = aLast.localeCompare(bLast);
        }
        break;
        
      case 'annualAssessment':
        const aAnnual = a.nextAnnualAssessment || 0;
        const bAnnual = b.nextAnnualAssessment || 0;
        comparison = aAnnual - bAnnual;
        break;
        
      case 'nextQR':
        const aUpcoming = getUpcomingDates(a);
        const bUpcoming = getUpcomingDates(b);
        const aQRDate = aUpcoming.nextQRDate ? aUpcoming.nextQRDate.getTime() : 0;
        const bQRDate = bUpcoming.nextQRDate ? bUpcoming.nextQRDate.getTime() : 0;
        comparison = aQRDate - bQRDate;
        break;
        
      case 'lastContact':
        const aContact = a.lastContactDate || 0;
        const bContact = b.lastContactDate || 0;
        comparison = aContact - bContact;
        break;
        
      case 'lastF2F':
        const aF2F = a.lastFaceToFaceDate || 0;
        const bF2F = b.lastFaceToFaceDate || 0;
        comparison = aF2F - bF2F;
        break;
        
      case 'nextF2F':
        const aNextF2F = a.lastFaceToFaceDate ? (a.lastFaceToFaceDate + (90 * 24 * 60 * 60 * 1000)) : 0;
        const bNextF2F = b.lastFaceToFaceDate ? (b.lastFaceToFaceDate + (90 * 24 * 60 * 60 * 1000)) : 0;
        comparison = aNextF2F - bNextF2F;
        break;
        
      default:
        comparison = 0;
    }
    
    // Apply sort direction
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  // Filter clients based on search term
  const filteredClients = sortedClients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && filteredClients.length === 1) {
      onSelectClient(filteredClients[0]._id);
    } else if (e.key === 'Escape') {
      setSearchTerm('');
      if (selectedClientId) {
        onSelectClient(null as any); // Clear selection
      }
    }
  };

  const handleMarkComplete = async (clientId: Id<"clients">, type: 'qr' | 'annual') => {
    const today = new Date().getTime();
    await updateClient({
      id: clientId,
      field: type === 'qr' ? 'lastQRCompleted' : 'lastAnnualCompleted',
      value: today,
    });
  };
  
  // Helper function to render sort indicators
  const renderSortIndicator = (column: string) => {
    if (sortColumn === column) {
      return sortDirection === 'asc' ? ' ▲' : ' ▼';
    }
    return '';
  };

  return (
    <div>
      <div className="mb-4 space-y-4">
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Search Clients
          </label>
          <input
            type="text"
            id="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search by name... (Press Enter when one result, Esc to clear)"
            className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            autoFocus
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'first' | 'last')}
            className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="first">First Name</option>
            <option value="last">Last Name</option>
          </select>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {/* Desktop table view */}
        <div className="hidden md:block">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th 
                  className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => handleColumnSort('name')}
                >
                  Consumer{renderSortIndicator('name')}
                </th>
                <th 
                  className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => handleColumnSort('annualAssessment')}
                >
                  Annual Assessment{renderSortIndicator('annualAssessment')}
                </th>
                <th 
                  className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => handleColumnSort('nextQR')}
                >
                  Next QR{renderSortIndicator('nextQR')}
                </th>
                <th 
                  className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => handleColumnSort('lastContact')}
                >
                  Last Contact{renderSortIndicator('lastContact')}
                </th>
                <th 
                  className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => handleColumnSort('lastF2F')}
                >
                  Last Face to Face{renderSortIndicator('lastF2F')}
                </th>
                <th 
                  className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => handleColumnSort('nextF2F')}
                >
                  Next Face to Face{renderSortIndicator('nextF2F')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredClients.map((client) => {
                const upcomingDates = getUpcomingDates(client);
                
                return (
                  <tr
                    key={client._id}
                    className={`cursor-pointer transition-colors ${
                      client._id === selectedClientId 
                        ? "bg-indigo-50 dark:bg-indigo-900/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/70" 
                        : "hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                    onClick={() => onSelectClient(client._id)}
                  >
                    <td className="px-3 py-2">
                      <div className="text-center">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">{client.name}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{client.phoneNumber}</p>
                        <div className="flex gap-1 mt-1 justify-center">
                          <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                            client.firstContactCompleted 
                              ? "bg-green-100 text-green-800" 
                              : "bg-red-100 text-red-800"
                          }`}>
                            {client.firstContactCompleted ? "1st Contact ✓" : "1st Contact ✗"}
                          </span>
                          <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                            client.secondContactCompleted 
                              ? "bg-green-100 text-green-800" 
                              : "bg-red-100 text-red-800"
                          }`}>
                            {client.secondContactCompleted ? "2nd Contact ✓" : "2nd Contact ✗"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-center text-xs text-gray-500 dark:text-gray-400">
                      {client.nextAnnualAssessment
                        ? (
                          <span className={upcomingDates.isAnnualDueNextMonth ? "text-red-600 font-medium" : ""}>
                            {new Date(client.nextAnnualAssessment).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              year: undefined
                            })}
                          </span>
                        )
                        : "Not set"}
                    </td>
                    <td className="px-3 py-2 text-center text-xs font-bold text-gray-900 dark:text-gray-100">
                      {upcomingDates.nextQRDate ? (
                        <div className="flex items-center justify-center gap-1">
                          <span className={upcomingDates.isQRDue ? "text-red-600 font-medium" : ""}>
                            {upcomingDates.nextQRDate.toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                          <span className="text-gray-500 text-xs dark:text-gray-400">
                            (Q{upcomingDates.nextQRIndex + 1})
                          </span>
                        </div>
                      ) : (
                        "Not set"
                      )}
                    </td>
                    <td className="px-3 py-2 text-center text-xs text-gray-500 dark:text-gray-400">
                      {client.lastContactDate
                        ? new Date(client.lastContactDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                        : "No contact recorded"}
                    </td>
                    <td className="px-3 py-2 text-center text-xs text-gray-500 dark:text-gray-400">
                      {client.lastFaceToFaceDate
                        ? new Date(client.lastFaceToFaceDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                        : "No face to face recorded"}
                    </td>
                    <td className="px-3 py-2 text-center text-xs font-bold text-gray-900 dark:text-gray-100">
                      {client.lastFaceToFaceDate
                        ? (() => {
                            const nextFaceToFaceDate = new Date(client.lastFaceToFaceDate + (90 * 24 * 60 * 60 * 1000));
                            const today = new Date();
                            const daysUntilNext = Math.ceil((nextFaceToFaceDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                            const isDueSoon = daysUntilNext <= 15;
                            
                            return (
                              <span className={isDueSoon ? "text-red-600" : ""}>
                                {nextFaceToFaceDate.toLocaleDateString(undefined, {
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>
                            );
                          })()
                        : "Not applicable"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile card view */}
        <div className="md:hidden space-y-4">
          {filteredClients.map((client) => {
            const upcomingDates = getUpcomingDates(client);
            
            return (
              <div
                key={client._id}
                className={`bg-white dark:bg-gray-800 rounded-lg shadow p-4 cursor-pointer transition-colors ${
                  client._id === selectedClientId ? "ring-2 ring-indigo-500" : ""
                }`}
                onClick={() => onSelectClient(client._id)}
              >
                <div>
                  <h3 className="text-base font-medium text-gray-900 dark:text-gray-100">{client.name}</h3>
                  <a 
                    href={`tel:${client.phoneNumber}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {client.phoneNumber}
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {clients.length === 0 && (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg">
            No consumers yet
          </div>
        )}
      </div>
    </div>
  );
}
