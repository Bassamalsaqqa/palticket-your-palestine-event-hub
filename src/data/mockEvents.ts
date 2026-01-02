import { City, Category, Event, EventFilters } from "@/types/domain";

export type { City, Category, Event, EventFilters, TicketTier } from "@/types/domain";

export const cities: City[] = [
  { id: "jerusalem", slug: "jerusalem", name: { en: "Jerusalem", ar: "\u0627\u0644\u0642\u062f\u0633" } },
  { id: "berlin", slug: "berlin", name: { en: "Berlin", ar: "\u0628\u0631\u0644\u064a\u0646" } },
  { id: "haifa", slug: "haifa", name: { en: "Haifa", ar: "\u062d\u064a\u0641\u0627" } },
  { id: "amman", slug: "amman", name: { en: "Amman", ar: "\u0639\u0645\u0627\u0646" } },
  { id: "tel-aviv", slug: "tel-aviv", name: { en: "Tel Aviv", ar: "\u062a\u0644 \u0623\u0628\u064a\u0628" } },
  { id: "nazareth", slug: "nazareth", name: { en: "Nazareth", ar: "\u0627\u0644\u0646\u0627\u0635\u0631\u0629" } },
  { id: "amsterdam", slug: "amsterdam", name: { en: "Amsterdam", ar: "\u0623\u0645\u0633\u062a\u0631\u062f\u0627\u0645" } },
];

export const categories: Category[] = [
  { id: "music", slug: "music", name: { en: "Music", ar: "\u0645\u0648\u0633\u064a\u0642\u0649" }, icon: "Music", color: "hsl(var(--primary))" },
  { id: "sports", slug: "sports", name: { en: "Sports", ar: "\u0631\u064a\u0627\u0636\u0629" }, icon: "Trophy", color: "hsl(var(--accent))" },
  { id: "arts", slug: "arts", name: { en: "Arts & Culture", ar: "\u0641\u0646\u0648\u0646 \u0648\u062b\u0642\u0627\u0641\u0629" }, icon: "Palette", color: "hsl(var(--gold))" },
  { id: "food", slug: "food", name: { en: "Food & Drink", ar: "\u0637\u0639\u0627\u0645 \u0648\u0645\u0634\u0631\u0648\u0628\u0627\u062a" }, icon: "UtensilsCrossed", color: "hsl(20, 60%, 50%)" },
  { id: "business", slug: "business", name: { en: "Business", ar: "\u0623\u0639\u0645\u0627\u0644" }, icon: "Briefcase", color: "hsl(200, 50%, 45%)" },
  { id: "family", slug: "family", name: { en: "Family", ar: "\u0639\u0627\u0626\u0644\u064a" }, icon: "Users", color: "hsl(145, 60%, 40%)" },
  { id: "nightlife", slug: "nightlife", name: { en: "Nightlife", ar: "\u0633\u0647\u0631\u0627\u062a" }, icon: "Moon", color: "hsl(270, 50%, 50%)" },
  { id: "comedy", slug: "comedy", name: { en: "Comedy", ar: "\u0643\u0648\u0645\u064a\u062f\u064a\u0627" }, icon: "Laugh", color: "hsl(45, 90%, 50%)" },
  { id: "festivals", slug: "festivals", name: { en: "Festivals", ar: "\u0645\u0647\u0631\u062c\u0627\u0646\u0627\u062a" }, icon: "PartyPopper", color: "hsl(330, 70%, 55%)" },
  { id: "workshops", slug: "workshops", name: { en: "Workshops", ar: "\u0648\u0631\u0634 \u0639\u0645\u0644" }, icon: "GraduationCap", color: "hsl(180, 50%, 45%)" },
];

