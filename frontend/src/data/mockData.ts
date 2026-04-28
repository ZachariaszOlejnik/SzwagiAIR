export interface Flight {
  id: string;
  flightNumber: string;
  from: string;
  fromCity: string;
  to: string;
  toCity: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  direct: boolean;
  via?: string;
  viaCity?: string;
  layoverDuration?: string;
  price: number;
  seatsLeft: number;
  aircraft: string;
  date: string;
  status?: 'scheduled' | 'boarding' | 'departed' | 'cancelled' | 'delayed';
}

export interface BookingService {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: string;
  category: 'baggage' | 'premium';
}

export interface AdminFlight {
  id: string;
  number: string;
  from: string;
  fromCity: string;
  to: string;
  toCity: string;
  date: string;
  time: string;
  aircraft: string;
  capacity: number;
  seatsBooked: number;
  status: 'scheduled' | 'boarding' | 'departed' | 'cancelled' | 'delayed';
  basePrice: number;
  crew: string[];
}

export interface CrewMember {
  id: string;
  name: string;
  role: 'pilot' | 'stewardess';
  rank?: string;
  license?: string;
  available: boolean;
}

export interface AdminService {
  id: string;
  name: string;
  category: 'baggage' | 'premium' | 'comfort';
  description: string;
  price: number;
}

export const AIRPORTS = [
  { code: 'WAW', city: 'Warszawa', country: 'PL', name: 'Lotnisko Chopina' },
  { code: 'KRK', city: 'Kraków', country: 'PL', name: 'Balice' },
  { code: 'GDN', city: 'Gdańsk', country: 'PL', name: 'Lech Wałęsa' },
  { code: 'LHR', city: 'Londyn', country: 'GB', name: 'Heathrow' },
  { code: 'CDG', city: 'Paryż', country: 'FR', name: 'Charles de Gaulle' },
  { code: 'FRA', city: 'Frankfurt', country: 'DE', name: 'Frankfurt Main' },
  { code: 'JFK', city: 'Nowy Jork', country: 'US', name: 'John F. Kennedy' },
  { code: 'ORD', city: 'Chicago', country: 'US', name: "O'Hare" },
  { code: 'DXB', city: 'Dubaj', country: 'AE', name: 'Dubai International' },
  { code: 'SIN', city: 'Singapur', country: 'SG', name: 'Changi' },
  { code: 'AMS', city: 'Amsterdam', country: 'NL', name: 'Schiphol' },
  { code: 'MUC', city: 'Monachium', country: 'DE', name: 'Franz Josef Strauss' },
];

export const AIRCRAFT_TYPES = [
  { code: 'B787', name: 'Boeing 787-9 Dreamliner', capacity: 296 },
  { code: 'B777', name: 'Boeing 777-300ER', capacity: 396 },
  { code: 'A350', name: 'Airbus A350-900', capacity: 314 },
  { code: 'A320', name: 'Airbus A320neo', capacity: 180 },
  { code: 'B737', name: 'Boeing 737 MAX 8', capacity: 162 },
  { code: 'A380', name: 'Airbus A380-800', capacity: 555 },
];

