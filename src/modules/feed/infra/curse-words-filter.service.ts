import { Injectable } from "@nestjs/common";

@Injectable()
export class CurseWordsFilterService {
  private static readonly words = [
    "palavrão1",
    "palavrão2",
    "palavrão3",
    "palavrão4",
    "palavrão5",
  ];

  private static readonly regex: RegExp = new RegExp(
    CurseWordsFilterService.words
      .map(w => `\\b${CurseWordsFilterService.escapeRegex(w)}\\b`)
      .join("|"),
    "i"
  );

  static containsCurseWords(text: string): boolean {
    return CurseWordsFilterService.regex.test(text);
  }

  private static escapeRegex(word: string): string {
    return word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
}