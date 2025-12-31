import { MockOrder } from "@/types/domain";
import { addTicketsForOrder } from "./ticketsService";

let orders: MockOrder[] = [
  {
    id: "ord-1",
    userId: "user-fjkpxl",
    orderNumber: "PAL-2025-001234",
    eventId: "1",
    eventSlug: "mahmoud-darwish-poetry-night",
    eventTitle: { en: "Mahmoud Darwish Poetry Night", ar: "ليلة شعر محمود درويش" },
    eventDate: "2025-02-14",
    eventTime: "19:00",
    eventVenue: { en: "Ramallah Cultural Palace", ar: "قصر رام الله الثقافي" },
    eventImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop",
    attendeeName: "Ahmad Hassan",
    tickets: [
      { tierId: "regular", tierName: { en: "Regular", ar: "عادي" }, quantity: 2, price: 75 },
    ],
    total: 150,
    purchaseDate: "2025-01-15",
    status: "confirmed",
  },
  {
    id: "ord-2",
    userId: "user-fjkpxl",
    orderNumber: "PAL-2025-001235",
    eventId: "2",
    eventSlug: "palestinian-food-festival",
    eventTitle: { en: "Palestinian Food Festival 2025", ar: "مهرجان الطعام الفلسطيني 2025" },
    eventDate: "2025-03-21",
    eventTime: "11:00",
    eventVenue: { en: "Manger Square, Bethlehem", ar: "ساحة المهد، بيت لحم" },
    eventImage: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=600&fit=crop",
    attendeeName: "Ahmad Hassan",
    tickets: [
      { tierId: "weekend-pass", tierName: { en: "Weekend Pass", ar: "تذكرة نهاية الأسبوع" }, quantity: 1, price: 60 },
    ],
    total: 60,
    purchaseDate: "2025-01-20",
    status: "confirmed",
  },
];

const LATENCY = 300;

const simulateLatency = <T>(data: T): Promise<T> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(data);
    }, LATENCY);
  });
};

export const fetchOrdersByUser = async (userId: string): Promise<MockOrder[]> => {
  return simulateLatency(orders.filter(o => o.userId === userId));
};

export const createOrder = async (orderData: Omit<MockOrder, "id" | "orderNumber" | "purchaseDate" | "status">): Promise<MockOrder> => {
  const newOrder: MockOrder = {
    ...orderData,
    id: `ord-${Date.now()}`,
    orderNumber: `PAL-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`,
    purchaseDate: new Date().toISOString().split("T")[0],
    status: "confirmed",
  };
  
  orders = [newOrder, ...orders];
  addTicketsForOrder(newOrder);
  return simulateLatency(newOrder);
};