export const searchResults: Flight[] = [
  {
    id: 'f1',
    flightNumber: 'SA 301',
    from: 'WAW', fromCity: 'Warszawa',
    to: 'JFK', toCity: 'Nowy Jork',
    departureTime: '08:15', arrivalTime: '18:45',
    duration: '13h 30m',
    direct: false,
    via: 'LHR', viaCity: 'Londyn',
    layoverDuration: '4h',
    price: 1299,
    seatsLeft: 3,
    aircraft: 'Boeing 787-9',
    date: '2026-04-20',
    status: 'scheduled',
  },
  {
    id: 'f2',
    flightNumber: 'SA 205',
    from: 'WAW', fromCity: 'Warszawa',
    to: 'JFK', toCity: 'Nowy Jork',
    departureTime: '11:00', arrivalTime: '15:30',
    duration: '9h 30m',
    direct: true,
    price: 1899,
    seatsLeft: 12,
    aircraft: 'Airbus A350-900',
    date: '2026-04-20',
    status: 'scheduled',
  },
  {
    id: 'f3',
    flightNumber: 'SA 412',
    from: 'WAW', fromCity: 'Warszawa',
    to: 'JFK', toCity: 'Nowy Jork',
    departureTime: '06:00', arrivalTime: '17:10',
    duration: '14h 10m',
    direct: false,
    via: 'FRA', viaCity: 'Frankfurt',
    layoverDuration: '2h 30m',
    price: 1149,
    seatsLeft: 7,
    aircraft: 'Boeing 777-300ER',
    date: '2026-04-20',
    status: 'scheduled',
  },
  {
    id: 'f4',
    flightNumber: 'SA 550',
    from: 'WAW', fromCity: 'Warszawa',
    to: 'JFK', toCity: 'Nowy Jork',
    departureTime: '20:00', arrivalTime: '00:30+1',
    duration: '10h 30m',
    direct: true,
    price: 2100,
    seatsLeft: 2,
    aircraft: 'Airbus A380-800',
    date: '2026-04-20',
    status: 'scheduled',
  },
];

export const bookingServices: BookingService[] = [
  {
    id: 'carry-on',
    name: 'Bagaż podręczny',
    description: 'Do 8 kg, wliczony w cenę',
    price: 0,
    icon: 'briefcase',
    category: 'baggage',
  },
  {
    id: 'checked-20',
    name: 'Bagaż rejestrowany 20 kg',
    description: 'Jedna walizka do 20 kg',
    price: 150,
    icon: 'luggage',
    category: 'baggage',
  },
  {
    id: 'checked-32',
    name: 'Bagaż rejestrowany 32 kg',
    description: 'Jedna walizka do 32 kg',
    price: 250,
    icon: 'package',
    category: 'baggage',
  },
  {
    id: 'vip-lounge',
    name: 'Strefa VIP Lounge',
    description: 'Dostęp do ekskluzywnej strefy przed lotem',
    price: 280,
    icon: 'crown',
    category: 'premium',
  },
  {
    id: 'meal',
    name: 'Posiłek premium',
    description: 'Wybór z menu pokładowego premium',
    price: 85,
    icon: 'utensils',
    category: 'premium',
  },
  {
    id: 'priority',
    name: 'Pierwszeństwo wejścia',
    description: 'Priorytetowy boarding',
    price: 50,
    icon: 'star',
    category: 'premium',
  },
  {
    id: 'seat-premium',
    name: 'Miejsce premium',
    description: 'Dodatkowa przestrzeń na nogi (rządy 1-5)',
    price: 120,
    icon: 'armchair',
    category: 'premium',
  },
];

