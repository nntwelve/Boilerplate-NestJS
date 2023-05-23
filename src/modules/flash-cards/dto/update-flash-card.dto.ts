import { PartialType } from '@nestjs/swagger';
import { CreateFlashCardDto } from './create-flash-card.dto';

export class UpdateFlashCardDto extends PartialType(CreateFlashCardDto) {}
