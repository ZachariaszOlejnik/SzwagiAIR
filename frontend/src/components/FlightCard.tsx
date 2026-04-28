import { Plane, Clock } from "lucide-react";
import { Button } from "./ui/button";

export interface Flight {
  id: string;
  origin: string;
  destination: string;
  via: string;
  segments: {
    from: string;
    to: string;
    departure: string;
    arrival: string;
    duration: string;
  }[];
  layover: string;
  price: number;
}

interface FlightCardProps {
  flight: Flight;
  onSelect: () => void;
}

export function FlightCard({ flight, onSelect }: FlightCardProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-foreground mb-1">
            {flight.origin} to {flight.destination}
          </h3>
          <p className="text-muted-foreground">via {flight.via}</p>
        </div>
        <div className="text-right">
          <div className="text-primary">${flight.price}</div>
          <div className="text-muted-foreground">per person</div>
        </div>
      </div>

      <div className="space-y-4">
        {/* First Segment */}
        <div className="bg-muted rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Plane className="size-4" />
              <span>Segment 1</span>
            </div>
            <span className="text-muted-foreground">{flight.segments[0].duration}</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-foreground">{flight.segments[0].departure}</div>
              <div className="text-muted-foreground">{flight.segments[0].from}</div>
            </div>
            <div className="text-right">
              <div className="text-foreground">{flight.segments[0].arrival}</div>
              <div className="text-muted-foreground">{flight.segments[0].to}</div>
            </div>
          </div>
        </div>

        {/* Layover Badge */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 bg-accent border border-primary/30 text-primary px-4 py-2 rounded-full">
            <Clock className="size-4" />
            <span>{flight.layover} Layover</span>
          </div>
        </div>

        {/* Second Segment */}
        <div className="bg-muted rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Plane className="size-4" />
              <span>Segment 2</span>
            </div>
            <span className="text-muted-foreground">{flight.segments[1].duration}</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-foreground">{flight.segments[1].departure}</div>
              <div className="text-muted-foreground">{flight.segments[1].from}</div>
            </div>
            <div className="text-right">
              <div className="text-foreground">{flight.segments[1].arrival}</div>
              <div className="text-muted-foreground">{flight.segments[1].to}</div>
            </div>
          </div>
        </div>
      </div>

      <Button
        onClick={onSelect}
        className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 border border-border"
        size="lg"
      >
        Select Flight
      </Button>
    </div>
  );
}
