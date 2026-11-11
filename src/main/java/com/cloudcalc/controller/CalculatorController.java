
package com.cloudcalc.controller;

import com.cloudcalc.service.CalculatorService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/calculator")
@CrossOrigin
public class CalculatorController {

    private final CalculatorService calculatorService;

    public CalculatorController(CalculatorService calculatorService) {
        this.calculatorService = calculatorService;
    }

    @GetMapping
    public double calculate(
            @RequestParam double a,
            @RequestParam double b,
            @RequestParam String operation) {

        return calculatorService.calculate(a, b, operation);
    }
}