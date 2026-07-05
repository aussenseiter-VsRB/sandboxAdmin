import { Body, Controller, Get, Put } from '@nestjs/common';
import { PageService, Block } from './page.service';

@Controller('page')
export class PageController {
  constructor(private readonly pageService: PageService) {}

  @Get()
  getPage(): { blocks: Block[] } {
    return { blocks: this.pageService.getBlocks() };
  }

  @Put()
  updatePage(@Body() body: { blocks: Block[] }): { blocks: Block[] } {
    this.pageService.saveBlocks(body.blocks);
    return { blocks: this.pageService.getBlocks() };
  }
}
