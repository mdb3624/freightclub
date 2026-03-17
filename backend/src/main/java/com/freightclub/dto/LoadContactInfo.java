package com.freightclub.dto;

import com.freightclub.domain.User;

public record LoadContactInfo(
        String name,
        String businessName,
        String phone,
        String email,
        String mcNumber,
        String dotNumber
) {
    public static LoadContactInfo fromShipper(User user) {
        return new LoadContactInfo(
                user.getFirstName() + " " + user.getLastName(),
                user.getBusinessName(),
                user.getPhone(),
                user.getEmail(),
                null,
                null
        );
    }

    public static LoadContactInfo fromTrucker(User user) {
        return new LoadContactInfo(
                user.getFirstName() + " " + user.getLastName(),
                null,
                user.getPhone(),
                user.getEmail(),
                user.getMcNumber(),
                user.getDotNumber()
        );
    }
}