export const mockEvents: Event[] = [
  {
    id: "3079",
    slug: "sound-of-christmas",
    title: {
      en: "SOUND OF CHRISTMAS",
      ar: "\u0635\u0648\u062a \u0627\u0644\u0645\u064a\u0644\u0627\u062f (SOUND OF CHRISTMAS)",
    },
    description: {
      en: "A Christmas evening with the Umsiat Ensemble, bringing voices of love and hope to Jerusalem. Proceeds support art for ill children.",
      ar: "\u0623\u0645\u0633\u064a\u0629 \u0645\u064a\u0644\u0627\u062f\u064a\u0629 \u0645\u0639 \u0641\u0631\u0642\u0629 \u0623\u0645\u0633\u064a\u0627\u062a \u0627\u0644\u0642\u0627\u062f\u0645\u0629 \u0645\u0646 \u0627\u0644\u0631\u064a\u0646\u0629 \u0625\u0644\u0649 \u0627\u0644\u0642\u062f\u0633\u060c \u062a\u062d\u0645\u0644 \u0623\u0635\u0648\u0627\u062a \u0627\u0644\u0645\u062d\u0628\u0629 \u0648\u0627\u0644\u0623\u0645\u0644 \u0648\u0627\u0644\u0625\u0646\u0633\u0627\u0646\u064a\u0629. \u0631\u064a\u0639 \u0627\u0644\u062d\u0641\u0644 \u0644\u062f\u0639\u0645 \u0627\u0644\u0623\u0646\u0634\u0637\u0629 \u0627\u0644\u0641\u0646\u064a\u0629 \u0644\u0644\u0623\u0637\u0641\u0627\u0644 \u0627\u0644\u0645\u0631\u0636\u0649.",
    },
    category: "music",
    images: [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=600&fit=crop",
    ],
    date: "2026-01-03",
    time: "20:00",
    venue: {
      name: { en: "Al Ma'mal Foundation", ar: "\u0645\u0624\u0633\u0633\u0629 \u0627\u0644\u0645\u0639\u0645\u0644 \u0644\u0644\u0641\u0646 \u0627\u0644\u0645\u0639\u0627\u0635\u0631" },
      address: { en: "Al Ma'mal Foundation", ar: "\u0645\u0624\u0633\u0633\u0629 \u0627\u0644\u0645\u0639\u0645\u0644 \u0644\u0644\u0641\u0646 \u0627\u0644\u0645\u0639\u0627\u0635\u0631" },
      city: { en: "Jerusalem", ar: "\u0627\u0644\u0642\u062f\u0633" },
    },
    organizer: {
      name: { en: "PalTicket", ar: "PalTicket" },
    },
    ticketTiers: [
      {
        id: "regular",
        name: { en: "Regular", ar: "عادي" },
        price: 11,
        available: 100,
        total: 100,
      },
    ],
    featured: true,
    status: "upcoming",
  },
  {
    id: "2993",
    slug: "tanzen3000-classic-session",
    title: {
      en: "Tanzen3000: Classic Session",
      ar: "Tanzen3000: Classic Session",
    },
    description: {
      en: "A free-form dance session starting with a guided workshop, focusing on playful movement in a cozy 'living room' atmosphere.",
      ar: "\u062c\u0644\u0633\u0629 \u0631\u0642\u0635 \u062d\u0631 \u062a\u0628\u062f\u0623 \u0628\u0648\u0631\u0634\u0629 \u0639\u0645\u0644 \u062a\u0648\u062c\u064a\u0647\u064a\u0629\u060c \u062a\u0647\u062f\u0641 \u0625\u0644\u0649 \u0627\u0644\u0627\u0633\u062a\u0645\u062a\u0627\u0639 \u0628\u0627\u0644\u062d\u0631\u0643\u0629 \u0641\u064a \u0623\u062c\u0648\u0627\u0621 \u0645\u0631\u064a\u062d\u0629 \u062a\u0634\u0628\u0647 \u062d\u0641\u0644\u0627\u062a \u0627\u0644\u0645\u0646\u0632\u0644.",
    },
    category: "sports",
    images: [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=600&fit=crop",
    ],
    date: "2026-01-13",
    time: "20:00",
    venue: {
      name: { en: "Beate Uwe", ar: "\u0628\u064a\u0622\u062a\u0647 \u0623\u0648\u0641\u0647" },
      address: { en: "Beate Uwe", ar: "\u0628\u064a\u0622\u062a\u0647 \u0623\u0648\u0641\u0647" },
      city: { en: "Berlin", ar: "\u0628\u0631\u0644\u064a\u0646" },
    },
    organizer: {
      name: { en: "PalTicket", ar: "PalTicket" },
    },
    ticketTiers: [
      {
        id: "regular",
        name: { en: "Regular", ar: "عادي" },
        price: 19,
        available: 100,
        total: 100,
      },
    ],
    featured: true,
    status: "upcoming",
  },
  {
    id: "3078",
    slug: "brain-rot-how-does-our-brain-health-deteriorate",
    title: {
      en: "Brain Rot: How Does Our Brain Health Deteriorate?",
      ar: "\u062a\u0644\u0641 \u0627\u0644\u062f\u0645\u0627\u063a: \u0643\u064a\u0641 \u062a\u062a\u062f\u0647\u0648\u0631 \u0635\u062d\u0629 \u062f\u0645\u0627\u063a\u0646\u0627 \u062f\u0648\u0646 \u0623\u0646 \u0646\u0644\u0627\u062d\u0638\u061f",
    },
    description: {
      en: "A neuroscience talk exploring the impact of constant digital stimulation on attention and memory, with practical brain reset strategies.",
      ar: "\u0645\u062d\u0627\u0636\u0631\u0629 \u0639\u0644\u0645\u064a\u0629 \u062a\u0633\u062a\u0643\u0634\u0641 \u0623\u062b\u0631 \u0627\u0644\u062a\u062f\u0641\u0642 \u0627\u0644\u0645\u0633\u062a\u0645\u0631 \u0644\u0644\u0645\u0639\u0644\u0648\u0645\u0627\u062a \u0639\u0644\u0649 \u0627\u0644\u0630\u0627\u0643\u0631\u0629 \u0648\u0627\u0644\u0627\u0646\u062a\u0628\u0627\u0647\u060c \u0645\u0639 \u0627\u0633\u062a\u0631\u0627\u062a\u064a\u062c\u064a\u0627\u062a \u0639\u0645\u0644\u064a\u0629 \u0644\u0627\u0633\u062a\u0639\u0627\u062f\u0629 \u062a\u0648\u0627\u0632\u0646 \u0627\u0644\u062f\u0645\u0627\u063a.",
    },
    category: "arts",
    images: [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=600&fit=crop",
    ],
    date: "2026-01-14",
    time: "20:00",
    venue: {
      name: { en: "Fattoush Bar", ar: "\u0641\u062a\u0648\u0634 \u0628\u0627\u0631" },
      address: { en: "Fattoush Bar", ar: "\u0641\u062a\u0648\u0634 \u0628\u0627\u0631" },
      city: { en: "Haifa", ar: "\u062d\u064a\u0641\u0627" },
    },
    organizer: {
      name: { en: "PalTicket", ar: "PalTicket" },
    },
    ticketTiers: [
      {
        id: "regular",
        name: { en: "Regular", ar: "عادي" },
        price: 16,
        available: 100,
        total: 100,
      },
    ],
    featured: true,
    status: "upcoming",
  },
  {
    id: "3047",
    slug: "alli-soutak-bel-ghounna-session-2",
    title: {
      en: "Alli Soutak Bel Ghounna (Session 2)",
      ar: "\u0639\u0644\u064a \u0635\u0648\u062a\u0643 \u0628\u0627\u0644\u063a\u0646\u0627 (\u0623\u0645\u0633\u064a\u0629 \u062b\u0627\u0646\u064a\u0629)",
    },
    description: {
      en: "Interactive public singing circles where the audience joins professional musicians in community song.",
      ar: "\u062d\u0644\u0642\u0627\u062a \u063a\u0646\u0627\u0621 \u062c\u0645\u0627\u0639\u064a \u062a\u0641\u0627\u0639\u0644\u064a\u0629 \u0628\u0645\u0634\u0627\u0631\u0643\u0629 \u0627\u0644\u062c\u0645\u0647\u0648\u0631\u060c \u0645\u0646 \u0625\u0646\u062a\u0627\u062c \u063a\u0633\u0627\u0646 \u0628\u064a\u0631\u0648\u0645\u064a \u0648\u062f. \u0641\u0627\u062f\u064a \u062f\u064a\u0628.",
    },
    category: "food",
    images: [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=600&fit=crop",
    ],
    date: "2026-01-15",
    time: "20:00",
    venue: {
      name: { en: "Al Yakhour Hostel", ar: "\u0627\u0644\u064a\u0627\u062e\u0648\u0631" },
      address: { en: "Al Yakhour Hostel", ar: "\u0627\u0644\u064a\u0627\u062e\u0648\u0631" },
      city: { en: "Haifa", ar: "\u062d\u064a\u0641\u0627" },
    },
    organizer: {
      name: { en: "PalTicket", ar: "PalTicket" },
    },
    ticketTiers: [
      {
        id: "regular",
        name: { en: "Regular", ar: "عادي" },
        price: 28,
        available: 100,
        total: 100,
      },
    ],
    featured: false,
    status: "upcoming",
  },
  {
    id: "3057",
    slug: "studio-el-teneen-stand-up-interactive-comedy",
    title: {
      en: "Studio El Teneen | Stand-Up & Interactive Comedy",
      ar: "\u0633\u062a\u0648\u062f\u064a\u0648 \u0627\u0644\u062a\u0646\u064a\u0646 | \u0633\u062a\u0627\u0646\u062f \u0623\u0628 \u0643\u0648\u0645\u064a\u062f\u064a \u062a\u0641\u0627\u0639\u0644\u064a",
    },
    description: {
      en: "A high-energy night featuring Egyptian comedians Ahmed Magdy and Ahmed Hassan, blending stand-up with crowd interaction.",
      ar: "\u0644\u064a\u0644\u0629 \u0643\u0648\u0645\u064a\u062f\u064a\u0629 \u062a\u062c\u0645\u0639 \u0623\u062d\u0645\u062f \u0645\u062c\u062f\u064a \u0648\u0623\u062d\u0645\u062f \u062d\u0633\u0646\u060c \u062a\u0645\u0632\u062c \u0628\u064a\u0646 \u0627\u0644\u0633\u062a\u0627\u0646\u062f \u0623\u0628 \u0648\u0627\u0644\u0627\u0631\u062a\u062c\u0627\u0644 \u0645\u0639 \u0627\u0644\u062c\u0645\u0647\u0648\u0631.",
    },
    category: "business",
    images: [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=600&fit=crop",
    ],
    date: "2026-01-16",
    time: "20:00",
    venue: {
      name: { en: "Shams Theatre", ar: "\u0645\u0633\u0631\u062d \u0634\u0645\u0633" },
      address: { en: "Shams Theatre", ar: "\u0645\u0633\u0631\u062d \u0634\u0645\u0633" },
      city: { en: "Amman", ar: "\u0639\u0645\u0627\u0646" },
    },
    organizer: {
      name: { en: "PalTicket", ar: "PalTicket" },
    },
    ticketTiers: [
      {
        id: "regular",
        name: { en: "Regular", ar: "عادي" },
        price: 21,
        available: 100,
        total: 100,
      },
    ],
    featured: false,
    status: "upcoming",
  },
  {
    id: "2937",
    slug: "the-pub-is-tired-al-hana-ta-bana",
    title: {
      en: "The Pub is Tired (Al-Hana Ta'bana)",
      ar: "\u0627\u0644\u062d\u0627\u0646\u0629 \u062a\u0639\u0628\u0627\u0646\u0629",
    },
    description: {
      en: "A satirical theatrical production by Station 57 Theatre, following the humorous stories of four actors inside a pub.",
      ar: "\u0639\u0631\u0636 \u0645\u0633\u0631\u062d\u064a \u0633\u0627\u062e\u0631 \u0645\u0646 \u0625\u0646\u062a\u0627\u062c \u0645\u0633\u0631\u062d \u0627\u0644\u0645\u062d\u0637\u0629 57\u060c \u064a\u062a\u0646\u0627\u0648\u0644 \u0642\u0635\u0635 \u0623\u0631\u0628\u0639\u0629 \u0645\u0645\u062b\u0644\u064a\u0646 \u062f\u0627\u062e\u0644 \u062d\u0627\u0646\u0629 \u0641\u064a \u0642\u0627\u0644\u0628 \u0641\u0643\u0627\u0647\u064a.",
    },
    category: "family",
    images: [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=600&fit=crop",
    ],
    date: "2026-01-16",
    time: "20:00",
    venue: {
      name: { en: "Babu Bar", ar: "\u0628\u0627\u0628\u0648 \u0628\u0627\u0631" },
      address: { en: "Babu Bar", ar: "\u0628\u0627\u0628\u0648 \u0628\u0627\u0631" },
      city: { en: "Tel Aviv", ar: "\u062a\u0644 \u0623\u0628\u064a\u0628" },
    },
    organizer: {
      name: { en: "PalTicket", ar: "PalTicket" },
    },
    ticketTiers: [
      {
        id: "regular",
        name: { en: "Regular", ar: "عادي" },
        price: 47,
        available: 100,
        total: 100,
      },
    ],
    featured: false,
    status: "upcoming",
  },
  {
    id: "3036",
    slug: "saltana",
    title: {
      en: "Saltana",
      ar: "\u0633\u0644\u0637\u0627\u0646\u0629 (Sultana)",
    },
    description: {
      en: "A Tarab musical evening dedicated to the legendary songs of George Wassouf.",
      ar: "\u0623\u0645\u0633\u064a\u0629 \u0637\u0631\u0628\u064a\u0629 \u0645\u0647\u062f\u0627\u0629 \u0644\u0623\u063a\u0627\u0646\u064a \u0627\u0644\u0641\u0646\u0627\u0646 \u062c\u0648\u0631\u062c \u0648\u0633\u0648\u0641\u060c \u062a\u0639\u064a\u062f \u0625\u062d\u064a\u0627\u0621 \u0630\u0643\u0631\u064a\u0627\u062a \u0648\u0623\u0644\u062d\u0627\u0646 \u0639\u0627\u0634\u062a \u0645\u0639 \u0627\u0644\u0623\u062c\u064a\u0627\u0644.",
    },
    category: "nightlife",
    images: [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=600&fit=crop",
    ],
    date: "2026-01-16",
    time: "20:00",
    venue: {
      name: { en: "Krieger Hall", ar: "\u0642\u0627\u0639\u0629 \u0643\u0631\u064a\u062c\u0631" },
      address: { en: "Krieger Hall", ar: "\u0642\u0627\u0639\u0629 \u0643\u0631\u064a\u062c\u0631" },
      city: { en: "Haifa", ar: "\u062d\u064a\u0641\u0627" },
    },
    organizer: {
      name: { en: "PalTicket", ar: "PalTicket" },
    },
    ticketTiers: [
      {
        id: "regular",
        name: { en: "Regular", ar: "عادي" },
        price: 31,
        available: 100,
        total: 100,
      },
    ],
    featured: false,
    status: "upcoming",
  },
  {
    id: "3054",
    slug: "tamer-nafar",
    title: {
      en: "Tamer Nafar",
      ar: "\u062a\u0627\u0645\u0631 \u0646\u0641\u0627\u0631",
    },
    description: {
      en: "A musical evening with Tamer Nafar including a bazaar supporting youth initiatives and projects.",
      ar: "\u0623\u0645\u0633\u064a\u0629 \u0645\u0648\u0633\u064a\u0642\u064a\u0629 \u0648\u0641\u0646\u064a\u0629 \u062a\u062c\u0645\u0639 \u0628\u064a\u0646 \u0639\u0631\u0636 \u062a\u0627\u0645\u0631 \u0646\u0641\u0627\u0631 \u0648\u0628\u0627\u0632\u0627\u0631 \u0644\u062f\u0639\u0645 \u0627\u0644\u0645\u0628\u0627\u062f\u0631\u0627\u062a \u0627\u0644\u0634\u0628\u0627\u0628\u064a\u0629.",
    },
    category: "comedy",
    images: [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=600&fit=crop",
    ],
    date: "2026-01-17",
    time: "20:00",
    venue: {
      name: { en: "Cinemana Nazareth", ar: "\u0645\u0633\u0631\u062d \u0633\u064a\u0646\u0645\u0627\u0646\u0627" },
      address: { en: "Cinemana Nazareth", ar: "\u0645\u0633\u0631\u062d \u0633\u064a\u0646\u0645\u0627\u0646\u0627" },
      city: { en: "Nazareth", ar: "\u0627\u0644\u0646\u0627\u0635\u0631\u0629" },
    },
    organizer: {
      name: { en: "PalTicket", ar: "PalTicket" },
    },
    ticketTiers: [
      {
        id: "regular",
        name: { en: "Regular", ar: "عادي" },
        price: 31,
        available: 100,
        total: 100,
      },
    ],
    featured: false,
    status: "upcoming",
  },
  {
    id: "3068",
    slug: "open-mic",
    title: {
      en: "Open Mic",
      ar: "\u0623\u0648\u0628\u0646 \u0645\u0627\u064a\u0643 (Open Mic)",
    },
    description: {
      en: "A cozy night for Arab comedians and first-timers to perform stand-up comedy in Arabic.",
      ar: "\u0645\u0633\u0627\u062d\u0629 \u0644\u0644\u0643\u0648\u0645\u064a\u062f\u064a\u064a\u0646 \u0627\u0644\u0639\u0631\u0628 (\u0627\u0644\u0645\u062d\u062a\u0631\u0641\u064a\u0646 \u0648\u0627\u0644\u0645\u0628\u062a\u062f\u0626\u064a\u0646) \u0644\u0645\u0634\u0627\u0631\u0643\u0629 \u0646\u0643\u0627\u062a\u0647\u0645 \u0648\u0642\u0635\u0635\u0647\u0645 \u0627\u0644\u0648\u0627\u0642\u0639\u064a\u0629 \u0628\u0627\u0644\u0644\u063a\u0629 \u0627\u0644\u0639\u0631\u0628\u064a\u0629.",
    },
    category: "festivals",
    images: [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=600&fit=crop",
    ],
    date: "2026-01-17",
    time: "20:00",
    venue: {
      name: { en: "Bar Bario", ar: "\u0628\u0627\u0631 \u0628\u0627\u0631\u064a\u0648" },
      address: { en: "Bar Bario", ar: "\u0628\u0627\u0631 \u0628\u0627\u0631\u064a\u0648" },
      city: { en: "Amsterdam", ar: "\u0623\u0645\u0633\u062a\u0631\u062f\u0627\u0645" },
    },
    organizer: {
      name: { en: "PalTicket", ar: "PalTicket" },
    },
    ticketTiers: [
      {
        id: "regular",
        name: { en: "Regular", ar: "عادي" },
        price: 50,
        available: 100,
        total: 100,
      },
    ],
    featured: false,
    status: "upcoming",
  },
  {
    id: "3062",
    slug: "fahmenha-ghalat-in-haifa",
    title: {
      en: "Fahmenha Ghalat in Haifa",
      ar: "\u0641\u0627\u0647\u0645\u064a\u0646\u0647\u0627 \u063a\u0644\u0637 \u0641\u064a \u062d\u064a\u0641\u0627",
    },
    description: {
      en: "A new stand-up comedy show by Nidal Badarny exploring the search for happiness.",
      ar: "\u0639\u0631\u0636 \u0633\u062a\u0627\u0646\u062f \u0623\u0628 \u0643\u0648\u0645\u064a\u062f\u064a \u062c\u062f\u064a\u062f \u0644\u0646\u0636\u0627\u0644 \u0628\u062f\u0627\u0631\u0646\u0629 \u064a\u0628\u062d\u062b \u0641\u064a\u0647 \u0639\u0646 \u0633\u0631 \u0627\u0644\u0633\u0639\u0627\u062f\u0629 \u0641\u064a \u0628\u0644\u0627\u062f \u062a\u0641\u062a\u0642\u062f\u0647\u0627.",
    },
    category: "workshops",
    images: [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=600&fit=crop",
    ],
    date: "2026-01-17",
    time: "20:00",
    venue: {
      name: { en: "Krieger Hall", ar: "\u0642\u0627\u0639\u0629 \u0643\u0631\u064a\u062c\u0631" },
      address: { en: "Krieger Hall", ar: "\u0642\u0627\u0639\u0629 \u0643\u0631\u064a\u062c\u0631" },
      city: { en: "Haifa", ar: "\u062d\u064a\u0641\u0627" },
    },
    organizer: {
      name: { en: "PalTicket", ar: "PalTicket" },
    },
    ticketTiers: [
      {
        id: "regular",
        name: { en: "Regular", ar: "عادي" },
        price: 31,
        available: 100,
        total: 100,
      },
    ],
    featured: false,
    status: "upcoming",
  },
  {
    id: "3080",
    slug: "tell-al-lawz-operetta",
    title: {
      en: "Tell al-Lawz Operetta",
      ar: "\u0623\u0648\u0628\u0631\u064a\u062a \u062a\u0644 \u0627\u0644\u0644\u0648\u0632",
    },
    description: {
      en: "A traditional artistic performance depicting folklore through a musical operetta.",
      ar: "\u0639\u0631\u0636 \u0641\u0646\u064a \u062a\u0631\u0627\u062b\u064a \u064a\u062c\u0633\u062f \u062d\u0643\u0627\u064a\u0627\u062a \u0634\u0639\u0628\u064a\u0629 \u0628\u0623\u0633\u0644\u0648\u0628 \u0627\u0644\u0623\u0648\u0628\u0631\u064a\u062a \u0627\u0644\u0645\u0648\u0633\u064a\u0642\u064a.",
    },
    category: "music",
    images: [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=600&fit=crop",
    ],
    date: "2026-01-22",
    time: "20:00",
    venue: {
      name: { en: "Nasraoui Cultural Palace", ar: "\u0642\u0635\u0631 \u0627\u0644\u062b\u0642\u0627\u0641\u0629 \u0627\u0644\u0646\u0635\u0631\u0627\u0648\u064a" },
      address: { en: "Nasraoui Cultural Palace", ar: "\u0642\u0635\u0631 \u0627\u0644\u062b\u0642\u0627\u0641\u0629 \u0627\u0644\u0646\u0635\u0631\u0627\u0648\u064a" },
      city: { en: "Nazareth", ar: "\u0627\u0644\u0646\u0627\u0635\u0631\u0629" },
    },
    organizer: {
      name: { en: "PalTicket", ar: "PalTicket" },
    },
    ticketTiers: [
      {
        id: "regular",
        name: { en: "Regular", ar: "عادي" },
        price: 31,
        available: 100,
        total: 100,
      },
    ],
    featured: false,
    status: "upcoming",
  },
  {
    id: "2968",
    slug: "japanese-foroshiki",
    title: {
      en: "Japanese Foroshiki",
      ar: "\u0641\u0648\u0631\u0648\u0634\u064a\u0643\u064a \u0627\u0644\u064a\u0627\u0628\u0627\u0646\u064a\u0629 (Japanese Foroshiki)",
    },
    description: {
      en: "An alternative art academy workshop focused on Japanese wrapping techniques.",
      ar: "\u0648\u0631\u0634\u0629 \u0639\u0645\u0644 \u0641\u0646\u064a\u0629 \u0645\u0646 \u062a\u0646\u0638\u064a\u0645 \u0623\u0643\u0627\u062f\u064a\u0645\u064a\u0629 \u0623\u0644\u062a\u0631\u0627 \u0644\u062a\u0639\u0644\u064a\u0645 \u0645\u0647\u0627\u0631\u0627\u062a \u0641\u0646\u064a\u0629 \u0628\u062f\u064a\u0644\u0629.",
    },
    category: "sports",
    images: [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=600&fit=crop",
    ],
    date: "2026-01-20",
    time: "20:00",
    venue: {
      name: { en: "The Special Reserve", ar: "The Special Reserve" },
      address: { en: "The Special Reserve", ar: "The Special Reserve" },
      city: { en: "Haifa", ar: "\u062d\u064a\u0641\u0627" },
    },
    organizer: {
      name: { en: "PalTicket", ar: "PalTicket" },
    },
    ticketTiers: [
      {
        id: "regular",
        name: { en: "Regular", ar: "عادي" },
        price: 69,
        available: 100,
        total: 100,
      },
    ],
    featured: false,
    status: "upcoming",
  },
];

