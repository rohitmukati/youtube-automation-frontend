export type LegalBlock = { type: "p"; text: string } | { type: "ul"; items: string[] };

export interface LegalSection {
  id: string;
  title: string;
  blocks: LegalBlock[];
}
