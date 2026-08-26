export const initial = [
  {
    name: "A",
    codes: ["return 1;"],
  },
  {
    name: "B",
    codes: [
      [
        "if (A.value !== unset) return A.value + 10;",
        "return unset;",
      ].join("\n"),
      "return 999;",
    ],
  },
];

// --------------------
// types
// --------------------
export type CodeItem = { id: string; code: string; error: string };
export type FieldItem = { id: string; name: string; codes: CodeItem[] };
export type FieldItemSaved = { name: string; codes: string[] };

// --------------------
// データの保存絡み
// --------------------
export const fieldsToSaveds = (fields: FieldItem[]): FieldItemSaved[] =>
  fields.map(({ name, codes }) => (
    { name, codes: codes.map(v => v.code) }
  ));

export const savedsToFields = (saved: FieldItemSaved[]): FieldItem[] =>
  saved.map(({ name, codes }) => ({
      id: crypto.randomUUID(),
      name,
      codes: codes.map(code => ({
        id: crypto.randomUUID(),
        code,
        error: "",
      })),
  }));

export const fieldsToJson = (fields: FieldItem[]): string => JSON.stringify(fieldsToSaveds(fields));
export const jsonToFields = (json: string): FieldItem[] => savedsToFields(JSON.parse(json) as any);
