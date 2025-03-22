export type Layout = {
  id: string;
  name: string;
  width: number;
  length: number;
  imageUrl: string;
  type: "standard" | "custom";
};

export type ModelType = {
  name: string;
  code: string;
  layouts: Layout[];
};

export type Model = {
  name: string;
  types: ModelType[];
};

export const models: Model[] = [
  {
    name: "Cape Otway",
    types: [
      {
        name: 'Cape Otway 16" SA',
        code: "1007",
        layouts: [],
      },
      { name: 'Cape Otway 17" SA', code: "1019", layouts: [] },
      { name: 'Cape Otway 18.6" SA', code: "1010", layouts: [] },
      { name: 'Cape Otway 18.6"', code: "1012", layouts: [] },
      { name: 'Cape Otway 18.6" EL', code: "1012 EL", layouts: [] },
      { name: 'Cape Otway 18.6" VX Extreme', code: "1012", layouts: [] },
      { name: 'Cape Otway 19.6"', code: "1001", layouts: [] },
      { name: 'Cape Otway 20.5" Standard', code: "1009", layouts: [] },
      { name: 'Cape Otway 20.5" Premium', code: "1022", layouts: [] },
    ],
  },
  {
    name: "Barrington",
    types: [
      { name: 'Barrington 21"', code: "1002", layouts: [] },
      { name: 'Barrington 21.5" GT', code: "1017", layouts: [] },
      { name: 'Barrington 21.5" XLI', code: "1016", layouts: [] },
      { name: 'Barrington 22"', code: "1004", layouts: [] },
      { name: 'Barrington Club 22.5"', code: "1018", layouts: [] },
      { name: 'Barrington Quad 23"', code: "1025", layouts: [] },
    ],
  },
  {
    name: "Opulance",
    types: [
      { name: 'Opulance 22"', code: "1005 A", layouts: [] },
      { name: 'Opulance 22"', code: "1005 B", layouts: [] },
      { name: 'Opulance 22"', code: "1005 C", layouts: [] },
      { name: 'Opulance 22"', code: "1005 D", layouts: [] },
    ],
  },
  {
    name: "Voyager",
    types: [{ name: 'Voyager 19.6"', code: "1014", layouts: [] }],
  },
];
