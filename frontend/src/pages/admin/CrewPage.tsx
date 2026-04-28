import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  ChevronLeft, Users, Check, Save, Plane, Star, UserCheck, UserX,
} from 'lucide-react';
import { adminFlights, crewMembers, CrewMember } from '../../data/mockData';

function CrewMemberCard({
  member,
  selected,
  onToggle,
}: {
  member: CrewMember;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      disabled={!member.available && !selected}
      className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all ${
        selected
          ? 'border-sky-500 bg-sky-50'
          : !member.available
            ? 'border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed'
            : 'border-slate-200 bg-white hover:border-slate-300'
      }`}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
        selected ? 'bg-sky-500' : 'bg-slate-200'
      }`}>
        <span className={`text-sm ${selected ? 'text-white' : 'text-slate-600'}`} style={{ fontWeight: 700 }}>
          {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm truncate ${selected ? 'text-sky-700' : 'text-slate-700'}`} style={{ fontWeight: 600 }}>
          {member.name}
        </p>
        {member.rank && (
          <p className="text-slate-400 text-xs">{member.rank}</p>
        )}
        {member.license && (
          <p className="text-slate-400 text-xs">{member.license}</p>
        )}
        {!member.available && (
          <p className="text-red-400 text-xs" style={{ fontWeight: 500 }}>Niedostępny</p>
        )}
      </div>
      <div className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
        selected ? 'border-sky-500 bg-sky-500' : 'border-slate-300'
      }`}>
        {selected && <Check className="size-3 text-white" />}
      </div>
    </button>
  );
}

export function CrewPage() {
  const { flightId } = useParams();
  const navigate = useNavigate();

  const flight = adminFlights.find(f => f.id === flightId) || adminFlights[0];

  const [selectedCrew, setSelectedCrew] = useState<Set<string>>(
    new Set(flight.crew)
  );
  const [saved, setSaved] = useState(false);

  const pilots = crewMembers.filter(m => m.role === 'pilot');
  const stewardesses = crewMembers.filter(m => m.role === 'stewardess');

  const toggleMember = (id: string) => {
    setSelectedCrew(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const selectedPilots = pilots.filter(m => selectedCrew.has(m.id));
  const selectedStews = stewardesses.filter(m => selectedCrew.has(m.id));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <button
            onClick={() => navigate('/admin')}
            className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600 text-sm mb-3 transition-colors"
          >
            <ChevronLeft className="size-4" />
            Powrót do siatki lotów
          </button>
          <h1 className="text-slate-900" style={{ fontWeight: 800, fontSize: '1.5rem' }}>
            Zarządzanie Załogą
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">Przypisz pilotów i stewardesy do rejsu</p>
        </div>
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm shadow-md transition-all ${
            saved
              ? 'bg-green-500 text-white shadow-green-500/20'
              : 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/20'
          }`}
          style={{ fontWeight: 600 }}
        >
          {saved ? <><Check className="size-4" /> Zapisano!</> : <><Save className="size-4" /> Zapisz zmiany</>}
        </button>
      </div>

      {/* Flight detail card */}
      <div className="bg-[#0f2241] rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-white/15 p-2.5 rounded-xl border border-white/20">
            <Plane className="size-6 text-white" />
          </div>
          <div>
            <p className="text-sky-400 text-sm" style={{ fontWeight: 600 }}>{flight.number}</p>
            <p className="text-white/60 text-xs">{flight.aircraft}</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-white/60 text-xs">Data</p>
            <p className="text-white text-sm" style={{ fontWeight: 600 }}>
              {new Date(flight.date).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div>
            <p className="text-white" style={{ fontWeight: 800, fontSize: '2rem', lineHeight: 1 }}>{flight.from}</p>
            <p className="text-sky-300 text-sm" style={{ fontWeight: 500 }}>{flight.fromCity}</p>
          </div>
          <div className="flex-1 flex items-center gap-2">
            <div className="flex-1 h-px bg-white/20" />
            <Plane className="size-5 text-white/40" />
            <div className="flex-1 h-px bg-white/20" />
          </div>
          <div className="text-right">
            <p className="text-white" style={{ fontWeight: 800, fontSize: '2rem', lineHeight: 1 }}>{flight.to}</p>
            <p className="text-sky-300 text-sm" style={{ fontWeight: 500 }}>{flight.toCity}</p>
          </div>
        </div>

        {/* Crew summary */}
        <div className="mt-5 pt-4 border-t border-white/10 flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Star className="size-4 text-amber-400" />
            <span className="text-white/70 text-sm">{selectedPilots.length} {selectedPilots.length === 1 ? 'pilot' : 'pilotów'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="size-4 text-sky-400" />
            <span className="text-white/70 text-sm">{selectedStews.length} {selectedStews.length === 1 ? 'steward' : 'stewardów/ess'}</span>
          </div>
          {selectedPilots.length < 1 && (
            <div className="flex items-center gap-1.5 text-red-400 text-xs ml-auto">
              <UserX className="size-4" />
              Wymagany co najmniej 1 pilot
            </div>
          )}
          {selectedPilots.length >= 1 && selectedStews.length >= 1 && (
            <div className="flex items-center gap-1.5 text-green-400 text-xs ml-auto">
              <UserCheck className="size-4" />
              Minimalna obsada skompletowana
            </div>
          )}
        </div>
      </div>

      {/* Crew selection */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pilots */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Star className="size-4 text-amber-600" />
            </div>
            <div>
              <h3 className="text-slate-900" style={{ fontWeight: 700 }}>Piloci</h3>
              <p className="text-slate-400 text-xs">Wybrano: {selectedPilots.length} / {pilots.length}</p>
            </div>
          </div>
          <div className="p-4 space-y-2.5">
            {pilots.map(pilot => (
              <CrewMemberCard
                key={pilot.id}
                member={pilot}
                selected={selectedCrew.has(pilot.id)}
                onToggle={() => toggleMember(pilot.id)}
              />
            ))}
          </div>
        </div>

        {/* Stewardesses */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
            <div className="p-2 bg-sky-100 rounded-lg">
              <Users className="size-4 text-sky-600" />
            </div>
            <div>
              <h3 className="text-slate-900" style={{ fontWeight: 700 }}>Personel pokładowy</h3>
              <p className="text-slate-400 text-xs">Wybrano: {selectedStews.length} / {stewardesses.length}</p>
            </div>
          </div>
          <div className="p-4 space-y-2.5">
            {stewardesses.map(stew => (
              <CrewMemberCard
                key={stew.id}
                member={stew}
                selected={selectedCrew.has(stew.id)}
                onToggle={() => toggleMember(stew.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
