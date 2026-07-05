import { Body, Controller, Get, Post, Param, Put } from '@nestjs/common';
import { PageService, Block } from './page.service';

@Controller()
export class PageController {
  constructor(private readonly pageService: PageService) {}

  @Get('pages')
  listPages(): { id: string; name: string }[] {
    return this.pageService.listPages();
  }

  @Post('pages')
  createPage(@Body() body: { id: string; name: string }): { id: string; name: string; blocks: Block[] } {
    return this.pageService.createPage(body.id, body.name);
  }

  @Get('page/:id')
  getPage(@Param('id') id: string) {
    const page = this.pageService.getPage(id);
    return { blocks: page.blocks };
  }

  @Put('page/:id')
  updatePage(@Param('id') id: string, @Body() body: { blocks: Block[] }) {
    this.pageService.saveBlocks(id, body.blocks);
    return { blocks: this.pageService.getBlocks(id) };
  }
}
