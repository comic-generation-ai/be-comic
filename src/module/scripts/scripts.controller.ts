import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ScriptsService } from './scripts.service';
import { CreateScriptDto } from './dto/create-script.dto';
import { UpdateScriptDto } from './dto/update-script.dto';

@Controller('scripts')
export class ScriptsController {
  constructor(private readonly scriptsService: ScriptsService) {}

  @Post()
  create(@Body() createScriptDto: CreateScriptDto) {
    return this.scriptsService.create(createScriptDto);
  }

  @Get()
  findAll() {
    return this.scriptsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.scriptsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateScriptDto: UpdateScriptDto) {
    return this.scriptsService.update(+id, updateScriptDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.scriptsService.remove(+id);
  }
}
