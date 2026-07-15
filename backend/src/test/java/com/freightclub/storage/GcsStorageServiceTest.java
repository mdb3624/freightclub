package com.freightclub.storage;

import com.freightclub.domain.DocumentType;
import com.google.cloud.storage.Blob;
import com.google.cloud.storage.BlobId;
import com.google.cloud.storage.BlobInfo;
import com.google.cloud.storage.Storage;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GcsStorageServiceTest {

    @Mock private Storage storage;

    @Test
    void store_writesToBucketWithTenantScopedKey() {
        GcsStorageService service = new GcsStorageService(storage, "freightclub-documents-prod");
        byte[] data = {1, 2, 3};

        String key = service.store("tenant-1", "load-1", DocumentType.BOL_GENERATED, "bill-of-lading.pdf", "application/pdf", data);

        assertThat(key).startsWith("tenant-1/load-1/BOL_GENERATED/");
        assertThat(key).endsWith(".pdf");
    }

    @Test
    void retrieve_readsBytesFromBucket() {
        GcsStorageService service = new GcsStorageService(storage, "freightclub-documents-prod");
        Blob blob = org.mockito.Mockito.mock(Blob.class);
        when(blob.getContent()).thenReturn(new byte[]{9, 9, 9});
        when(storage.get(any(BlobId.class))).thenReturn(blob);

        byte[] result = service.retrieve("tenant-1/load-1/BOL_GENERATED/x.pdf");

        assertThat(result).containsExactly(9, 9, 9);
    }
}
