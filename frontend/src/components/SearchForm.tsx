import { useState } from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Calendar } from "lucide-react";

interface SearchFormProps {
  onSearch?: (data: SearchData) => void;
}

export interface SearchData {
  origin: string;
  destination: string;
  date: string;
  queryEngine: "sql" | "orm";
}

export function SearchForm({ onSearch }: SearchFormProps) {
  const [origin, setOrigin] = useState("WAW");
  const [destination, setDestination] = useState("JFK");
  const [date, setDate] = useState("2026-05-15");
  const [queryEngine, setQueryEngine] = useState<"sql" | "orm">("orm");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.({ origin, destination, date, queryEngine });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="origin" className="text-foreground">
          Origin
        </Label>
        <Input
          id="origin"
          type="text"
          placeholder="e.g., WAW"
          value={origin}
          onChange={(e) => setOrigin(e.target.value)}
          className="mt-2 bg-input border-border text-foreground placeholder:text-muted-foreground"
        />
      </div>

      <div>
        <Label htmlFor="destination" className="text-foreground">
          Destination
        </Label>
        <Input
          id="destination"
          type="text"
          placeholder="e.g., JFK"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          className="mt-2 bg-input border-border text-foreground placeholder:text-muted-foreground"
        />
      </div>

      <div>
        <Label htmlFor="date" className="text-foreground">
          Date
        </Label>
        <div className="relative mt-2">
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="bg-input border-border text-foreground pr-10"
          />
          <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      <div>
        <Label className="text-foreground mb-3 block">Database Query Engine</Label>
        <RadioGroup value={queryEngine} onValueChange={(v) => setQueryEngine(v as "sql" | "orm")}>
          <div className="flex items-center space-x-3 mb-3">
            <RadioGroupItem value="sql" id="sql" className="border-border text-primary" />
            <Label htmlFor="sql" className="cursor-pointer text-foreground">
              Raw SQL
            </Label>
          </div>
          <div className="flex items-center space-x-3">
            <RadioGroupItem value="orm" id="orm" className="border-border text-primary" />
            <Label htmlFor="orm" className="cursor-pointer text-foreground">
              ORM
            </Label>
          </div>
        </RadioGroup>
      </div>

      <Button
        type="submit"
        className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
        size="lg"
      >
        Search Flights
      </Button>
    </form>
  );
}
