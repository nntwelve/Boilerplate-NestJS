import { PartialType } from '@nestjs/mapped-types';
import { CreateParagraphDto } from './create-paragraph.dto';

export class UpdateParagraphDto extends PartialType(CreateParagraphDto) {}
