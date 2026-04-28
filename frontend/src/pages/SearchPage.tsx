import { useNavigate } from "react-router";
import { SearchForm, SearchData } from "../components/SearchForm";
import { Plane, Globe } from "lucide-react";

export function SearchPage() {
  const navigate = useNavigate();

  const handleSearch = (data: SearchData) => {
    navigate("/results", { state: data });
  };

  return (
    <div className="min-h-screen bg-background dark flex">
      {/* Left Sidebar - Search Form */}
      <aside className="w-96 bg-card border-r border-border p-8 fixed h-screen overflow-y-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Plane className="size-6 text-primary" />
            </div>
            <h1 className="text-foreground">Flight Booking</h1>
          </div>
          <p className="text-muted-foreground">Search for your perfect flight</p>
        </div>

        <SearchForm onSearch={handleSearch} />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-96 flex items-center justify-center p-12">
        <div className="text-center space-y-8 max-w-lg">
          {/* Wireframe Globe Illustration */}
          <div className="relative mx-auto w-64 h-64">
            <div className="absolute inset-0 flex items-center justify-center">
              <Globe className="size-48 text-muted-foreground/20 animate-[spin_20s_linear_infinite]" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 border-2 border-primary/20 rounded-full" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-48 h-48 border-2 border-primary/10 rounded-full" />
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-foreground">Ready to Explore</h2>
            <p className="text-muted-foreground">
              Enter your travel details and select your preferred database query engine to find the
              best flights
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
