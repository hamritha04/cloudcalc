
package com.cloudcalc;

import com.cloudcalc.service.CalculatorService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class CalculatorServiceTest {

    private CalculatorService calculatorService;

    @BeforeEach
    void setUp() {
        calculatorService = new CalculatorService();
    }

    @Test
    void testAddition() {
        assertEquals(15.0, calculatorService.calculate(10, 5, "add"));
    }

    @Test
    void testSubtraction() {
        assertEquals(5.0, calculatorService.calculate(10, 5, "subtract"));
    }

    @Test
    void testMultiplication() {
        assertEquals(50.0, calculatorService.calculate(10, 5, "multiply"));
    }

    @Test
    void testDivision() {
        assertEquals(2.0, calculatorService.calculate(10, 5, "divide"));
    }

    @Test
    void testDivisionByZero() {
        assertThrows(ArithmeticException.class,
                () -> calculatorService.calculate(10, 0, "divide"));
    }

    @Test
    void testInvalidOperation() {
        assertThrows(IllegalArgumentException.class,
                () -> calculatorService.calculate(10, 5, "modulus"));
    }
}
