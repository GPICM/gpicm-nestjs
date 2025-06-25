import { Injectable } from "@nestjs/common";

@Injectable()
export class CurseWordsFilterService {
  private readonly words = [
    "palavrão1",
    "palavrão2",
    "palavrão3",
    "palavrão4",
    "palavrão5",
  ];

  private readonly regex: RegExp;

  constructor() {
    const pattern = this.words.map(w => `\\b${this.escapeRegex(w)}\\b`).join("|");
    this.regex = new RegExp(pattern, "i"); // case-insensitive
  }

  containsCurseWords(text: string): boolean {
    return this.regex.test(text);
  }

  private escapeRegex(word: string): string {
    // Escapa caracteres especiais para evitar erros no regex
    return word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
}
