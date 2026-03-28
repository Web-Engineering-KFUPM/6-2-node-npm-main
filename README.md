# Node.js & npm Lab — CLI Calculator

> **Note:**
> Please follow the `calculator.js` file to implement the TODOs.
>
> Please use app.jsx file to perform TODOs and follow the steps strictly to gain good marks in the assignment.  
>  
> **Due Date:** 1 April, 2026, **20:59 PM**

---

## Overview
This lab introduces students to **Node.js** and **npm** — the core tools for building JavaScript applications outside the browser.  
Students will create a command-line calculator that uses third-party npm packages and custom modules.  
The lab reinforces the concepts covered in ZyBooks sections **6.2** and **6.3**, providing hands-on practice with running Node.js locally, using npm packages, and creating modules.

---

## Reading Assignments

- 6.2 Getting started with Node.js

- 6.3 Modules

---

## Concepts Used in This Lab

### 1. Introduction to Node.js
Node.js is a JavaScript runtime environment that allows developers to run JavaScript on the server side or in command-line tools.  
It enables creation of scalable, event-driven applications outside the browser.

### 2. Installing and Running Node.js Locally (Windows & macOS)
Node.js must be installed before beginning this lab.  
You can verify installation by running:
```bash
node -v
npm -v
```

To run a Node.js file:
```bash
node filename.js
```

### 3. What Is npm?
npm (Node Package Manager) is the default package manager for Node.js.  
It allows you to:
- Install third-party packages
- Manage project dependencies
- Initialize new projects
- Run scripts

### 4. Initiating a Project Using npm
To create a new Node.js project, use:
```bash
npm init
```
or
```bash
npm init -y
```
This creates a `package.json` file that defines your project metadata and dependencies.

### 5. Working with npm Packages

#### Installing Packages
```bash
npm install package-name
```
or
```bash
npm i package-name
```

#### Installing Package as Dependency
```bash
npm install --save package-name
```

#### Installing Package as Development Dependency
```bash
npm install --save-dev package-name
```

#### Viewing Installed Packages
```bash
npm list
```

#### Uninstalling Packages
```bash
npm uninstall package-name
```

### 6. What Are `package.json` and `package-lock.json` Files?
- **package.json** → Defines project metadata, scripts, and lists dependencies.  
- **package-lock.json** → Records exact versions of installed packages to ensure consistent installs across different machines.

### 7. Using Third-Party npm Packages
Third-party packages provide reusable functionality that you can import into your code.

**General Syntax:**
```js
// Import a package
import packageName from "package-name";

// Use the package
packageName.function();
```

**Example with lodash:**
```js
import _ from "lodash";

const numbers = [1, 2, 3, 4, 5];
const sum = _.sum(numbers); // 15
```

### 8. What Are Modules and Why Are They Used?
Modules allow breaking code into smaller, reusable files.  
This improves readability, maintainability, and organization.

**Two Common Module Formats:**
- **ES Modules (ESM)** → Supported by modern Node.js (`import` / `export` syntax).  
- **CommonJS** → Traditional Node.js format (`require()` / `module.exports`).

### 9. Creating and Using Modules

#### Exporting from a Module
```js
// Export a single function
export function functionName() { ... }

// Export multiple functions
export function func1() { ... }
export function func2() { ... }
```

#### Importing from a Module
```js
// Import a single function
import { functionName } from "./module.js";

// Import multiple functions
import { func1, func2 } from "./module.js";

// Import default export
import defaultName from "./module.js";
```

### 10. Command Line Arguments in Node.js
Node.js provides access to command-line arguments through `process.argv`.

**General Syntax:**
```js
// process.argv is an array
const args = process.argv;

// args[0] = path to Node.js
// args[1] = path to your script
// args[2+] = command line arguments
```

**Example:**
```bash
node script.js add 5 10
```

```js
const operation = process.argv[2]; // "add"
const num1 = process.argv[3];      // "5"
const num2 = process.argv[4];      // "10"
```

---

## 🧠 Code Syntax Summary for Concepts used in this lab

| Concept | Example Syntax |
|----------|----------------|
| Initialize npm project | `npm init -y` |
| Install package | `npm install lodash` |
| Run Node.js file | `node filename.js` |
| Import a module | `import { func } from "./file.js";` |
| Export a function | `export function func() { ... }` |
| Import npm package | `import _ from "lodash";` |
| Command line args | `const arg = process.argv[2];` |
| Use lodash map | `_.map(array, fn)` |
| Use lodash includes | `_.includes(array, value)` |
| Use lodash compact | `_.compact(array)` |

---

## ✅ Submission Checklist

Before submitting your lab, make sure you have:

- [ ] Completed **all five TODOs** in calculator.js and utils files.  
- [ ] Initialized the npm project using `npm init -y`.  
- [ ] Installed lodash package using `npm install lodash`.  
- [ ] Created and exported functions in `utils/operations.js`.  
- [ ] Created and exported functions in `utils/parser.js` using lodash.  
- [ ] Implemented the main calculator logic in `calculator.js`.  
- [ ] Successfully tested the calculator with different operations.  
- [ ] Your calculator runs without errors using `node calculator.js`.  

---

**End of README**

