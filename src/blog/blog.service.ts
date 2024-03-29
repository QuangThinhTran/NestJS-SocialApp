import { Injectable } from '@nestjs/common';
import { Blog } from './entities/blog.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Util } from 'src/util/util';

@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(Blog)
    readonly blogRepository: Repository<Blog>,
  ) {}

  async create(blog: Blog): Promise<Blog> {
    const slug = Util.createSlug(blog.content);
    return this.blogRepository.save({ ...blog, slug: slug });
  }

  async findAll(): Promise<Blog[]> {
    return this.blogRepository.find({
      relations: ['images', 'users', 'comments'],
    });
  }

  async findOne(id: number): Promise<Blog> {
    return this.blogRepository.findOneOrFail({
      where: { id },
      relations: ['images', 'users', 'comments'],
    });
  }

  async findBySlug(slug: string): Promise<Blog> {
    return this.blogRepository.findOne({
      where: { slug: slug },
      relations: ['images', 'users', 'comments'],
    });
  }

  async update(id: number, data: Blog): Promise<Blog> {
    const slug = Util.createSlug(data.content);
    await this.blogRepository.update(id, { ...data, slug: slug });
    return this.blogRepository.findOneOrFail({ where: { id } });
  }

  async remove(id: number): Promise<void> {
    await this.blogRepository.softDelete(id);
  }
}
