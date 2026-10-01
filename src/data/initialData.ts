export const initialData = {
  rooms: [
    {
      id: 'room-101',
      name: 'Room 101',
      capacity: 30,
      features: ['Проектор', 'Маркерная доска'],
    },
    {
      id: 'room-203',
      name: 'Room 203',
      capacity: 20,
      features: ['Телевизор'],
    },
  ],

  assets: [
    {
      id: 'asset-001',
      name: 'Проектор Epson',
      inventoryCode: 'EP-001',
      status: 'available',
    },
    {
      id: 'asset-002',
      name: 'Ноутбук Lenovo',
      inventoryCode: 'LN-001',
      status: 'available',
    },
  ],

  bookings: [],
};
