import { MockTicket, MockOrder } from "@/types/domain";
import { apiFetch, getApiConfig, getLanguage } from "./apiClient";
import { fetchEventById } from "./eventsService";

let tickets: MockTicket[] = [
  {
    id: "tkt-1",
    userId: "user-fjkpxl",
    orderId: "ord-1",
    ticketNumber: "TKT-001234-A",
    eventId: "1",
    eventSlug: "mahmoud-darwish-poetry-night",
    eventTitle: { en: "Mahmoud Darwish Poetry Night", ar: "ليلة شعر محمود درويش" },
    eventDate: "2025-02-14",
    eventTime: "19:00",
    eventVenue: { en: "Ramallah Cultural Palace", ar: "قصر رام الله الثقافي" },
    eventImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop",
    tierName: { en: "Regular", ar: "عادي" },
    attendeeName: "Ahmad Hassan",
    qrCode: "PALTICKET-TKT-001234-A-VALID",
    status: "valid",
  },
  {
    id: "tkt-2",
    userId: "user-fjkpxl",
    orderId: "ord-1",
    ticketNumber: "TKT-001234-B",
    eventId: "1",
    eventSlug: "mahmoud-darwish-poetry-night",
    eventTitle: { en: "Mahmoud Darwish Poetry Night", ar: "ليلة شعر محمود درويش" },
    eventDate: "2025-02-14",
    eventTime: "19:00",
    eventVenue: { en: "Ramallah Cultural Palace", ar: "قصر رام الله الثقافي" },
    eventImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop",
    tierName: { en: "Regular", ar: "عادي" },
    attendeeName: "Sara Khalil",
    qrCode: "PALTICKET-TKT-001234-B-VALID",
    status: "valid",
  },
  {
    id: "tkt-3",
    userId: "user-fjkpxl",
    orderId: "ord-2",
    ticketNumber: "TKT-001235-A",
    eventId: "2",
    eventSlug: "palestinian-food-festival",
    eventTitle: { en: "Palestinian Food Festival 2025", ar: "مهرجان الطعام الفلسطيني 2025" },
    eventDate: "2025-03-21",
    eventTime: "11:00",
    eventVenue: { en: "Manger Square, Bethlehem", ar: "ساحة المهد، بيت لحم" },
    eventImage: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=600&fit=crop",
    tierName: { en: "Weekend Pass", ar: "تذكرة نهاية الأسبوع" },
    attendeeName: "Ahmad Hassan",
    qrCode: "PALTICKET-TKT-001235-A-VALID",
    status: "valid",
  },
];

const LATENCY = 300;

type ApiTicket = {
  id: string;
  code: string;
  status: "ISSUED" | "SCANNED" | "VOID";
  ticketTypeId: string;
  orderId: string;
  eventId: string; // From relation if joined, or need to fetch
  attendeeName?: string | null;
  ticketType: {
    name: string;
  };
  order: {
    userId: string;
  };
  scanLogs?: {
    scannedAt: string;
    result: string;
    gate?: {
      name: string;
    };
  }[];
  event?: {
    id: string;
    slug: string;
    startTime: string;
    translations: { name: string }[];
  };
};

const simulateLatency = <T>(data: T): Promise<T> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(data);
    }, LATENCY);
  });
};

const mapTicketStatus = (status: ApiTicket["status"]): MockTicket["status"] => {
  switch (status) {
    case "ISSUED": return "valid";
    case "SCANNED": return "used";
    case "VOID": return "cancelled";
    default: return "valid";
  }
};

const mapTicket = async (apiTicket: ApiTicket, lang: "en" | "ar"): Promise<MockTicket> => {
  // Fetch event details to fill the gaps
  const eventId = apiTicket.eventId;
  const event = await fetchEventById(eventId, lang);

  return {
    id: apiTicket.id,
    userId: apiTicket.order.userId,
    orderId: apiTicket.orderId,
    ticketNumber: apiTicket.code,
    eventId: eventId,
    eventSlug: event?.slug || "",
    eventTitle: event?.title || { en: "Unknown", ar: "غير معروف" },
    eventDate: event?.date || "",
    eventTime: event?.time || "",
    eventVenue: event?.venue.name || { en: "Unknown", ar: "غير معروف" },
    eventImage: event?.images[0] || "/placeholder.svg",
    tierName: { en: apiTicket.ticketType.name, ar: apiTicket.ticketType.name },
    attendeeName: apiTicket.attendeeName || "Attendee",
    qrCode: apiTicket.code,
    status: mapTicketStatus(apiTicket.status),
    scanHistory: apiTicket.scanLogs?.map(log => ({
      scannedAt: log.scannedAt,
      result: log.result,
      gateName: log.gate?.name
    }))
  };
};

export const fetchTicketsByUser = async (userId: string): Promise<MockTicket[]> => {
  const config = getApiConfig();
  if (!config) {
    return simulateLatency(tickets.filter(t => t.userId === userId));
  }

  try {
    const lang = getLanguage();
    const apiTickets = await apiFetch<ApiTicket[]>(`/tickets?userId=${encodeURIComponent(userId)}&skip=0&take=100`);
    const mapped = await Promise.all(apiTickets.map(t => mapTicket(t, lang)));
    // Client-side filtering as safety fallback
    return mapped.filter(t => t.userId === userId);
  } catch (error) {
    console.warn("Failed to fetch tickets from API, falling back to mock", error);
    return simulateLatency(tickets.filter(t => t.userId === userId));
  }
};

export const fetchAllTickets = async (): Promise<MockTicket[]> => {
  const config = getApiConfig();
  if (!config) {
    return simulateLatency(tickets);
  }

  try {
    const lang = getLanguage();
    const apiTickets = await apiFetch<ApiTicket[]>(`/tickets?skip=0&take=100`);
    return await Promise.all(apiTickets.map(t => mapTicket(t, lang)));
  } catch (error) {
    console.warn("Failed to fetch all tickets from API, falling back to mock", error);
    return simulateLatency(tickets);
  }
};

export const addTicketsForOrder = (order: MockOrder) => {
  const newTickets: MockTicket[] = [];
  
  order.tickets.forEach((item) => {
    for (let i = 0; i < item.quantity; i++) {
      const ticketNumber = `TKT-${order.orderNumber.split('-')[2]}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
      
      newTickets.push({
        id: `tkt-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        userId: order.userId,
        orderId: order.id,
        ticketNumber: ticketNumber,
        eventId: order.eventId,
        eventSlug: order.eventSlug,
        eventTitle: order.eventTitle,
        eventDate: order.eventDate,
        eventTime: order.eventTime,
        eventVenue: order.eventVenue,
        eventImage: order.eventImage,
        tierName: item.tierName,
        attendeeName: order.attendeeName, 
        qrCode: `PALTICKET-${ticketNumber}-VALID`,
        status: "valid",
      });
    }
  });
  
  tickets = [...newTickets, ...tickets];
};