import { Injectable } from '@nestjs/common';
import { EventStatus, Event } from '@prisma/client';

@Injectable()
export class EventPolicyService {
  /**
   * Defines if an event can be sold (public or POS).
   * Rule: Must be PUBLISHED or LIVE, and not ENDED or CANCELLED.
   */
  canSell(event: Pick<Event, 'status' | 'startTime' | 'endTime'>, now: Date = new Date()): boolean {
    if (event.status === EventStatus.CANCELLED || event.status === EventStatus.ENDED) {
      return false;
    }
    
    if (event.status === EventStatus.DRAFT) {
      return false;
    }

    // If it has an end time and it's passed, it shouldn't be sellable anymore
    if (event.endTime && event.endTime < now) {
      return false;
    }

    return [EventStatus.PUBLISHED, EventStatus.LIVE].includes(event.status);
  }

  /**
   * Defines if tickets for an event can be scanned.
   * Rule: Must be LIVE. PUBLISHED might allow early entry if business logic dictates, 
   * but standard is LIVE. ENDED/CANCELLED/DRAFT are denied.
   */
  canScan(event: Pick<Event, 'status'>): boolean {
    return event.status === EventStatus.LIVE;
  }

  /**
   * Defines if an event is visible to the public.
   * Rule: PUBLISHED, LIVE, or ENDED (historical). DRAFT and CANCELLED are hidden.
   */
  isPublicVisible(event: Pick<Event, 'status'>): boolean {
    return [EventStatus.PUBLISHED, EventStatus.LIVE, EventStatus.ENDED].includes(
      event.status,
    );
  }

  publicVisibilityStatuses(): EventStatus[] {
    return [EventStatus.PUBLISHED, EventStatus.LIVE, EventStatus.ENDED];
  }
}
