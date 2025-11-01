import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum BannerPlacement {
  HERO_SLIDER = 'hero_slider',
  SIDEBAR = 'sidebar',
  POPUP = 'popup',
}

@Entity({ name: 'banners', synchronize: false })
export class Banner {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 500 })
  imageUrl: string;

  @Column({
    type: 'enum',
    enum: BannerPlacement,
    default: BannerPlacement.HERO_SLIDER,
  })
  placement: BannerPlacement;

  @Column({ type: 'int', default: 0 })
  sortOrder: number;

  @Column({ type: 'varchar', length: 500, nullable: true })
  linkUrl?: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'int', default: 0 })
  clickCount: number;

  @Column({ type: 'int', default: 0 })
  viewCount: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
