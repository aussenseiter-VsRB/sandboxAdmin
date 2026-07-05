import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export interface Block {
  id: string;
  type: 'hero' | 'text' | 'image' | 'cta';
  props: Record<string, any>;
}

@Injectable()
export class PageService {
  private readonly dataPath = path.resolve(process.cwd(), 'data/page.json');

  getBlocks(): Block[] {
    const raw = fs.readFileSync(this.dataPath, 'utf-8');
    const data = JSON.parse(raw);
    return data.blocks;
  }

  saveBlocks(blocks: Block[]): void {
    fs.writeFileSync(this.dataPath, JSON.stringify({ blocks }, null, 2), 'utf-8');
  }
}
