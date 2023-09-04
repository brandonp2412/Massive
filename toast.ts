import { emitter } from "./emitter";

export const TOAST = "toast";

export function toast(value: string) {
  emitter.emit(TOAST, { value });
}
