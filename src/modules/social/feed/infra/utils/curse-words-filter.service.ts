import { Injectable } from "@nestjs/common";
import * as badWordsJson from "../../domain/badwords.json";

@Injectable()
export class CurseWordsFilterService {
  private static readonly words: string[] = badWordsJson.badWords;

  private static readonly regex: RegExp = new RegExp(
    CurseWordsFilterService.words
      .map((w) => `\\b${CurseWordsFilterService.escapeRegex(w)}\\b`)
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
