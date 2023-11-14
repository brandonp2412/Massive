export function convert(weight: number, fromUnit: string, toUnit: string) {
  let result = Number(weight);
  if (fromUnit === "lb" && toUnit === "kg") result /= 2.2;
  else if (fromUnit === "kg" && toUnit === "lb") result *= 2.2;
  else if (fromUnit === "stone" && toUnit === "kg") result *= 6.35;
  else if (fromUnit === "kg" && toUnit === "stone") result /= 6.35;
  else if (fromUnit === "stone" && toUnit === "lb") result *= 14;
  else if (fromUnit === "lb" && toUnit === "stone") result /= 14;
  result = Math.round((result + Number.EPSILON) * 100) / 100;
  return result;
}
