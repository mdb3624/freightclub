package com.freightclub.modules.shipper.infrastructure.rest.dto;

public record LoadListResponse(
  LoadItemDto[] loads,
  PaginationDto pagination
) {
  public record LoadItemDto(
    String id,
    String originCity,
    String originState,
    String destinationCity,
    String destinationState,
    String pickupEarliest,
    String pickupLatest,
    String status,
    Double payAmount,
    String payUnit,
    String claimedByTruckerName,
    String createdAt
  ) {}

  public record PaginationDto(
    int page,
    int limit,
    int total
  ) {}

  public static LoadListResponse of(LoadItemDto[] loads, int page, int limit, int total) {
    return new LoadListResponse(
      loads,
      new PaginationDto(page, limit, total)
    );
  }
}
