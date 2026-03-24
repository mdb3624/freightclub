package com.freightclub.storage;

import com.freightclub.domain.DocumentType;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.UUID;

@Service
public class LocalStorageService implements StorageService {

    private static final Logger log = LoggerFactory.getLogger(LocalStorageService.class);

    private static final Map<String, String> EXTENSIONS = Map.of(
            "image/jpeg", ".jpg",
            "image/png",  ".png",
            "image/webp", ".webp",
            "application/pdf", ".pdf"
    );

    @Value("${app.storage.local-path:${user.home}/freightclub-uploads}")
    private String storagePath;

    @PostConstruct
    void init() {
        try {
            Files.createDirectories(Paths.get(storagePath));
            log.info("Local file storage initialized at: {}", storagePath);
        } catch (IOException e) {
            throw new UncheckedIOException("Failed to initialize local file storage at: " + storagePath, e);
        }
    }

    @Override
    public String store(String tenantId, String loadId, DocumentType type,
                        String originalFilename, String contentType, byte[] data) {
        String ext = EXTENSIONS.getOrDefault(contentType, ".bin");
        String key = tenantId + "/" + loadId + "/" + type.name() + "/" + UUID.randomUUID() + ext;
        Path dest = Paths.get(storagePath, key);
        try {
            Files.createDirectories(dest.getParent());
            Files.write(dest, data);
            log.debug("Stored {} bytes at: {}", data.length, dest);
            return key;
        } catch (IOException e) {
            throw new UncheckedIOException("Failed to store file: " + key, e);
        }
    }

    @Override
    public byte[] retrieve(String storageKey) {
        if (storageKey == null || storageKey.isEmpty() || storageKey.contains("..")) {
            throw new IllegalArgumentException("Invalid storage key");
        }
        Path filePath = Paths.get(storagePath, storageKey);
        try {
            return Files.readAllBytes(filePath);
        } catch (IOException e) {
            throw new UncheckedIOException("Failed to retrieve file: " + storageKey, e);
        }
    }
}
