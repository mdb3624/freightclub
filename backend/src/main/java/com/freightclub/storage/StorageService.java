package com.freightclub.storage;

import com.freightclub.domain.DocumentType;

public interface StorageService {
    String store(String tenantId, String loadId, DocumentType type,
                 String originalFilename, String contentType, byte[] data);
    byte[] retrieve(String storageKey);
}
