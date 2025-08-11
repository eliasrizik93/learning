export class CreateCardDto {
  id: number;
  question: string;
  answer: string;
  date: string;
  groupId?: Date;
}
