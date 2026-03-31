/*
===================================================================
Node.js & npm Lab — CLI Calculator
===================================================================

===================================================================
LAB CREATION INSTRUCTIONS
===================================================================

1. Create a folder name it as utils.
2. Inside the utils folder create an operation.js file and parser.js.
3. In the oerpation.js file create the following functions:

    - Note: you will write the code inside the return statement's curly braces.

    export function add(numbers) {
    return {}
    }
    export function subtract(numbers) {
      return {}
    }

    export function multiply(numbers) {
      return {}
    }

    export function divide(numbers) {
      return {}
    }

4. Inside the parser.js file 
    4.1 import lodsh library:

          import _ from "lodash"

    - Note: you will write the code inside the return statement's curly braces.

    4.2 create the following functions inside the paarser.js file:

        export function parseNumbers(input) {
            return {}
          }

          export function isValidOperation(operation) {
            return {}
          }

===================================================================
LAB SETUP INSTRUCTIONS
===================================================================

1. Navigate to the project root folder (if you are not in root directory):
   Open your terminal and run:
      cd 6-2-node-npm

2. Initialize npm project (if not already done):
   Run:
      npm init -y
   This creates a package.json file that manages your project dependencies.

3. Install project dependencies:
   Run:
      npm install lodash
   This installs the lodash package, which provides useful utility functions.

   If your system blocks running npm commands (especially on Windows PowerShell),
   run this command first to allow script execution:
      Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

===================================================================
TODO 1: Import Required Modules (in calculator.js)
===================================================================
Goal: Import the modules and npm package you'll need.

Hints:
- Import the operation functions from "./utils/operations.js"
- Import the parser functions from "./utils/parser.js"
- Import lodash (the third-party package you installed)

Example:
  import { add, subtract } from "./utils/operations.js";
  import { parseNumbers, isValidOperation } from "./utils/parser.js";
  import _ from "lodash";

===================================================================
TODO 2: Parse Command Line Arguments (in calculator.js)
===================================================================
Goal: Extract the operation and numbers from command line arguments.

Hints:
- Use process.argv to get command line arguments
- process.argv is an array where:
  - process.argv[0] is the path to Node.js
  - process.argv[1] is the path to your script
  - process.argv[2] is the first argument (operation)
  - process.argv[3+] are the numbers

Example:
  const operation = process.argv[2];
  const numbers = process.argv.slice(3);

===================================================================
TODO 3: Validate Input and Calculate (in calculator.js)
===================================================================
Goal: Validate the operation and numbers, then perform the calculation.

Hints:
- Check if operation is valid using isValidOperation()
- Parse the numbers using parseNumbers()
- Use a switch statement or if/else to call the appropriate operation function
- Display the result using console.log()

Example structure:
  if (!isValidOperation(operation)) {
    console.log("Invalid operation. Use: add, subtract, multiply, or divide");
    return;
  }

  const nums = parseNumbers(numbers);
  let result;

  switch (operation) {
    case "add":
      result = add(nums);
      break;
    // ... other cases
  }

  console.log(`Result: ${result}`);

===============================================================
TODO 4: Create Math Operation Functions (in utils/operations.js)
===============================================================
Goal: Implement functions that perform mathematical operations on arrays of numbers.

TODO 4.1: Add Function
- Calculate the sum of all numbers in the array
- Use Array.reduce() or a loop

TODO 4.2: Subtract Function
- Start with the first number, subtract all others
- Example: subtract([10, 3, 2]) → 10 - 3 - 2 = 5

TODO 4.3: Multiply Function
- Multiply all numbers together
- Example: multiply([2, 3, 4]) → 2 * 3 * 4 = 24

TODO 4.4: Divide Function
- Start with the first number, divide by all others
- Example: divide([20, 2, 5]) → 20 / 2 / 5 = 2
- Handle division by zero (return error message or NaN)

Hints:
- Use Array.reduce() for cleaner code
- For subtract and divide, skip the first element in the reduce

Example for add:
  export function add(numbers) {
    return numbers.reduce((sum, num) => sum + num, 0);
  }

===============================================================
TODO 5: Create Parser Functions Using Lodash (in utils/parser.js)
===============================================================
Goal: Use lodash (a third-party npm package) to parse and validate input.

TODO 5.1: Parse Numbers Function
- Convert an array of strings to an array of numbers
- Use lodash's _.map() to convert each string to a number
- Use lodash's _.compact() to remove any invalid entries

Hints:
- _.map(array, function) applies a function to each element
- _.compact(array) removes falsy values (null, undefined, false, 0, "")
- Use Number() or parseFloat() to convert strings to numbers

Example:
  export function parseNumbers(input) {
    const numbers = _.map(input, (str) => Number(str));
    return _.compact(numbers);
  }

TODO 5.2: Validate Operation Function
- Check if the operation is one of: "add", "subtract", "multiply", "divide"
- Use lodash's _.includes() to check if the operation is in the valid operations array

Hints:
- _.includes(array, value) checks if a value exists in an array
- Create an array of valid operations: ["add", "subtract", "multiply", "divide"]

Example:
  export function isValidOperation(operation) {
    const validOps = ["add", "subtract", "multiply", "divide"];
    return _.includes(validOps, operation);
  }

===============================================================
Testing Your Calculator
===============================================================

After completing all TODOs, test your calculator:

  node calculator.js add 5 10 15
  Expected output: Result: 30

  node calculator.js subtract 20 5 3
  Expected output: Result: 12

  node calculator.js multiply 2 3 4
  Expected output: Result: 24

  node calculator.js divide 20 2 5
  Expected output: Result: 2

  node calculator.js invalid 1 2 3
  Expected output: Invalid operation. Use: add, subtract, multiply, or divide

*/
