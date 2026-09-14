import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
  Patch,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  BadRequestException,
  Req,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ContentService } from './content.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

const allowedFileFilter = (req: any, file: Express.Multer.File, callback: (error: Error | null, acceptFile: boolean) => void) => {
  const name = file.originalname.toLowerCase();
  const mime = file.mimetype.toLowerCase();

  const isPdf = mime.includes('pdf') || name.endsWith('.pdf');
  const isDocx = mime.includes('wordprocessingml') || mime.includes('msword') || name.endsWith('.docx') || name.endsWith('.doc');
  const isImage = mime.includes('image/png') || mime.includes('image/jpeg') || name.endsWith('.png') || name.endsWith('.jpg') || name.endsWith('.jpeg');

  if (!isPdf && !isDocx && !isImage) {
    return callback(new BadRequestException('File upload restricted to PDF, DOCX, PNG, JPG, and JPEG files only.'), false);
  }
  callback(null, true);
};

@Controller()
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Get('content/public')
  findAllPublic(
    @Req() req: any,
    @Query('uploaderId') uploaderId?: string,
    @Query('schoolId') schoolId?: string,
    @Query('courseId') courseId?: string,
    @Query('type') type?: string,
  ) {
    return this.contentService.findAll({ uploaderId, schoolId, courseId, type }, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.LECTURER)
  @Post('admin/content')
  create(@Req() req: any, @Body() data: any) {
    return this.contentService.create(data, req.user?.role, req.user?.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.LECTURER)
  @Post('admin/content/upload')
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: allowedFileFilter,
    }),
  )
  uploadSingle(@Req() req: any, @UploadedFile() file: Express.Multer.File, @Body() body: any) {
    if (!file) {
      throw new BadRequestException('A valid file (PDF, DOCX, PNG, JPG, JPEG) is required');
    }
    return this.contentService.create(body, req.user?.role, req.user?.id, file);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.LECTURER)
  @Post('admin/content/bulk-upload')
  @UseInterceptors(
    FilesInterceptor('files', 20, {
      fileFilter: allowedFileFilter,
    }),
  )
  uploadBulk(@Req() req: any, @UploadedFiles() files: Express.Multer.File[], @Body() body: any) {
    if (!files || files.length === 0) {
      throw new BadRequestException('At least one valid file (PDF, DOCX, PNG, JPG, JPEG) is required');
    }
    let itemsData = [];
    if (body.items) {
      try {
        itemsData = typeof body.items === 'string' ? JSON.parse(body.items) : body.items;
      } catch (e) {
        itemsData = [];
      }
    }
    return this.contentService.createBulk(itemsData, files, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN)
  @Patch('admin/content/:id/pricing')
  updatePricing(@Param('id') id: string, @Body() dto: { isPaid?: boolean; price?: number }) {
    return this.contentService.updatePricing(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/content')
  findAllAdmin(
    @Req() req: any,
    @Query('uploaderId') uploaderId?: string,
    @Query('schoolId') schoolId?: string,
    @Query('courseId') courseId?: string,
    @Query('type') type?: string,
  ) {
    return this.contentService.findAll({ uploaderId, schoolId, courseId, type }, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('content')
  findAllStudent(
    @Req() req: any,
    @Query('uploaderId') uploaderId?: string,
    @Query('schoolId') schoolId?: string,
    @Query('courseId') courseId?: string,
    @Query('type') type?: string,
  ) {
    return this.contentService.findAll({ uploaderId, schoolId, courseId, type }, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('content/:id')
  findOne(@Param('id') id: string) {
    return this.contentService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.LECTURER)
  @Delete('admin/content/:id')
  remove(@Param('id') id: string) {
    return this.contentService.remove(id);
  }
}
