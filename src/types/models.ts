export interface Room {
  id: string;
  name: string;
  capacity: number;
  features: string[];
}

export interface Asset {
  id: string;
  name: string;
  inventoryCode: string;
  status: string;
}

export interface Booking {
  id: string;
  resourceType: 'room' | 'asset';
  resourceId: string;
  title: string;
  start: string;
  end: string;
  notes: string;
}

export interface AppData {
  rooms: Room[];
  assets: Asset[];
  bookings: Booking[];
}
