import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { Category } from '../entities/category.entity';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(dto: CreateCategoryDto): Promise<Category> {
    let parent: Category | undefined;
    if (dto.parentId) {
      parent =
        (await this.categoryRepository.findOne({
          where: { id: dto.parentId },
        })) || undefined;
      if (!parent) throw new NotFoundException('Parent category not found');
    }

    const category = this.categoryRepository.create({
      ...dto,
      parent,
    });
    return this.categoryRepository.save(category);
  }

  async findOrCreateDefault(): Promise<Category> {
    let category = await this.categoryRepository.findOne({
      where: { name: 'Uncategorized' },
    });
    if (!category) {
      category = this.categoryRepository.create({
        name: 'Uncategorized',
        description: 'Default category',
      });
      await this.categoryRepository.save(category);
    }
    return category;
  }

  async findAll(includeChildren = false): Promise<Category[]> {
    const relations = includeChildren ? ['children', 'parent'] : ['parent'];

    return this.categoryRepository.find({
      relations,
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string, includeRelations = false): Promise<Category> {
    const relations = includeRelations
      ? ['children', 'parent', 'products']
      : ['parent'];

    const category = await this.categoryRepository.findOne({
      where: { id },
      relations,
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return category;
  }

  // async getTree(): Promise<Category[]> {
  //   const categories = await this.categoryRepository.find({
  //     order: { name: 'ASC' },
  //   });

  //   const map = new Map<string, Category>();
  //   categories.forEach((cat) => {
  //     cat.children = [];
  //     map.set(cat.id, cat);
  //   });

  //   const roots: Category[] = [];
  //   categories.forEach((cat) => {
  //     if (cat.parentId && map.has(cat.parentId)) {
  //       map.get(cat.parentId)!.children!.push(cat);
  //     } else {
  //       roots.push(cat);
  //     }
  //   });

  //   return roots;
  // }

  async getPath(id: string): Promise<Category[]> {
    const category = await this.findOne(id, true);
    const path: Category[] = [category];

    let current = category.parent;
    while (current) {
      path.unshift(current);
      current = current.parent;
    }

    return path;
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findOne(id);

    if (dto.parentId === id) {
      throw new BadRequestException('Category cannot be its own parent');
    }

    let parent: Category | null = null;
    if (dto.parentId) {
      parent = await this.categoryRepository.findOne({
        where: { id: dto.parentId },
      });
      if (!parent) throw new NotFoundException('Parent category not found');

      if (await this.wouldCreateCircularReference(id, dto.parentId)) {
        throw new BadRequestException(
          'Cannot create circular reference in category hierarchy',
        );
      }
    }

    Object.assign(category, dto);
    category.parent = parent || undefined;

    return this.categoryRepository.save(category);
  }

  private async wouldCreateCircularReference(
    categoryId: string,
    parentId: string,
  ): Promise<boolean> {
    let currentParent = await this.categoryRepository.findOne({
      where: { id: parentId },
      relations: ['parent'],
    });

    while (currentParent) {
      if (currentParent.id === categoryId) {
        return true;
      }
      currentParent = currentParent.parent || null;
    }

    return false;
  }

  async remove(id: string): Promise<void> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['children', 'products'],
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    if (category.children && category.children.length > 0) {
      throw new BadRequestException(
        'Cannot delete category with subcategories',
      );
    }

    if (category.products && category.products.length > 0) {
      throw new BadRequestException('Cannot delete category with products');
    }
    await this.categoryRepository.delete(id);
  }

  async findTopCategories(limit = 5) {
    return this.categoryRepository
      .createQueryBuilder('c')
      .innerJoin('products', 'p', 'p.category_id = c.id')
      .innerJoin('order_items', 'oi', 'oi.product_id = p.id')
      .innerJoin('orders', 'o', 'o.id = oi.order_id')
      .select('c.id', 'id')
      .addSelect('c.name', 'name')
      .addSelect('c.image_url', 'imageUrl')
      .addSelect('COUNT(DISTINCT p.id)', 'totalProducts')
      .where('o.status = :status', { status: 'DELIVERED' })
      .groupBy('c.id')
      .addGroupBy('c.name')
      .addGroupBy('c.image_url')
      .orderBy('COUNT(DISTINCT p.id)', 'DESC')
      .limit(limit)
      .getRawMany();
  }

  async findByName(name: string): Promise<Category | null> {
    return this.categoryRepository.findOne({
      where: { name: ILike(name) },
    });
  }

  async createSimple(name: string): Promise<Category> {
    const category = this.categoryRepository.create({
      name,
      description: 'Auto created from import',
    });
    return this.categoryRepository.save(category);
  }
}
