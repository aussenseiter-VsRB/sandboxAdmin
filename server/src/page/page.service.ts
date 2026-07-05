import { Injectable, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export interface Block {
  id: string;
  type: 'hero' | 'text' | 'image' | 'cta';
  props: Record<string, any>;
}

interface PageData {
  id: string;
  name: string;
  blocks: Block[];
}

@Injectable()
export class PageService {
  private readonly dataPath = path.resolve(__dirname, '..', '..', '..', 'data', 'page.json');

  private readAll(): { pages: PageData[] } {
    const raw = fs.readFileSync(this.dataPath, 'utf-8');
    return JSON.parse(raw);
  }

  private writeAll(data: { pages: PageData[] }): void {
    fs.writeFileSync(this.dataPath, JSON.stringify(data, null, 2), 'utf-8');
  }

  listPages(): { id: string; name: string }[] {
    return this.readAll().pages.map((p) => ({ id: p.id, name: p.name }));
  }

  createPage(id: string, name: string): PageData {
    const data = this.readAll();
    const page: PageData = { id, name, blocks: [] };
    data.pages.push(page);
    this.writeAll(data);
    return page;
  }

  getPage(id: string): PageData {
    const data = this.readAll();
    const page = data.pages.find((p) => p.id === id);
    if (!page) throw new NotFoundException('Page not found');
    return page;
  }

  getBlocks(pageId: string): Block[] {
    return this.getPage(pageId).blocks;
  }

  saveBlocks(pageId: string, blocks: Block[]): void {
    const data = this.readAll();
    const page = data.pages.find((p) => p.id === pageId);
    if (!page) throw new NotFoundException('Page not found');
    page.blocks = blocks;
    this.writeAll(data);
  }
}
