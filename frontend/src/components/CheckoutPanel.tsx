import { useState } from "react";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Button } from "./ui/button";
import { Luggage } from "lucide-react";

interface CheckoutPanelProps {
  basePrice: number;
  queryEngine: "sql" | "orm";
  onBook: () => void;
}

const baggageOptions = [
  { value: "carry-on", label: "Carry-on only", price: 0 },
  { value: "20kg", label: "20kg Checked", price: 45 },
  { value: "32kg", label: "32kg Checked", price: 75 },
];

export function CheckoutPanel({ basePrice, queryEngine, onBook }: CheckoutPanelProps) {
  const [baggage, setBaggage] = useState("carry-on");

  const selectedBaggage = baggageOptions.find((opt) => opt.value === baggage);
  const totalPrice = basePrice + (selectedBaggage?.price || 0);

  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-6 h-fit sticky top-6">
      <div>
        <h3 className="text-foreground mb-4">Checkout & Baggage</h3>

        <div className="space-y-4">
          <div>
            <Label htmlFor="baggage" className="text-foreground mb-2 block">
              Baggage Type
            </Label>
            <Select value={baggage} onValueChange={setBaggage}>
              <SelectTrigger id="baggage" className="bg-input border-border text-foreground">
                <div className="flex items-center gap-2">
                  <Luggage className="size-4" />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {baggageOptions.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    className="text-popover-foreground focus:bg-accent focus:text-accent-foreground"
                  >
                    {option.label} {option.price > 0 && `(+$${option.price})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="border-t border-border pt-4 space-y-2">
            <div className="flex justify-between text-muted-foreground">
              <span>Flight</span>
              <span>${basePrice}</span>
            </div>
            {selectedBaggage && selectedBaggage.price > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>Baggage</span>
                <span>+${selectedBaggage.price}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-border">
              <span className="text-foreground">Total Price</span>
              <span className="text-primary">${totalPrice}</span>
            </div>
          </div>
        </div>
      </div>

      <Button
        onClick={onBook}
        className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
        size="lg"
      >
        Book ({queryEngine.toUpperCase()} Transaction)
      </Button>
    </div>
  );
}
