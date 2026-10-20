/** Small shape guards shared by the routes. */

export function asArray(value) {
  if (!Array.isArray(value)) return [];
  return value.filter((item) => item && typeof item === "object" && !Array.isArray(item));
}

export function asObject(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value;
}

/** Google results are only useful when the nested `results` list is an array. */
export function asGoogleResults(value) {
  const object = asObject(value);
  if (!object || !Array.isArray(object.results)) return null;
  return object;
}