export const adminFlights: AdminFlight[] = [
  {
    id: 'af1',
    number: 'SA 301',
    from: 'WAW', fromCity: 'Warszawa',
    to: 'JFK', toCity: 'Nowy Jork',
    date: '2026-04-20',
    time: '08:15',
    aircraft: 'Boeing 787-9',
    capacity: 296,
    seatsBooked: 283,
    status: 'scheduled',
    basePrice: 1299,
    crew: ['pilot-1', 'pilot-2', 'stew-1', 'stew-2', 'stew-3'],
  },
  {
    id: 'af2',
    number: 'SA 205',
    from: 'WAW', fromCity: 'Warszawa',
    to: 'JFK', toCity: 'Nowy Jork',
    date: '2026-04-20',
    time: '11:00',
    aircraft: 'Airbus A350-900',
    capacity: 314,
    seatsBooked: 198,
    status: 'boarding',
    basePrice: 1899,
    crew: ['pilot-3', 'stew-1', 'stew-4'],
  },
  {
    id: 'af3',
    number: 'SA 412',
    from: 'WAW', fromCity: 'Warszawa',
    to: 'JFK', toCity: 'Nowy Jork',
    date: '2026-04-20',
    time: '06:00',
    aircraft: 'Boeing 777-300ER',
    capacity: 396,
    seatsBooked: 389,
    status: 'departed',
    basePrice: 1149,
    crew: ['pilot-1', 'pilot-4', 'stew-2', 'stew-5'],
  },
  {
    id: 'af4',
    number: 'SA 550',
    from: 'WAW', fromCity: 'Warszawa',
    to: 'JFK', toCity: 'Nowy Jork',
    date: '2026-04-20',
    time: '20:00',
    aircraft: 'Airbus A380-800',
    capacity: 555,
    seatsBooked: 512,
    status: 'scheduled',
    basePrice: 2100,
    crew: ['pilot-2', 'pilot-3', 'stew-1', 'stew-3', 'stew-4', 'stew-5'],
  },
  {
    id: 'af5',
    number: 'SA 178',
    from: 'WAW', fromCity: 'Warszawa',
    to: 'LHR', toCity: 'Londyn',
    date: '2026-04-21',
    time: '07:30',
    aircraft: 'Airbus A320neo',
    capacity: 180,
    seatsBooked: 142,
    status: 'scheduled',
    basePrice: 499,
    crew: ['pilot-4', 'stew-2', 'stew-5'],
  },
  {
    id: 'af6',
    number: 'SA 290',
    from: 'WAW', fromCity: 'Warszawa',
    to: 'DXB', toCity: 'Dubaj',
    date: '2026-04-21',
    time: '14:45',
    aircraft: 'Boeing 787-9',
    capacity: 296,
    seatsBooked: 87,
    status: 'delayed',
    basePrice: 1599,
    crew: ['pilot-1', 'stew-3', 'stew-4'],
  },
];

export const crewMembers: CrewMember[] = [
  { id: 'pilot-1', name: 'Kpt. Jan Kowalski', role: 'pilot', rank: 'Kapitan', license: 'ATPL-PL-001', available: true },
  { id: 'pilot-2', name: 'Kpt. Marek Wiśniewski', role: 'pilot', rank: 'Kapitan', license: 'ATPL-PL-002', available: true },
  { id: 'pilot-3', name: 'F/O Maria Nowak', role: 'pilot', rank: 'Pierwszy Oficer', license: 'ATPL-PL-003', available: true },
  { id: 'pilot-4', name: 'F/O Tomasz Zając', role: 'pilot', rank: 'Pierwszy Oficer', license: 'ATPL-PL-004', available: false },
  { id: 'stew-1', name: 'Anna Kowalczyk', role: 'stewardess', available: true },
  { id: 'stew-2', name: 'Katarzyna Zielińska', role: 'stewardess', available: true },
  { id: 'stew-3', name: 'Monika Lewandowska', role: 'stewardess', available: true },
  { id: 'stew-4', name: 'Piotr Wróblewski', role: 'stewardess', available: false },
  { id: 'stew-5', name: 'Agnieszka Szymańska', role: 'stewardess', available: true },
  { id: 'stew-6', name: 'Rafał Dąbrowski', role: 'stewardess', available: true },
];

export const adminServices: AdminService[] = [
  { id: 's1', name: 'Bagaż podręczny 8 kg', category: 'baggage', description: 'Wliczony w cenę biletu', price: 0 },
  { id: 's2', name: 'Bagaż rejestrowany 20 kg', category: 'baggage', description: 'Jedna walizka do 20 kg', price: 150 },
  { id: 's3', name: 'Bagaż rejestrowany 32 kg', category: 'baggage', description: 'Jedna walizka do 32 kg', price: 250 },
  { id: 's4', name: 'Strefa VIP Lounge', category: 'premium', description: 'Dostęp do ekskluzywnej strefy VIP przed lotem', price: 280 },
  { id: 's5', name: 'Posiłek premium', category: 'premium', description: 'Wybór z menu pokładowego premium', price: 85 },
  { id: 's6', name: 'Pierwszeństwo wejścia', category: 'premium', description: 'Priorytetowy boarding na pokład', price: 50 },
  { id: 's7', name: 'Miejsce premium (rz. 1-5)', category: 'comfort', description: 'Dodatkowa przestrzeń na nogi', price: 120 },
  { id: 's8', name: 'Transfer na lotnisko', category: 'comfort', description: 'Limuzyna lub van', price: 350 },
];
