export function add(numbers) {
  return numbers.reduce((sum, num) => sum + num, 0);
}

export function subtract(numbers) {
  if (numbers.length === 0) return 0;
  return numbers.slice(1).reduce((result, num) => result - num, numbers[0]);
}

export function multiply(numbers) {
  return numbers.reduce((product, num) => product * num, 1);
}

export function divide(numbers) {
  if (numbers.length === 0) return 0;

  return numbers.slice(1).reduce((result, num) => {
    if (num === 0) {
      return NaN;
    }
    return result / num;
  }, numbers[0]);
}