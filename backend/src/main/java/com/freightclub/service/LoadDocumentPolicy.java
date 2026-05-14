package com.freightclub.service;

import com.freightclub.domain.DocumentType;
import com.freightclub.domain.LoadStatus;
import com.freightclub.exception.DocumentUploadRequiredException;

class LoadDocumentPolicy {

    static void validateUpload(DocumentType type, LoadStatus status) {
        switch (type) {
            case BOL_PHOTO -> {
                if (status != LoadStatus.CLAIMED) {
                    throw new DocumentUploadRequiredException(
                            "BOL photo can only be uploaded when load is CLAIMED");
                }
            }
            case POD_PHOTO -> {
                if (status != LoadStatus.IN_TRANSIT) {
                    throw new DocumentUploadRequiredException(
                            "POD photo can only be uploaded when load is IN_TRANSIT");
                }
            }
            case ISSUE_PHOTO -> {
                if (status != LoadStatus.IN_TRANSIT) {
                    throw new DocumentUploadRequiredException(
                            "Issues can only be reported when load is IN_TRANSIT");
                }
            }
            default -> {}
        }
    }
}
