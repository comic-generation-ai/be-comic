import { Injectable } from '@nestjs/common';
import { CreateFrameDto } from './dto/create-frame.dto';
import { UpdateFrameDto } from './dto/update-frame.dto';

@Injectable()
export class FramesService {
  create(createFrameDto: CreateFrameDto) {
    return 'This action adds a new frame';
  }

  findAll() {
    return `This action returns all frames`;
  }

  findOne(id: number) {
    return `This action returns a #${id} frame`;
  }

  update(id: number, updateFrameDto: UpdateFrameDto) {
    return `This action updates a #${id} frame`;
  }

  remove(id: number) {
    return `This action removes a #${id} frame`;
  }
}
