package com.freightclub.storage;

import com.freightclub.domain.DocumentType;
import com.google.cloud.storage.Blob;
import com.google.cloud.storage.BlobId;
import com.google.cloud.storage.BlobInfo;
import com.google.cloud.storage.Storage;
import com.google.cloud.storage.StorageOptions;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@Profile("prod")
public class GcsStorageService implements StorageService {

    private final Storage storage;
    private final String bucketName;

    @Autowired
    public GcsStorageService(@Value("${app.storage.gcs-bucket}") String bucketName) {
        this(StorageOptions.getDefaultInstance().getService(), bucketName);
    }

    GcsStorageService(Storage storage, String bucketName) {
        this.storage = storage;
        this.bucketName = bucketName;
    }

    @Override
    public String store(String tenantId, String loadId, DocumentType type,
                         String originalFilename, String contentType, byte[] data) {
        String ext = StorageExtensions.resolve(contentType);
        String key = tenantId + "/" + loadId + "/" + type.name() + "/" + UUID.randomUUID() + ext;
        BlobId blobId = BlobId.of(bucketName, key);
        BlobInfo blobInfo = BlobInfo.newBuilder(blobId).setContentType(contentType).build();
        storage.create(blobInfo, data);
        return key;
    }

    @Override
    public byte[] retrieve(String storageKey) {
        if (storageKey == null || storageKey.isEmpty() || storageKey.contains("..")) {
            throw new IllegalArgumentException("Invalid storage key");
        }
        Blob blob = storage.get(BlobId.of(bucketName, storageKey));
        if (blob == null) {
            throw new IllegalStateException("Object not found in GCS: " + storageKey);
        }
        return blob.getContent();
    }
}
