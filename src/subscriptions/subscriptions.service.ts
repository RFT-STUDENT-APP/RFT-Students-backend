import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

import { IsString, IsNumber, IsOptional, IsArray, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class PlanDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  price: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxStudents?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[];

  @IsOptional()
  @IsString()
  status?: string;
}


@Injectable()
export class SubscriptionsService {
  private readonly plansFile = path.join(process.cwd(), 'plans.json');
  private plans: PlanDto[] = [];

  private defaultPlans: PlanDto[] = [
    {
      id: 'plan-free',
      name: 'Free Trial',
      price: 0,
      maxStudents: 10,
      features: ['Past Questions View', 'Basic Analytics', 'Max 10 Students'],
      status: 'active',
    },
    {
      id: 'plan-premium',
      name: 'Premium Plan',
      price: 499000,
      maxStudents: 5000,
      features: ['Past Questions Upload & Download', 'Lecturer Management', 'Unlimited Class Reps', 'Advanced Analytics'],
      status: 'active',
    },
    {
      id: 'plan-enterprise',
      name: 'Enterprise Plan',
      price: 1499000,
      maxStudents: 100000,
      features: ['Multi-Campus Hierarchy', 'Dedicated Success Manager', 'Custom API Access', 'Unlimited Students'],
      status: 'active',
    },
  ];

  constructor(private readonly prisma: PrismaService) {
    this.loadPlans();
  }

  private loadPlans() {
    try {
      if (fs.existsSync(this.plansFile)) {
        const data = fs.readFileSync(this.plansFile, 'utf8');
        this.plans = JSON.parse(data);
      } else {
        this.plans = [...this.defaultPlans];
        this.savePlans();
      }
    } catch (err) {
      console.warn('Failed to load plans.json, using defaults.', err);
      this.plans = [...this.defaultPlans];
    }
  }

  private savePlans() {
    try {
      fs.writeFileSync(this.plansFile, JSON.stringify(this.plans, null, 2), 'utf8');
    } catch (err) {
      console.error('Failed to save plans to disk:', err);
    }
  }

  async findAll() {
    return this.plans;
  }

  async create(dto: PlanDto) {
    const newPlan: PlanDto = {
      id: `plan-${Date.now()}`,
      name: dto.name,
      price: Number(dto.price),
      maxStudents: Number(dto.maxStudents || 10),
      features: Array.isArray(dto.features) ? dto.features : ['Past Questions'],
      status: 'active',
    };
    this.plans.push(newPlan);
    this.savePlans();
    return newPlan;
  }

  async update(id: string, dto: Partial<PlanDto>) {
    const index = this.plans.findIndex((p) => p.id === id);
    if (index === -1) throw new NotFoundException('Subscription plan not found');

    this.plans[index] = {
      ...this.plans[index],
      ...dto,
      price: dto.price !== undefined ? Number(dto.price) : this.plans[index].price,
      maxStudents: dto.maxStudents !== undefined ? Number(dto.maxStudents) : this.plans[index].maxStudents,
    };
    this.savePlans();
    return this.plans[index];
  }

  async remove(id: string) {
    const index = this.plans.findIndex((p) => p.id === id);
    if (index === -1) throw new NotFoundException('Subscription plan not found');
    const removed = this.plans.splice(index, 1);
    this.savePlans();
    return removed[0];
  }

  async scheduleDowngrade(userId: string, planId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.schoolId) throw new NotFoundException('School not found for user');

    const plan = this.plans.find((p) => p.id === planId);
    if (!plan) throw new NotFoundException('Plan not found');

    const school = await this.prisma.school.update({
      where: { id: user.schoolId },
      data: {
        nextPlanId: planId
      }
    });

    return {
      message: `Downgrade to ${plan.name} scheduled for ${school.planExpiresAt}`,
      school
    };
  }
}
