
package com.cloudcalc.service;

import org.springframework.stereotype.Service;

@Service
public class CalculatorService {

    public double calculate(double a, double b, String operation) {

        switch (operation.toLowerCase()) {

            case "add":
                return a + b;

            case "subtract":
                return a - b;

            case "multiply":
                return a * b;

            case "divide":
                if (b == 0) {
                    throw new ArithmeticException("Division by zero is not allowed");
                }
                return a / b;

            default:
                throw new IllegalArgumentException("Invalid operation");
        }
    }
}