export function el<T extends HTMLElement>(id: string): T {
  return document.getElementById(id) as T;
}

export function stamp(): string {
  return new Date().toLocaleTimeString();
}
