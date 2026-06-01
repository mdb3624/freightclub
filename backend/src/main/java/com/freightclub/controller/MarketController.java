package com.freightclub.controller;

import com.freightclub.dto.DieselPriceResponse;
import com.freightclub.service.EiaFuelPriceService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/market")
@Validated
public class MarketController {

    private final EiaFuelPriceService eiaFuelPriceService;

    public MarketController(EiaFuelPriceService eiaFuelPriceService) {
        this.eiaFuelPriceService = eiaFuelPriceService;
    }

    @GetMapping("/diesel-prices")
    @PreAuthorize("isAuthenticated()")
    public DieselPriceResponse getDieselPrices() {
        return eiaFuelPriceService.getDieselPrices();
    }
}
