import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Query,
  UseGuards,
  Req,
  ParseUUIDPipe,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { EventsService } from './events.service';
import {
  CreateEventDto,
  UpdateEventDto,
  ListEventsQueryDto,
  GetEventQueryDto,
} from './dto/event.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { OrganizationRole } from '@prisma/client';
import type { AuthenticatedRequest } from '../common/types';

@Controller('events')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @Roles(OrganizationRole.ADMIN)
  create(
    @Req() req: AuthenticatedRequest,
    @Body() createEventDto: CreateEventDto,
  ) {
    return this.eventsService.create(req.orgId!, createEventDto);
  }

  @Post(':id/image')
  @Roles(OrganizationRole.ADMIN)
  @UseInterceptors(FileInterceptor('image'))
  uploadImage(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: /image\/(png|jpe?g|webp)/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.eventsService.uploadImage(req.orgId!, id, file);
  }

  @Get()
  @Roles(OrganizationRole.ADMIN, OrganizationRole.STAFF)
  findAll(
    @Req() req: AuthenticatedRequest,
    @Query() query: ListEventsQueryDto,
  ) {
    return this.eventsService.findAll(
      req.orgId!,
      query.lang,
      query.skip,
      query.take,
    );
  }

  @Get('slug/:slug')
  @Roles(OrganizationRole.ADMIN, OrganizationRole.STAFF)
  findBySlug(
    @Req() req: AuthenticatedRequest,
    @Param('slug') slug: string,
    @Query() query: GetEventQueryDto,
  ) {
    return this.eventsService.findBySlug(req.orgId!, slug, query.lang);
  }

  @Get(':id')
  @Roles(OrganizationRole.ADMIN, OrganizationRole.STAFF)
  findOne(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: GetEventQueryDto,
  ) {
    return this.eventsService.findOne(req.orgId!, id, query.lang);
  }

  @Put(':id')
  @Roles(OrganizationRole.ADMIN)
  update(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateEventDto: UpdateEventDto,
  ) {
    return this.eventsService.update(req.orgId!, id, updateEventDto);
  }
}
