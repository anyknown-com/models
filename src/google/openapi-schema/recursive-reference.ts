export class RecursiveReference extends Error {
  constructor(reference: string) {
    super(`google does not convert the recursive JSON Schema reference ${reference}`);
    this.name = "RecursiveReference";
  }
}