// Helper to get event by slug
export function getEventBySlug(slug: string): Event | undefined {
  return mockEvents.find((event) => event.slug === slug);
}

// Helper to get featured events
export function getFeaturedEvents(): Event[] {
  return mockEvents.filter((event) => event.featured);
}

export function filterEvents(filters: EventFilters): Event[] {
  return mockEvents.filter((event) => {
    if (filters.category && event.category !== filters.category) return false;
    if (filters.city && event.venue.city.en.toLowerCase() !== filters.city.toLowerCase()) return false;
    if (filters.dateFrom && event.date < filters.dateFrom) return false;
    if (filters.dateTo && event.date > filters.dateTo) return false;
    if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
      const minPrice = Math.min(...event.ticketTiers.map((t) => t.price));
      if (filters.priceMin !== undefined && minPrice < filters.priceMin) return false;
      if (filters.priceMax !== undefined && minPrice > filters.priceMax) return false;
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesTitle =
        event.title.en.toLowerCase().includes(searchLower) ||
        event.title.ar.includes(filters.search);
      const matchesVenue =
        event.venue.name.en.toLowerCase().includes(searchLower) ||
        event.venue.name.ar.includes(filters.search);
      if (!matchesTitle && !matchesVenue) return false;
    }
    return true;
  });
}

