
const resultDisplay = document.getElementById("result");
const expressionDisplay = document.getElementById("expression");
const messageDisplay = document.getElementById("message");

let currentValue = "0";
let firstOperand = null;
let selectedOperation = null;
let waitingForSecondOperand = false;

function updateDisplay() {
    resultDisplay.value = currentValue;
}

function clearCalculator() {
    currentValue = "0";
    firstOperand = null;
    selectedOperation = null;
    waitingForSecondOperand = false;

    expressionDisplay.textContent = "";
    messageDisplay.textContent = "";

    updateDisplay();
}

function inputNumber(number) {
    messageDisplay.textContent = "";

    if (waitingForSecondOperand) {
        currentValue = number;
        waitingForSecondOperand = false;
    } else {
        currentValue = currentValue === "0"
            ? number
            : currentValue + number;
    }

    updateDisplay();
}

function inputDecimal() {
    if (waitingForSecondOperand) {
        currentValue = "0.";
        waitingForSecondOperand = false;
    } else if (!currentValue.includes(".")) {
        currentValue += ".";
    }

    updateDisplay();
}

function deleteNumber() {
    if (waitingForSecondOperand) return;

    currentValue = currentValue.length > 1
        ? currentValue.slice(0, -1)
        : "0";

    if (currentValue === "-") currentValue = "0";

    updateDisplay();
}

function selectOperation(operation) {
    if (selectedOperation && !waitingForSecondOperand) {
        calculate();
    }

    firstOperand = currentValue;
    selectedOperation = operation;
    waitingForSecondOperand = true;

    const symbols = {
        add: "+",
        subtract: "−",
        multiply: "×",
        divide: "÷"
    };

    expressionDisplay.textContent =
        `${firstOperand} ${symbols[operation]}`;

    messageDisplay.textContent = "";
}

async function calculate() {
    if (selectedOperation === null || waitingForSecondOperand) {
        return;
    }

    const secondOperand = currentValue;

    try {
        const params = new URLSearchParams({
            a: firstOperand,
            b: secondOperand,
            operation: selectedOperation
        });

        const response = await fetch(
            `/api/calculator?${params.toString()}`
        );

        if (!response.ok) {
            throw new Error("Calculation failed");
        }

        const answer = await response.json();

        if (!Number.isFinite(answer)) {
            throw new Error("Invalid result");
        }

        expressionDisplay.textContent =
            `${firstOperand} ${selectedOperation} ${secondOperand} =`;

        currentValue = String(
            Number(answer.toPrecision(12))
        );

        firstOperand = null;
        selectedOperation = null;
        waitingForSecondOperand = true;

        updateDisplay();
        messageDisplay.textContent = "";

    } catch (error) {
        messageDisplay.textContent =
            "Error: Division by zero or invalid calculation";

        currentValue = "0";
        firstOperand = null;
        selectedOperation = null;
        waitingForSecondOperand = false;

        updateDisplay();
    }
}

document.querySelector(".buttons").addEventListener("click", (event) => {
    const button = event.target.closest("button");

    if (!button) return;

    if (button.dataset.number !== undefined) {
        inputNumber(button.dataset.number);
    }

    if (button.dataset.operation) {
        selectOperation(button.dataset.operation);
    }

    if (button.dataset.action === "clear") {
        clearCalculator();
    }

    if (button.dataset.action === "delete") {
        deleteNumber();
    }

    if (button.dataset.action === "decimal") {
        inputDecimal();
    }

    if (button.dataset.action === "calculate") {
        calculate();
    }
});

updateDisplay();
