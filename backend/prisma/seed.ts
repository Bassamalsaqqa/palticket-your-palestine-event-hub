import { PrismaClient, OrganizationRole, EventStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const ORG_NAME = 'PalTicket Demo';
const ORG_SLUG = 'palticket-demo';
const ADMIN_EMAIL = 'admin@palticket.com';
const ADMIN_PASSWORD = 'password';

const DEMO_EVENTS = [
  {
    id: 'demo-1',
    titleEn: 'Mahmoud Darwish Poetry Night',
    titleAr: 'ليلة شعر محمود درويش',
    date: '2025-02-14T19:00:00Z',
    venueName: 'Ramallah Cultural Palace',
    cityNameEn: 'Ramallah',
    cityNameAr: 'رام الله',
    descriptionEn: 'An evening dedicated to the works of the great Mahmoud Darwish.',
    descriptionAr: 'أمسية مخصصة لأعمال الشاعر محمود درويش.',
    price: 'ILS 75',
  },
  {
    id: 'demo-2',
    titleEn: 'Palestinian Food Festival 2025',
    titleAr: 'مهرجان الطعام الفلسطيني 2025',
    date: '2025-03-21T11:00:00Z',
    venueName: 'Manger Square',
    cityNameEn: 'Bethlehem',
    cityNameAr: 'بيت لحم',
    descriptionEn: 'Taste the best of traditional Palestinian cuisine.',
    descriptionAr: 'تذوّق أفضل المأكولات الفلسطينية التقليدية.',
    price: 'ILS 60',
  },
  {
    id: 'demo-3',
    titleEn: 'Gaza Tech Conference',
    titleAr: 'مؤتمر غزة للتقنية',
    date: '2025-04-10T09:00:00Z',
    venueName: 'Gaza Convention Center',
    cityNameEn: 'Gaza',
    cityNameAr: 'غزة',
    descriptionEn: 'The leading tech event in the region.',
    descriptionAr: 'الحدث التقني الأبرز في المنطقة.',
    price: 'USD 25',
  },
  {
    id: 'demo-4',
    titleEn: 'Jericho Heritage Walk',
    titleAr: 'جولة تراثية في أريحا',
    date: '2025-05-05T08:00:00Z',
    venueName: 'Old City Center',
    cityNameEn: 'Jericho',
    cityNameAr: 'أريحا',
    descriptionEn: 'Explore the oldest city in the world.',
    descriptionAr: 'اكتشف أقدم مدينة في العالم.',
    price: 'ILS 40',
  },
  {
    id: 'demo-5',
    titleEn: 'Nablus Music & Arts',
    titleAr: 'نابلس للموسيقى والفنون',
    date: '2025-06-15T18:00:00Z',
    venueName: 'Al-Najah University Hall',
    cityNameEn: 'Nablus',
    cityNameAr: 'نابلس',
    descriptionEn: 'A celebration of local music and art.',
    descriptionAr: 'احتفال بالموسيقى والفن المحلي.',
    price: 'ILS 50',
  },
  {
    id: 'demo-6',
    titleEn: 'Hebron Glass Workshop',
    titleAr: 'ورشة زجاج الخليل',
    date: '2025-07-20T10:00:00Z',
    venueName: 'Traditional Glass Factory',
    cityNameEn: 'Hebron',
    cityNameAr: 'الخليل',
    descriptionEn: 'Learn the ancient art of glass blowing.',
    descriptionAr: 'تعلّم فن نفخ الزجاج التقليدي.',
    price: 'ILS 100',
  },
];

const slugify = (value: string) => {
  return value
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/(^-|-$)+/g, '');
};

const parsePrice = (price: string) => {
  const currencyMatch = price.match(/^(ILS|USD|EUR)\s*([0-9]+(?:\.[0-9]+)?)/i);
  const numberMatch = price.match(/([0-9]+(?:\.[0-9]+)?)/);
  const amount = currencyMatch ? Number(currencyMatch[2]) : numberMatch ? Number(numberMatch[1]) : 0;
  const currency = currencyMatch ? currencyMatch[1].toUpperCase() : 'USD';
  return { currency, cents: Math.round(amount * 100) };
};

