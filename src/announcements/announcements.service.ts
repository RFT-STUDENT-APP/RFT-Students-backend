import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseStorageService } from '../storage/supabase-storage.service';

@Injectable()
export class AnnouncementsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly supabaseStorage: SupabaseStorageService,
  ) {}

  async create(data: any, authorId: string, file?: Express.Multer.File) {
    let imageUrl = data.imageUrl || null;
    if (file) {
      imageUrl = await this.supabaseStorage.uploadFile(file);
    }

    return this.prisma.announcement.create({
      data: {
        title: data.title || 'Announcement',
        message: data.message || data.content || '',
        audienceType: data.audienceType || 'ALL',
        type: data.type || 'GENERAL',
        imageUrl: imageUrl,
        courseId: data.courseId && data.courseId.trim() !== '' ? data.courseId : null,
        schoolId: data.schoolId && data.schoolId.trim() !== '' ? data.schoolId : null,
        authorId,
      },
      include: {
        author: { select: { fullName: true, role: true } },
        course: true,
        school: true,
      },
    });
  }

  async findAll(user?: any) {
    let where: any = {};

    if (user && user.role !== 'SUPER_ADMIN') {
      const userSchoolId = user.schoolId;
      if (userSchoolId) {
        where = {
          OR: [
            { author: { role: 'SUPER_ADMIN' } },
            { schoolId: userSchoolId },
            { author: { schoolId: userSchoolId } },
          ],
        };
      } else {
        where = { author: { role: 'SUPER_ADMIN' } };
      }
    }

    const currentUserId = user?.userId || user?.id;

    const list = await this.prisma.announcement.findMany({
      where,
      include: {
        author: { select: { fullName: true, role: true } },
        course: true,
        school: true,
        likes: true,
        comments: {
          include: { author: { select: { fullName: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return list.map((a) => {
      const likesCount = a.likes.length;
      const hasLiked = currentUserId
        ? a.likes.some((l) => l.userId === currentUserId)
        : false;
      const mappedComments = a.comments.map((c) => ({
        id: c.id,
        text: c.content,
        author: c.author?.fullName || 'Student',
        createdAt: c.createdAt.toISOString(),
      }));

      return {
        id: a.id,
        title: a.title,
        message: a.message,
        content: a.message,
        audienceType: a.audienceType,
        type: a.type,
        imageUrl: a.imageUrl,
        author: a.author?.fullName || 'Campus Staff',
        authorName: a.author?.fullName || 'Campus Staff',
        authorRole: a.author?.role,
        courseId: a.courseId,
        schoolId: a.schoolId,
        createdAt: a.createdAt.toISOString(),
        likes: likesCount,
        hasLiked,
        comments: mappedComments,
      };
    });
  }

  async findOne(id: string, user?: any) {
    const announcement = await this.prisma.announcement.findUnique({
      where: { id },
      include: {
        author: { select: { fullName: true, role: true } },
        course: true,
        likes: true,
        comments: {
          include: { author: { select: { fullName: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    if (!announcement) throw new NotFoundException('Announcement not found');

    const currentUserId = user?.userId || user?.id;
    const likesCount = announcement.likes.length;
    const hasLiked = currentUserId
      ? announcement.likes.some((l) => l.userId === currentUserId)
      : false;
    const mappedComments = announcement.comments.map((c) => ({
      id: c.id,
      text: c.content,
      author: c.author?.fullName || 'Student',
      createdAt: c.createdAt.toISOString(),
    }));

    return {
      id: announcement.id,
      title: announcement.title,
      message: announcement.message,
      content: announcement.message,
      audienceType: announcement.audienceType,
      type: announcement.type,
      imageUrl: announcement.imageUrl,
      author: announcement.author?.fullName || 'Campus Staff',
      authorName: announcement.author?.fullName || 'Campus Staff',
      authorRole: announcement.author?.role,
      courseId: announcement.courseId,
      createdAt: announcement.createdAt.toISOString(),
      likes: likesCount,
      hasLiked,
      comments: mappedComments,
    };
  }

  async update(id: string, data: any) {
    return this.prisma.announcement.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.announcement.delete({ where: { id } });
  }

  async toggleLike(announcementId: string, userId: string) {
    const existing = await this.prisma.announcementLike.findUnique({
      where: {
        announcementId_userId: {
          announcementId,
          userId,
        },
      },
    });

    if (existing) {
      await this.prisma.announcementLike.delete({
        where: { id: existing.id },
      });
    } else {
      await this.prisma.announcementLike.create({
        data: {
          announcementId,
          userId,
        },
      });
    }

    const likesCount = await this.prisma.announcementLike.count({
      where: { announcementId },
    });

    return {
      liked: !existing,
      likesCount,
    };
  }

  async getComments(announcementId: string) {
    const comments = await this.prisma.announcementComment.findMany({
      where: { announcementId },
      include: { author: { select: { fullName: true } } },
      orderBy: { createdAt: 'asc' },
    });

    return comments.map((c) => ({
      id: c.id,
      text: c.content,
      author: c.author?.fullName || 'Student',
      createdAt: c.createdAt.toISOString(),
    }));
  }

  async addComment(announcementId: string, authorId: string, content: string) {
    if (!content || !content.trim()) {
      throw new BadRequestException('Comment text cannot be empty');
    }

    const comment = await this.prisma.announcementComment.create({
      data: {
        announcementId,
        authorId,
        content: content.trim(),
      },
      include: { author: { select: { fullName: true } } },
    });

    return {
      id: comment.id,
      text: comment.content,
      author: comment.author?.fullName || 'Student',
      createdAt: comment.createdAt.toISOString(),
    };
  }
}
