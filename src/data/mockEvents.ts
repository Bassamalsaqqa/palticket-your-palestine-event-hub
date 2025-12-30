export interface TicketTier {
  id: string;
  name: {
    en: string;
    ar: string;
  };
  price: number;
  available: number;
  total: number;
  description?: {
    en: string;
    ar: string;
  };
}

export interface Event {
  id: string;
  slug: string;
  title: {
    en: string;
    ar: string;
  };
  description: {
    en: string;
    ar: string;
  };
  category: string;
  images: string[];
  date: string;
  time: string;
  endDate?: string;
  venue: {
    name: {
      en: string;
      ar: string;
    };
    address: {
      en: string;
      ar: string;
    };
    city: {
      en: string;
      ar: string;
    };
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  organizer: {
    name: {
      en: string;
      ar: string;
    };
    logo?: string;
  };
  ticketTiers: TicketTier[];
  featured: boolean;
  status: "upcoming" | "ongoing" | "past" | "cancelled";
}

export interface Category {
  id: string;
  name: {
    en: string;
    ar: string;
  };
  icon: string;
  color: string;
}

export interface City {
  id: string;
  name: {
    en: string;
    ar: string;
  };
}

export const cities: City[] = [
  { id: "ramallah", name: { en: "Ramallah", ar: "رام الله" } },
  { id: "jerusalem", name: { en: "Jerusalem", ar: "القدس" } },
  { id: "bethlehem", name: { en: "Bethlehem", ar: "بيت لحم" } },
  { id: "nablus", name: { en: "Nablus", ar: "نابلس" } },
  { id: "hebron", name: { en: "Hebron", ar: "الخليل" } },
  { id: "jericho", name: { en: "Jericho", ar: "أريحا" } },
  { id: "gaza", name: { en: "Gaza", ar: "غزة" } },
  { id: "jenin", name: { en: "Jenin", ar: "جنين" } },
];

export const categories: Category[] = [
  { id: "music", name: { en: "Music", ar: "موسيقى" }, icon: "Music", color: "hsl(var(--primary))" },
  { id: "sports", name: { en: "Sports", ar: "رياضة" }, icon: "Trophy", color: "hsl(var(--accent))" },
  { id: "arts", name: { en: "Arts & Culture", ar: "فنون وثقافة" }, icon: "Palette", color: "hsl(var(--gold))" },
  { id: "food", name: { en: "Food & Drink", ar: "طعام ومشروبات" }, icon: "UtensilsCrossed", color: "hsl(20, 60%, 50%)" },
  { id: "business", name: { en: "Business", ar: "أعمال" }, icon: "Briefcase", color: "hsl(200, 50%, 45%)" },
  { id: "family", name: { en: "Family", ar: "عائلي" }, icon: "Users", color: "hsl(145, 60%, 40%)" },
  { id: "nightlife", name: { en: "Nightlife", ar: "سهرات" }, icon: "Moon", color: "hsl(270, 50%, 50%)" },
  { id: "comedy", name: { en: "Comedy", ar: "كوميديا" }, icon: "Laugh", color: "hsl(45, 90%, 50%)" },
  { id: "festivals", name: { en: "Festivals", ar: "مهرجانات" }, icon: "PartyPopper", color: "hsl(330, 70%, 55%)" },
  { id: "workshops", name: { en: "Workshops", ar: "ورش عمل" }, icon: "GraduationCap", color: "hsl(180, 50%, 45%)" },
];

export const mockEvents: Event[] = [
  {
    id: "1",
    slug: "mahmoud-darwish-poetry-night",
    title: {
      en: "Mahmoud Darwish Poetry Night",
      ar: "ليلة شعر محمود درويش",
    },
    description: {
      en: "An enchanting evening celebrating the timeless poetry of Mahmoud Darwish. Join us for readings, musical performances, and artistic interpretations of his most beloved works. Experience the power of Palestinian literature in an intimate setting.",
      ar: "أمسية ساحرة للاحتفاء بشعر محمود درويش الخالد. انضموا إلينا لقراءات شعرية وعروض موسيقية وتفسيرات فنية لأشهر أعماله. استمتعوا بقوة الأدب الفلسطيني في أجواء حميمة.",
    },
    category: "arts",
    images: [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=600&fit=crop",
    ],
    date: "2025-02-14",
    time: "19:00",
    venue: {
      name: { en: "Ramallah Cultural Palace", ar: "قصر رام الله الثقافي" },
      address: { en: "Al-Irsal Street", ar: "شارع الإرسال" },
      city: { en: "Ramallah", ar: "رام الله" },
      coordinates: { lat: 31.9038, lng: 35.2034 },
    },
    organizer: {
      name: { en: "Palestinian Cultural Foundation", ar: "مؤسسة الثقافة الفلسطينية" },
    },
    ticketTiers: [
      {
        id: "vip",
        name: { en: "VIP", ar: "VIP" },
        price: 150,
        available: 20,
        total: 50,
        description: { en: "Front row seating, meet & greet", ar: "مقاعد الصف الأمامي، لقاء مع الفنانين" },
      },
      {
        id: "regular",
        name: { en: "Regular", ar: "عادي" },
        price: 75,
        available: 150,
        total: 200,
      },
      {
        id: "early-bird",
        name: { en: "Early Bird", ar: "حجز مبكر" },
        price: 50,
        available: 0,
        total: 100,
      },
    ],
    featured: true,
    status: "upcoming",
  },
  {
    id: "2",
    slug: "palestinian-food-festival",
    title: {
      en: "Palestinian Food Festival 2025",
      ar: "مهرجان الطعام الفلسطيني 2025",
    },
    description: {
      en: "Taste the rich flavors of Palestine at our annual food festival! From traditional maqluba to modern fusion dishes, experience the best of Palestinian cuisine. Featuring over 30 local vendors, cooking demonstrations, and live music.",
      ar: "تذوقوا نكهات فلسطين الغنية في مهرجاننا السنوي للطعام! من المقلوبة التقليدية إلى أطباق الفيوجن الحديثة، استمتعوا بأفضل المأكولات الفلسطينية. أكثر من 30 بائعاً محلياً، عروض طهي، وموسيقى حية.",
    },
    category: "food",
    images: [
      "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&h=600&fit=crop",
    ],
    date: "2025-03-21",
    time: "11:00",
    endDate: "2025-03-23",
    venue: {
      name: { en: "Manger Square", ar: "ساحة المهد" },
      address: { en: "Manger Square", ar: "ساحة المهد" },
      city: { en: "Bethlehem", ar: "بيت لحم" },
      coordinates: { lat: 31.7044, lng: 35.2076 },
    },
    organizer: {
      name: { en: "Bethlehem Municipality", ar: "بلدية بيت لحم" },
    },
    ticketTiers: [
      {
        id: "day-pass",
        name: { en: "Day Pass", ar: "تذكرة يوم" },
        price: 25,
        available: 500,
        total: 1000,
      },
      {
        id: "weekend-pass",
        name: { en: "Weekend Pass", ar: "تذكرة نهاية الأسبوع" },
        price: 60,
        available: 200,
        total: 300,
      },
    ],
    featured: true,
    status: "upcoming",
  },
  {
    id: "3",
    slug: "dabke-championship",
    title: {
      en: "National Dabke Championship",
      ar: "بطولة الدبكة الوطنية",
    },
    description: {
      en: "Watch the best dabke troupes from across Palestine compete in this electrifying championship! Traditional and modern styles come together in a celebration of Palestinian dance heritage.",
      ar: "شاهدوا أفضل فرق الدبكة من أنحاء فلسطين تتنافس في هذه البطولة المثيرة! تجتمع الأساليب التقليدية والحديثة في احتفال بتراث الرقص الفلسطيني.",
    },
    category: "arts",
    images: [
      "https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop",
    ],
    date: "2025-04-05",
    time: "17:00",
    venue: {
      name: { en: "Nablus Sports Stadium", ar: "استاد نابلس الرياضي" },
      address: { en: "Stadium Road", ar: "شارع الملعب" },
      city: { en: "Nablus", ar: "نابلس" },
      coordinates: { lat: 32.2211, lng: 35.2544 },
    },
    organizer: {
      name: { en: "Palestinian Dance Federation", ar: "اتحاد الرقص الفلسطيني" },
    },
    ticketTiers: [
      {
        id: "vip",
        name: { en: "VIP Box", ar: "مقصورة VIP" },
        price: 200,
        available: 30,
        total: 50,
      },
      {
        id: "premium",
        name: { en: "Premium", ar: "مميز" },
        price: 100,
        available: 100,
        total: 150,
      },
      {
        id: "regular",
        name: { en: "Regular", ar: "عادي" },
        price: 40,
        available: 400,
        total: 500,
      },
    ],
    featured: true,
    status: "upcoming",
  },
  {
    id: "4",
    slug: "tech-startup-summit",
    title: {
      en: "Palestine Tech Startup Summit",
      ar: "قمة الشركات الناشئة التقنية في فلسطين",
    },
    description: {
      en: "Connect with the brightest minds in Palestinian tech! Hear from successful founders, meet investors, and discover the latest innovations emerging from the Palestinian startup ecosystem.",
      ar: "تواصلوا مع ألمع العقول في التكنولوجيا الفلسطينية! استمعوا لمؤسسين ناجحين، التقوا بالمستثمرين، واكتشفوا أحدث الابتكارات من منظومة الشركات الناشئة الفلسطينية.",
    },
    category: "business",
    images: [
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&h=600&fit=crop",
    ],
    date: "2025-05-15",
    time: "09:00",
    venue: {
      name: { en: "ASAL Technologies HQ", ar: "مقر شركة أسال للتكنولوجيا" },
      address: { en: "Al-Irsal Street", ar: "شارع الإرسال" },
      city: { en: "Ramallah", ar: "رام الله" },
    },
    organizer: {
      name: { en: "Palestine Tech Hub", ar: "مركز فلسطين التقني" },
    },
    ticketTiers: [
      {
        id: "investor",
        name: { en: "Investor Pass", ar: "تذكرة مستثمر" },
        price: 500,
        available: 20,
        total: 30,
      },
      {
        id: "startup",
        name: { en: "Startup Pass", ar: "تذكرة شركة ناشئة" },
        price: 150,
        available: 80,
        total: 100,
      },
      {
        id: "general",
        name: { en: "General Admission", ar: "دخول عام" },
        price: 75,
        available: 200,
        total: 300,
      },
    ],
    featured: false,
    status: "upcoming",
  },
  {
    id: "5",
    slug: "jerusalem-night-run",
    title: {
      en: "Jerusalem Night Run 10K",
      ar: "سباق القدس الليلي 10 كم",
    },
    description: {
      en: "Run through the historic streets of Jerusalem under the stars! This unique night run takes you past iconic landmarks in a magical after-dark experience.",
      ar: "اركضوا عبر شوارع القدس التاريخية تحت النجوم! هذا السباق الليلي الفريد يأخذكم عبر معالم أيقونية في تجربة سحرية بعد حلول الظلام.",
    },
    category: "sports",
    images: [
      "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1461896836934- voices?w=800&h=600&fit=crop",
    ],
    date: "2025-06-20",
    time: "21:00",
    venue: {
      name: { en: "Damascus Gate", ar: "باب العامود" },
      address: { en: "Old City", ar: "البلدة القديمة" },
      city: { en: "Jerusalem", ar: "القدس" },
      coordinates: { lat: 31.7839, lng: 35.2295 },
    },
    organizer: {
      name: { en: "Jerusalem Running Club", ar: "نادي القدس للجري" },
    },
    ticketTiers: [
      {
        id: "runner",
        name: { en: "Runner Registration", ar: "تسجيل متسابق" },
        price: 80,
        available: 300,
        total: 500,
        description: { en: "Includes race kit and medal", ar: "يشمل طقم السباق والميدالية" },
      },
    ],
    featured: true,
    status: "upcoming",
  },
  {
    id: "6",
    slug: "olive-harvest-festival",
    title: {
      en: "Olive Harvest Festival",
      ar: "مهرجان قطف الزيتون",
    },
    description: {
      en: "Celebrate the ancient Palestinian tradition of olive harvesting! Join families in the groves, learn traditional pressing methods, and enjoy fresh olive oil tastings.",
      ar: "احتفلوا بالتقليد الفلسطيني العريق لقطف الزيتون! انضموا للعائلات في البساتين، تعلموا طرق العصر التقليدية، وتذوقوا زيت الزيتون الطازج.",
    },
    category: "festivals",
    images: [
      "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1515586000433-45406d8e6662?w=800&h=600&fit=crop",
    ],
    date: "2025-10-18",
    time: "08:00",
    endDate: "2025-10-19",
    venue: {
      name: { en: "Jenin Olive Groves", ar: "بساتين زيتون جنين" },
      address: { en: "Jenin Countryside", ar: "ريف جنين" },
      city: { en: "Jenin", ar: "جنين" },
    },
    organizer: {
      name: { en: "Jenin Agricultural Cooperative", ar: "تعاونية جنين الزراعية" },
    },
    ticketTiers: [
      {
        id: "family",
        name: { en: "Family Pass (4)", ar: "تذكرة عائلية (4 أشخاص)" },
        price: 100,
        available: 75,
        total: 100,
      },
      {
        id: "individual",
        name: { en: "Individual", ar: "فردي" },
        price: 35,
        available: 200,
        total: 300,
      },
    ],
    featured: false,
    status: "upcoming",
  },
  {
    id: "7",
    slug: "comedy-night-ramallah",
    title: {
      en: "Stand-Up Comedy Night",
      ar: "ليلة الكوميديا المسرحية",
    },
    description: {
      en: "Get ready to laugh! The best Palestinian comedians gather for a night of hilarious stand-up. From social commentary to everyday observations, prepare for non-stop entertainment.",
      ar: "استعدوا للضحك! يجتمع أفضل الكوميديين الفلسطينيين لليلة من العروض الكوميدية المرحة. من التعليق الاجتماعي إلى الملاحظات اليومية، استعدوا للترفيه المتواصل.",
    },
    category: "comedy",
    images: [
      "https://images.unsplash.com/photo-1527224538127-2104bb71c51b?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=800&h=600&fit=crop",
    ],
    date: "2025-02-28",
    time: "20:30",
    venue: {
      name: { en: "Al-Kasaba Theatre", ar: "مسرح القصبة" },
      address: { en: "Al-Nahda Street", ar: "شارع النهضة" },
      city: { en: "Ramallah", ar: "رام الله" },
    },
    organizer: {
      name: { en: "Laugh Palestine", ar: "اضحك فلسطين" },
    },
    ticketTiers: [
      {
        id: "front-row",
        name: { en: "Front Row", ar: "الصف الأمامي" },
        price: 120,
        available: 15,
        total: 20,
      },
      {
        id: "regular",
        name: { en: "Regular", ar: "عادي" },
        price: 60,
        available: 100,
        total: 150,
      },
    ],
    featured: false,
    status: "upcoming",
  },
  {
    id: "8",
    slug: "kids-science-fair",
    title: {
      en: "Kids Science Fair",
      ar: "معرض العلوم للأطفال",
    },
    description: {
      en: "Spark curiosity in young minds! Interactive science exhibits, hands-on experiments, and fun activities for children ages 5-14. A perfect family outing!",
      ar: "أشعلوا الفضول في عقول الصغار! معروضات علمية تفاعلية، تجارب عملية، وأنشطة ممتعة للأطفال من 5 إلى 14 سنة. نزهة عائلية مثالية!",
    },
    category: "family",
    images: [
      "https://images.unsplash.com/photo-1567057419565-4349c49d8a04?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1564429238980-16b1899c72f1?w=800&h=600&fit=crop",
    ],
    date: "2025-04-12",
    time: "10:00",
    venue: {
      name: { en: "Hebron Science Center", ar: "مركز الخليل للعلوم" },
      address: { en: "University Road", ar: "شارع الجامعة" },
      city: { en: "Hebron", ar: "الخليل" },
    },
    organizer: {
      name: { en: "Palestine Science Foundation", ar: "مؤسسة فلسطين للعلوم" },
    },
    ticketTiers: [
      {
        id: "child",
        name: { en: "Child (5-14)", ar: "طفل (5-14)" },
        price: 20,
        available: 200,
        total: 250,
      },
      {
        id: "adult",
        name: { en: "Adult", ar: "بالغ" },
        price: 10,
        available: 150,
        total: 200,
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

// Helper to filter events
export interface EventFilters {
  category?: string;
  city?: string;
  dateFrom?: string;
  dateTo?: string;
  priceMin?: number;
  priceMax?: number;
  search?: string;
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
