import { PartialType } from '@nestjs/mapped-types';
import { CreateFlashCardDto } from './create-flash-card.dto';

export class UpdateFlashCardDto extends PartialType(CreateFlashCardDto) {}
