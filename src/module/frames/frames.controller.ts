import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FramesService } from './frames.service';
import { CreateFrameDto } from './dto/create-frame.dto';
import { UpdateFrameDto } from './dto/update-frame.dto';

@Controller('frames')
export class FramesController {
  constructor(private readonly framesService: FramesService) {}

  @Post()
  create(@Body() createFrameDto: CreateFrameDto) {
    return this.framesService.create(createFrameDto);
  }

  @Get()
  findAll() {
    return this.framesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.framesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFrameDto: UpdateFrameDto) {
    return this.framesService.update(+id, updateFrameDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.framesService.remove(+id);
  }
}
