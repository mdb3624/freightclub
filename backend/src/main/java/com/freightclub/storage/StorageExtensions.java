package com.freightclub.storage;

import java.util.Map;

/**
 * Shared content-type to file-extension mapping used by all StorageService implementations.
 */
public final class StorageExtensions {

    public static final Map<String, String> EXTENSIONS = Map.of(
            "image/jpeg", ".jpg",
            "image/png",  ".png",
            "image/webp", ".webp",
            "application/pdf", ".pdf"
    );

    private StorageExtensions() {
    }

    public static String resolve(String contentType) {
        return EXTENSIONS.getOrDefault(contentType, ".bin");
    }
}