const run = async () => {
  console.log('Seeding database...');

  const organization = await prisma.organization.upsert({
    where: { slug: ORG_SLUG },
    update: { name: ORG_NAME },
    create: { name: ORG_NAME, slug: ORG_SLUG },
  });

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  const user = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {},
    create: {
      email: ADMIN_EMAIL,
      passwordHash,
      name: 'Admin',
    },
  });

  await prisma.organizationMember.upsert({
    where: {
      organizationId_userId: {
        organizationId: organization.id,
        userId: user.id,
      },
    },
    update: { role: OrganizationRole.ADMIN },
    create: {
      organizationId: organization.id,
      userId: user.id,
      role: OrganizationRole.ADMIN,
    },
  });

  const venueCache = new Map<string, string>();

  for (const event of DEMO_EVENTS) {
    const citySlug = slugify(event.cityNameEn);

    let city = await prisma.city.findFirst({
      where: { organizationId: null, slug: citySlug },
      select: { id: true },
    });

    if (!city) {
      city = await prisma.city.create({
        data: {
          slug: citySlug,
          isGlobal: true,
        },
        select: { id: true },
      });
    } else {
      await prisma.city.update({
        where: { id: city.id },
        data: { isGlobal: true },
      });
    }

    await prisma.cityTranslation.upsert({
      where: { cityId_locale: { cityId: city.id, locale: 'en' } },
      update: { name: event.cityNameEn },
      create: { cityId: city.id, locale: 'en', name: event.cityNameEn },
    });

    await prisma.cityTranslation.upsert({
      where: { cityId_locale: { cityId: city.id, locale: 'ar' } },
      update: { name: event.cityNameAr },
      create: { cityId: city.id, locale: 'ar', name: event.cityNameAr },
    });

    const venueKey = `${event.venueName}::${event.cityNameEn}`;
    let venueId = venueCache.get(venueKey);
    if (!venueId) {
      const existingVenue = await prisma.venue.findFirst({
        where: {
          organizationId: organization.id,
          translations: {
            some: {
              locale: 'en',
              name: event.venueName,
            },
          },
        },
        select: { id: true },
      });

      if (existingVenue) {
        venueId = existingVenue.id;
      } else {
        const venue = await prisma.venue.create({
          data: {
            organizationId: organization.id,
            translations: {
              create: [
                {
                  locale: 'en',
                  name: event.venueName,
                  address: `${event.venueName}, ${event.cityNameEn}`,
                  city: event.cityNameEn,
                },
                {
                  locale: 'ar',
                  name: event.venueName,
                  address: `${event.venueName}, ${event.cityNameAr}`,
                  city: event.cityNameAr,
                },
              ],
            },
          },
          select: { id: true },
        });
        venueId = venue.id;
      }
      venueCache.set(venueKey, venueId);
    }

    const uniqueSlug = slugify(event.titleEn);

    const eventRecord = await prisma.event.upsert({
      where: {
        organizationId_slug: {
          organizationId: organization.id,
          slug: uniqueSlug,
        },
      },
      update: {
        venueId,
        cityId: city.id,
        startTime: new Date(event.date),
        status: EventStatus.PUBLISHED,
      },
      create: {
        organizationId: organization.id,
        venueId,
        cityId: city.id,
        slug: uniqueSlug,
        startTime: new Date(event.date),
        status: EventStatus.PUBLISHED,
      },
      select: { id: true },
    });

    await prisma.eventTranslation.upsert({
      where: { eventId_locale: { eventId: eventRecord.id, locale: 'en' } },
      update: {
        name: event.titleEn,
        description: event.descriptionEn,
        summary: event.descriptionEn,
      },
      create: {
        eventId: eventRecord.id,
        locale: 'en',
        name: event.titleEn,
        description: event.descriptionEn,
        summary: event.descriptionEn,
      },
    });

    await prisma.eventTranslation.upsert({
      where: { eventId_locale: { eventId: eventRecord.id, locale: 'ar' } },
      update: {
        name: event.titleAr,
        description: event.descriptionAr,
        summary: event.descriptionAr,
      },
      create: {
        eventId: eventRecord.id,
        locale: 'ar',
        name: event.titleAr,
        description: event.descriptionAr,
        summary: event.descriptionAr,
      },
    });

    const price = parsePrice(event.price);
    const existingTicket = await prisma.ticketType.findFirst({
      where: { eventId: eventRecord.id, name: 'General' },
      select: { id: true },
    });

    if (existingTicket) {
      await prisma.ticketType.update({
        where: { id: existingTicket.id },
        data: {
          sellPriceCents: price.cents,
          partnerPriceCents: price.cents,
          currency: price.currency,
        },
      });
    } else {
      await prisma.ticketType.create({
        data: {
          eventId: eventRecord.id,
          name: 'General',
          sellPriceCents: price.cents,
          partnerPriceCents: price.cents,
          currency: price.currency,
          quantity: 100,
        },
      });
    }
  }

  console.log('Seeding completed successfully.');
};

run()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
