import { MockOrder, Event } from "@/types/domain";
import { addTicketsForOrder } from "./ticketsService";
import { apiFetch, getApiConfig, getLanguage } from "./apiClient";
import { fetchEventById } from "./eventsService";

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

type ApiOrder = {
  id: string;
  userId: string;
  totalCents: number;
  currency: string;
  status: "PENDING" | "PAID" | "CANCELLED" | "REFUNDED";
  paymentStatus: "PENDING" | "AUTHORIZED" | "PAID" | "FAILED";
  attendeeName?: string | null;
  createdAt: string;
  eventId: string;
  items: {
    ticketTypeId: string;
    quantity: number;
    priceCents: number;
  }[];
};

const simulateLatency = <T>(data: T): Promise<T> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(data);
    }, LATENCY);
  });
};

const mapOrderStatus = (status: ApiOrder["status"]): MockOrder["status"] => {
  switch (status) {
    case "PAID": return "confirmed";
    case "PENDING": return "pending";
    case "CANCELLED": return "cancelled";
    case "REFUNDED": return "refunded";
    default: return "pending";
  }
};

const mapOrder = async (apiOrder: ApiOrder, lang: "en" | "ar", event?: Event): Promise<MockOrder> => {
  const targetEvent = event || await fetchEventById(apiOrder.eventId, lang);
  
  return {
    id: apiOrder.id,
    userId: apiOrder.userId,
    orderNumber: `PAL-${apiOrder.id.slice(0, 8).toUpperCase()}`,
    eventId: apiOrder.eventId,
    eventSlug: targetEvent?.slug || "",
    eventTitle: targetEvent?.title || { en: "Unknown Event", ar: "حدث غير معروف" },
    eventDate: targetEvent?.date || apiOrder.createdAt.split("T")[0],
    eventTime: targetEvent?.time || apiOrder.createdAt.split("T")[1].slice(0, 5),
    eventVenue: targetEvent?.venue.name || { en: "Unknown Venue", ar: "مكان غير معروف" },
    eventImage: targetEvent?.images[0] || "/placeholder.svg",
    attendeeName: apiOrder.attendeeName ?? "Attendee",
    tickets: apiOrder.items.map(item => {
      const tier = targetEvent?.ticketTiers.find(t => t.id === item.ticketTypeId);
      return {
        tierId: item.ticketTypeId,
        tierName: tier?.name || { en: "Ticket", ar: "تذكرة" },
        quantity: item.quantity,
        price: Math.round(item.priceCents / 100),
      };
    }),
    total: Math.round(apiOrder.totalCents / 100),
    purchaseDate: apiOrder.createdAt.split("T")[0],
    status: mapOrderStatus(apiOrder.status),
  };
};

export const fetchOrdersByUser = async (userId: string): Promise<MockOrder[]> => {
  const config = getApiConfig();
  if (!config) {
    return simulateLatency(orders.filter(o => o.userId === userId));
  }

  try {
    const lang = getLanguage();
    const apiOrders = await apiFetch<ApiOrder[]>(`/orders?userId=${encodeURIComponent(userId)}&skip=0&take=100`);
    const mapped = await Promise.all(apiOrders.map(o => mapOrder(o, lang)));
    // Client-side filtering as safety fallback
    return mapped.filter(o => o.userId === userId);
  } catch (error) {
    console.warn("Failed to fetch orders from API, falling back to mock", error);
    return simulateLatency(orders.filter(o => o.userId === userId));
  }
};

export const fetchAllOrders = async (): Promise<MockOrder[]> => {
  const config = getApiConfig();
  if (!config) {
    return simulateLatency(orders);
  }

  try {
    const lang = getLanguage();
    const apiOrders = await apiFetch<ApiOrder[]>(`/orders?skip=0&take=100`);
    return await Promise.all(apiOrders.map(o => mapOrder(o, lang)));
  } catch (error) {
    console.warn("Failed to fetch all orders from API, falling back to mock", error);
    return simulateLatency(orders);
  }
};

export const createOrder = async (orderData: Omit<MockOrder, "id" | "orderNumber" | "purchaseDate" | "status">): Promise<MockOrder> => {
  const config = getApiConfig();

  if (config) {
    try {
      const response = await apiFetch<{
        id: string;
        totalCents: number;
        paymentStatus: "PENDING" | "AUTHORIZED" | "PAID" | "FAILED";
        status: ApiOrder["status"];
        createdAt: string;
        eventId: string;
        userId: string;
        currency: string;
        items: ApiOrder["items"];
      }>("/orders", {
        method: "POST",
        body: JSON.stringify({
          eventId: orderData.eventId,
          items: orderData.tickets.map((ticket) => ({
            ticketTypeId: ticket.tierId,
            quantity: ticket.quantity,
          })),
          attendeeName: orderData.attendeeName,
        }),
      });

      const lang = getLanguage();
      const mapped = await mapOrder(response, lang);
      orders = [mapped, ...orders];
      return mapped;
    } catch (error) {
      console.warn("Failed to create order via API, falling back to mock", error);
    }
  }

  const orderId = `ord-${Date.now()}`;
  const status: MockOrder["status"] = "confirmed";

  const newOrder: MockOrder = {
    ...orderData,
    id: orderId,
    orderNumber: `PAL-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`,
    purchaseDate: new Date().toISOString().split("T")[0],
    status,
  };

  orders = [newOrder, ...orders];
  addTicketsForOrder(newOrder);
  return simulateLatency(newOrder);
};