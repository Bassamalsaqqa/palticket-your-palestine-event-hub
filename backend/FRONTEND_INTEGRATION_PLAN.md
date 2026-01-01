# Frontend Integration Plan: Localized Content

This document outlines how the PalTicket frontend service layer will map localized backend data to the existing UI models.

## 1. Data Mapping Strategy

The backend returns data filtered by the `?lang=` query parameter. The frontend `Service Layer` (e.g., `eventsService.ts`) will act as a translation adapter to maintain compatibility with the current `Event` and `MockOrder` interfaces.

### Event Mapping Reference

| Backend Field (per locale) | Frontend Interface Field | Mapping Logic |
| :--- | :--- | :--- |
| `translations[0].name` | `title` | `{ [lang]: val, [fallback]: val }` |
| `translations[0].description` | `description` | `{ [lang]: val, [fallback]: val }` |
| `slug` | `slug` | String slug (Unique per organization) |
| `category.slug` | `category` | String slug |
| `category.translations[0].name` | N/A | Used for display labels |
| `venue.translations[0].name` | `venue.name` | `{ [lang]: val, [fallback]: val }` |
| `venue.translations[0].address`| `venue.address` | `{ [lang]: val, [fallback]: val }` |

## 2. API Endpoints for UI

The frontend will use the following endpoints to fetch data:

*   **List Events**: `GET /events?lang={en|ar}`
*   **Get Event by ID**: `GET /events/{id}?lang={en|ar}`
*   **Get Event by Slug**: `GET /events/slug/{slug}?lang={en|ar}` (Primary for Event Detail pages)

## 3. Service Layer implementation (Pseudo-code)

The frontend `eventsService.ts` will be updated to pass the current language from `useLanguage` context (or a global state) to the API.

```typescript
// src/services/eventsService.ts

export const fetchEventBySlug = async (slug: string, lang: string): Promise<Event> => {
  const response = await api.get(`/events/slug/${slug}?lang=${lang}`);
  const data = response.data;

  // Map backend single-locale response to frontend { en, ar } dictionary
  return {
    ...data,
    title: {
      en: lang === 'en' ? data.translations[0]?.name : '',
      ar: lang === 'ar' ? data.translations[0]?.name : '',
    },
    // ... repeat for description, venue, etc.
    date: data.startTime.split('T')[0],
    time: data.startTime.split('T')[1].substring(0, 5),
  };
};
```

## 4. Fallback Behavior

When a translation is missing for the requested locale:

1.  **API Level**: The backend `findAll/findOne/findBySlug` returns an empty `translations` array if no match exists for the `lang` param.
2.  **Service Level**: 
    *   If `translations[0]` is undefined, the service will attempt a fallback request with `lang=en`.
    *   If still missing, it will return empty strings to prevent UI crashes.
3.  **UI Level**: Labels will fall back to the raw `slug` or a placeholder string if all translations are missing.

## 5. Taxonomy Handling

`Category` and `City` names will be resolved by the backend. The frontend will no longer maintain the hardcoded `categories` and `cities` arrays in `mockEvents.ts`, instead populating filters dynamically from the `/categories` and `/cities` endpoints.

## 6. Implementation Status & TODOs

- [x] TODO: Implement read-only taxonomy endpoints (`GET /categories`, `GET /cities`) before switching frontend services to backend data.