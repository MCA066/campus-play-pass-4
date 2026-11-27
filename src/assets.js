export function publicAsset(path) {
  if (/^https:\/\//i.test(String(path))) return String(path);
  return `${import.meta.env.BASE_URL}${String(path).replace(/^\/+/, '')}`;
}
