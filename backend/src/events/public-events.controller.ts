import { Controller, Get, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { EventsService } from './events.service';
import { ListEventsQueryDto, GetEventQueryDto } from './dto/event.dto';

@Controller('public/events')
export class PublicEventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  findAll(@Query() query: ListEventsQueryDto) {
    return this.eventsService.findPublicAll(
      query.lang,
      query.skip,
      query.take,
      query.organizationSlug,
    );
  }

  @Get('slug/:slug')
  findBySlug(
    @Param('slug') slug: string,
    @Query() query: GetEventQueryDto,
  ) {
    return this.eventsService.findPublicBySlug(
      slug,
      query.lang,
      query.organizationSlug,
    );
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: GetEventQueryDto,
  ) {
    return this.eventsService.findPublicOne(
      id,
      query.lang,
      query.organizationSlug,
    );
  }
}
