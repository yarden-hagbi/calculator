const display = document.getElementById("display-text");

document.querySelector(".keypad").addEventListener("click", (e) => {
    const btn = e.target;
    console.log(btn);

    if (!(btn instanceof HTMLButtonElement)) return;

    if (btn.dataset.number) handleNumber(btn.dataset.number);
    else if (btn.dataset.operator) handleOperator(btn.dataset.operator);
    else if (btn.dataset.control) handleControl(btn.dataset.control);
    else if (btn.dataset.equals) handleEquals();
    updateDisplay();
});

const operatorMap = {
    "multiply": "×",
    "divide": "÷",
    "minus": "−",
    "sqrt": "√",
    "power": "²",
    "sin": "sin",
    "cos": "cos",
    "tan": "tan",
    "bla": "bla",
    "add": "+"
};

let currentValue = "";            // what's being typed now
let tokens = [];                  // ["6", "+", "5", "-", "7"]
let lastAction = "number";        // "number" | "operator" | "equals" | "control"

function handleNumber(num) {
    if (lastAction === "equals") reset();

    if (num === ".") {
        if (!currentValue || isNaN(currentValue)) currentValue = "0.";
        else if (!currentValue.includes(".")) currentValue += ".";
    } else {
        if (currentValue === "0" || lastAction === "operator") currentValue = num;
        else currentValue += num;
    }

    lastAction = "number";
}

function handleOperator(operator) {
    if (lastAction === "equals") {
        if (!currentValue || isNaN(currentValue)) return;
        tokens = [currentValue, operator];
        currentValue = "";
    }
    else if (lastAction === "operator") {
        if (tokens.length > 0) tokens[tokens.length - 1] = operator;
    } else {
        if (!currentValue || isNaN(currentValue)) return;
        tokens.push(removeTrailingDot(currentValue));
        tokens.push(operator);
        currentValue = "";
    }

    lastAction = "operator";
}

function handleControl(control) {
    if (control === "AC") reset();
    else if (!currentValue || isNaN(currentValue)) return;
    else if (control === "sign") currentValue = (parseFloat(currentValue) * -1).toString();
    else if (control === "percent") currentValue = (parseFloat(currentValue) / 100).toString();

    lastAction = "control";
}

function handleEquals() {
    if (lastAction === "operator" || !tokens.length) return;

    const result = evaluateLeftToRight([...tokens, removeTrailingDot(currentValue)]);

    currentValue = String(result);
    tokens = []

    lastAction = "equals";
}


// helper functions

function reset() {
    tokens = [];
    currentValue = "";
}

function updateDisplay() {
    if (currentValue === "" && !tokens.length) {
        display.textContent = "0"
    }
    else if (isNaN(currentValue)) {
        display.textContent = "Error";
    } else {
        const parts = currentValue ? [...tokens, currentValue] : tokens;
        display.textContent = parts.map(t => operatorMap[t] ?? t).join("");
    }
}

function evaluateLeftToRight(tokens) {
    let acc = parseFloat(tokens[0]); // first number
    for (let i = 1; i < tokens.length; i += 2) {
        const op = tokens[i]; // operator
        const b = parseFloat(tokens[i + 1]); // second number
        switch (op) {
            case "add": acc += b; break;
            case "minus": acc -= b; break;
            case "multiply": acc *= b; break;
            case "divide": acc = b === 0 ? NaN : acc / b; break;
        }
    }
    return parseFloat(acc.toFixed(5).toString());
}

function removeTrailingDot(v) {
    return v?.endsWith(".") ? v.slice(0, -1) : v;
}
