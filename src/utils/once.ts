export function once<T>(fn: () => T): () => T {
  let result: T;
  let func: (() => T) | null = fn; // Store fn in a variable that can be nulled

  return () => {
    if (func) {
      // Check if func is still defined
      result = func();
      func = null; // Nullify func after first execution
    }
    return result;
  };
}
