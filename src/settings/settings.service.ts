import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export const DEFAULT_PRICES = {
  COURSE_MATERIAL: 500,
  PAST_QUESTION: 500,
  SLIDE: 500,
};

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getPricingSettings() {
    try {
      const courseMaterialPrice = await this.prisma.globalSetting.findUnique({
        where: { key: 'course_material_default_price' },
      });

      const pastQuestionPrice = await this.prisma.globalSetting.findUnique({
        where: { key: 'past_question_default_price' },
      });

      const slidePrice = await this.prisma.globalSetting.findUnique({
        where: { key: 'slide_default_price' },
      });

      return {
        courseMaterialPrice: courseMaterialPrice ? Number(courseMaterialPrice.value) : DEFAULT_PRICES.COURSE_MATERIAL,
        pastQuestionPrice: pastQuestionPrice ? Number(pastQuestionPrice.value) : DEFAULT_PRICES.PAST_QUESTION,
        slidePrice: slidePrice ? Number(slidePrice.value) : DEFAULT_PRICES.SLIDE,
      };
    } catch {
      return {
        courseMaterialPrice: DEFAULT_PRICES.COURSE_MATERIAL,
        pastQuestionPrice: DEFAULT_PRICES.PAST_QUESTION,
        slidePrice: DEFAULT_PRICES.SLIDE,
      };
    }
  }

  async updatePricingSettings(dto: { courseMaterialPrice?: number; pastQuestionPrice?: number; slidePrice?: number }) {
    if (dto.courseMaterialPrice !== undefined) {
      await this.prisma.globalSetting.upsert({
        where: { key: 'course_material_default_price' },
        update: { value: String(dto.courseMaterialPrice) },
        create: {
          key: 'course_material_default_price',
          value: String(dto.courseMaterialPrice),
          description: 'Global default price for paid course materials',
        },
      });
    }

    if (dto.pastQuestionPrice !== undefined) {
      await this.prisma.globalSetting.upsert({
        where: { key: 'past_question_default_price' },
        update: { value: String(dto.pastQuestionPrice) },
        create: {
          key: 'past_question_default_price',
          value: String(dto.pastQuestionPrice),
          description: 'Global default price for paid past questions',
        },
      });
    }

    if (dto.slidePrice !== undefined) {
      await this.prisma.globalSetting.upsert({
        where: { key: 'slide_default_price' },
        update: { value: String(dto.slidePrice) },
        create: {
          key: 'slide_default_price',
          value: String(dto.slidePrice),
          description: 'Global default price for paid lecture slides',
        },
      });
    }

    return this.getPricingSettings();
  }
}
