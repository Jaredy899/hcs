import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ModalOverlay } from "./components/ModalOverlay";

// Proper CSV parser that handles quoted fields with commas
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  let i = 0;

  while (i < line.length) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Handle escaped quotes
        current += '"';
        i += 2;
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
        i++;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      result.push(current.trim());
      current = '';
      i++;
    } else {
      current += char;
      i++;
    }
  }

  // Add the last field
  result.push(current.trim());
  return result;
}

export default function ImportClientsForm({ onClose }: { onClose: () => void }) {
  const bulkImport = useMutation(api.clients.bulkImport);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const handleFile = async (file: File) => {
    setIsDraggingOver(false);

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Please choose a .csv file');
      setSuccess(null);
      return;
    }

    try {
      const text = await file.text();
      const lines = text.split('\n').map((line) => line.trim()).filter((line) => line);

      if (lines.length < 2) {
        throw new Error('CSV file must have at least a header row and one data row');
      }

      const clients = [];
      const errors: string[] = [];

      // Skip the header row; columns are:
      // Id, First Name, Last Name, Preferred Name, Client/Record ID, Cell Phone,
      // Plan Program, Plan End Date, Primary Provider, Authorization ID
      for (let i = 1; i < lines.length; i++) {
        const [
          id,
          firstName,
          lastName,
          preferredName,
          clientRecordId,
          cellPhone,
          planProgram,
          planEndDate,
          _primaryProvider,
          authorizationId,
        ] = parseCSVLine(lines[i]);

        if (!firstName || !lastName) {
          errors.push(`Row ${i + 1}: Missing first name or last name`);
          continue;
        }

        clients.push({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          preferredName: preferredName?.trim() || undefined,
          clientId: clientRecordId?.trim() || id?.trim(),
          phoneNumber: cellPhone?.trim() || "No phone provided",
          insurance: authorizationId?.trim() || "No insurance provided",
          annualAssessmentDate: planEndDate?.trim() || "12/31/2025",
          planProgram: planProgram?.trim() || undefined,
        });
      }

      if (clients.length === 0) {
        throw new Error('No valid client records found in CSV');
      }

      const imported = await bulkImport({ clients });

      const skipped = errors.length > 0 ? ` (${errors.length} rows had errors and were skipped)` : '';
      setSuccess(`Imported ${imported.length} consumers with WCCSS prioritization${skipped}`);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import clients');
      setSuccess(null);
    }
  };

  return (
    <ModalOverlay onDismiss={onClose} className="p-4">
      <div className="bg-background rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Import Consumers from CSV</h2>
            <Button onClick={onClose} variant="ghost" size="sm" className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>

          <div className="space-y-4">
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-6 transition-colors",
                isDraggingOver ? "border-primary bg-primary/5" : "border-border"
              )}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingOver(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setIsDraggingOver(false);
              }}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file) void handleFile(file);
                else setIsDraggingOver(false);
              }}
            >
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                <div className="mt-4 flex justify-center text-sm text-muted-foreground">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/80 focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
                  >
                    <span>Upload a CSV file</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      accept=".csv"
                      className="sr-only"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) void handleFile(file);
                      }}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  CSV file with columns: Id, First Name, Last Name, Preferred Name, Client/Record ID,
                  Cell Phone, Plan Program, Plan End Date, Primary Provider, Authorization ID
                </p>
              </div>
            </div>

            {error && (
              <div className="flex gap-3 rounded-md bg-destructive/15 p-4">
                <AlertCircle className="h-5 w-5 shrink-0 text-destructive" />
                <div>
                  <h3 className="text-sm font-medium text-destructive">Error</h3>
                  <p className="mt-1 text-sm text-destructive/80">{error}</p>
                </div>
              </div>
            )}

            {success && (
              <div className="flex gap-3 rounded-md bg-green-500/15 p-4">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />
                <div>
                  <h3 className="text-sm font-medium text-green-800 dark:text-green-200">Success</h3>
                  <p className="mt-1 text-sm text-green-700 dark:text-green-300">{success}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ModalOverlay>
  );
}
