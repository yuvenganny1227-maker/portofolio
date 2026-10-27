// Kalkulator sederhana dengan evaluasi aman (tanpa eval)
(function () {
  "use strict";

  const expressionEl = document.getElementById("expression");
  const resultEl = document.getElementById("result");

  let current = "0";
  let expression = "";

  function updateDisplay() {
    expressionEl.textContent = expression || "\u00A0";
    resultEl.textContent = current;
  }

  function formatNumber(num) {
    if (!isFinite(num)) return "Error";
    const rounded = Math.round(num * 1e10) / 1e10;
    return String(rounded);
  }

  // Evaluasi ekspresi dengan tokenizer + shunting-yard (aman, tanpa eval)
  function evaluate(expr) {
    const tokens = expr.match(/(\d+\.?\d*|[+\-*/%()])/g);
    if (!tokens) return NaN;

    // Shunting-yard ke RPN
    const output = [];
    const ops = [];
    const prec = { "+": 1, "-": 1, "*": 2, "/": 2, "%": 2 };

    for (const token of tokens) {
      if (/^\d/.test(token)) {
        output.push(parseFloat(token));
      } else if (token === "(") {
        ops.push(token);
      } else if (token === ")") {
        while (ops.length && ops[ops.length - 1] !== "(") {
          output.push(ops.pop());
        }
        if (!ops.length) return NaN; // kurung tidak seimbang
        ops.pop();
      } else {
        while (
          ops.length &&
          prec[ops[ops.length - 1]] >= prec[token]
        ) {
          output.push(ops.pop());
        }
        ops.push(token);
      }
    }
    while (ops.length) {
      if (ops[ops.length - 1] === "(") return NaN;
      output.push(ops.pop());
    }

    // Evaluasi RPN
    const stack = [];
    for (const token of output) {
      if (typeof token === "number") {
        stack.push(token);
      } else {
        const b = stack.pop();
        const a = stack.pop();
        if (a === undefined || b === undefined) return NaN;
        switch (token) {
          case "+": stack.push(a + b); break;
          case "-": stack.push(a - b); break;
          case "*": stack.push(a * b); break;
          case "/": stack.push(b === 0 ? NaN : a / b); break;
          case "%": stack.push(a % b); break;
          default: return NaN;
        }
      }
    }
    return stack.length === 1 ? stack[0] : NaN;
  }

  function inputDigit(digit) {
    if (current === "0" && digit !== ".") {
      current = digit;
    } else if (digit === "." && current.includes(".")) {
      return; // cegah titik ganda
    } else {
      current += digit;
    }
    updateDisplay();
  }

  function inputOperator(op) {
    // Jika operator ditekan setelah hasil, lanjutkan dari hasil
    if (expression === "" && current !== "") {
      expression = current + op;
    } else if (expression.endsWith(op)) {
      return; // cegah operator ganda
    } else {
      expression += current + op;
    }
    current = "0";
    updateDisplay();
  }

  function clearAll() {
    current = "0";
    expression = "";
    updateDisplay();
  }

  function deleteLast() {
    if (current.length > 1) {
      current = current.slice(0, -1);
    } else {
      current = "0";
    }
    updateDisplay();
  }

  function calculate() {
    if (expression === "") return;
    const full = expression + current;
    const result = evaluate(full);
    expressionEl.textContent = full + " =";
    current = formatNumber(result);
    expression = "";
    resultEl.textContent = current;
  }

  document.querySelectorAll(".calc-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const value = btn.dataset.value;
      const action = btn.dataset.action;

      if (action === "clear") {
        clearAll();
      } else if (action === "delete") {
        deleteLast();
      } else if (action === "equals") {
        calculate();
      } else if (value === "+" || value === "-" || value === "*" || value === "/" || value === "%") {
        inputOperator(value);
      } else {
        inputDigit(value);
      }
    });
  });

  // Dukungan keyboard
  document.addEventListener("keydown", function (event) {
    const key = event.key;
    if (/^[0-9.]$/.test(key)) {
      inputDigit(key);
    } else if (["+", "-", "*", "/", "%"].includes(key)) {
      inputOperator(key);
    } else if (key === "Enter" || key === "=") {
      event.preventDefault();
      calculate();
    } else if (key === "Backspace") {
      deleteLast();
    } else if (key === "Escape") {
      clearAll();
    }
  });

  updateDisplay();
})();