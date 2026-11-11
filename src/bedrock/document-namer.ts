export function documentNamer(): (filename?: string) => string {
  let unnamed = 0;

  return (filename) => (filename ? filename.split(".")[0] : `document-${++unnamed}`);
}
