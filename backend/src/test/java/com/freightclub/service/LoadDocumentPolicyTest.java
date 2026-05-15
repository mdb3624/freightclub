package com.freightclub.service;

import com.freightclub.domain.DocumentType;
import com.freightclub.domain.LoadStatus;
import com.freightclub.exception.DocumentUploadRequiredException;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class LoadDocumentPolicyTest {

  @Test
  void bolPhotoCanBeUploadedWhenLoadIsClaimed() {
    assertDoesNotThrow(() -> LoadDocumentPolicy.validateUpload(DocumentType.BOL_PHOTO, LoadStatus.CLAIMED));
  }

  @Test
  void bolPhotoCannotBeUploadedWhenLoadIsNotClaimed() {
    assertThrows(
        DocumentUploadRequiredException.class,
        () -> LoadDocumentPolicy.validateUpload(DocumentType.BOL_PHOTO, LoadStatus.IN_TRANSIT)
    );
    assertThrows(
        DocumentUploadRequiredException.class,
        () -> LoadDocumentPolicy.validateUpload(DocumentType.BOL_PHOTO, LoadStatus.OPEN)
    );
    assertThrows(
        DocumentUploadRequiredException.class,
        () -> LoadDocumentPolicy.validateUpload(DocumentType.BOL_PHOTO, LoadStatus.DELIVERED)
    );
  }

  @Test
  void bolPhotoValidationThrowsCorrectMessage() {
    DocumentUploadRequiredException ex = assertThrows(
        DocumentUploadRequiredException.class,
        () -> LoadDocumentPolicy.validateUpload(DocumentType.BOL_PHOTO, LoadStatus.IN_TRANSIT)
    );
    assertTrue(ex.getMessage().contains("BOL photo"));
    assertTrue(ex.getMessage().contains("CLAIMED"));
  }

  @Test
  void podPhotoCanBeUploadedWhenLoadIsInTransit() {
    assertDoesNotThrow(() -> LoadDocumentPolicy.validateUpload(DocumentType.POD_PHOTO, LoadStatus.IN_TRANSIT));
  }

  @Test
  void podPhotoCannotBeUploadedWhenLoadIsNotInTransit() {
    assertThrows(
        DocumentUploadRequiredException.class,
        () -> LoadDocumentPolicy.validateUpload(DocumentType.POD_PHOTO, LoadStatus.CLAIMED)
    );
    assertThrows(
        DocumentUploadRequiredException.class,
        () -> LoadDocumentPolicy.validateUpload(DocumentType.POD_PHOTO, LoadStatus.OPEN)
    );
    assertThrows(
        DocumentUploadRequiredException.class,
        () -> LoadDocumentPolicy.validateUpload(DocumentType.POD_PHOTO, LoadStatus.DELIVERED)
    );
  }

  @Test
  void podPhotoValidationThrowsCorrectMessage() {
    DocumentUploadRequiredException ex = assertThrows(
        DocumentUploadRequiredException.class,
        () -> LoadDocumentPolicy.validateUpload(DocumentType.POD_PHOTO, LoadStatus.CLAIMED)
    );
    assertTrue(ex.getMessage().contains("POD photo"));
    assertTrue(ex.getMessage().contains("IN_TRANSIT"));
  }

  @Test
  void issuePhotoCanBeReportedWhenLoadIsInTransit() {
    assertDoesNotThrow(() -> LoadDocumentPolicy.validateUpload(DocumentType.ISSUE_PHOTO, LoadStatus.IN_TRANSIT));
  }

  @Test
  void issuePhotoCannotBeReportedWhenLoadIsNotInTransit() {
    assertThrows(
        DocumentUploadRequiredException.class,
        () -> LoadDocumentPolicy.validateUpload(DocumentType.ISSUE_PHOTO, LoadStatus.CLAIMED)
    );
    assertThrows(
        DocumentUploadRequiredException.class,
        () -> LoadDocumentPolicy.validateUpload(DocumentType.ISSUE_PHOTO, LoadStatus.OPEN)
    );
    assertThrows(
        DocumentUploadRequiredException.class,
        () -> LoadDocumentPolicy.validateUpload(DocumentType.ISSUE_PHOTO, LoadStatus.DELIVERED)
    );
  }

  @Test
  void issuePhotoValidationThrowsCorrectMessage() {
    DocumentUploadRequiredException ex = assertThrows(
        DocumentUploadRequiredException.class,
        () -> LoadDocumentPolicy.validateUpload(DocumentType.ISSUE_PHOTO, LoadStatus.CLAIMED)
    );
    assertTrue(ex.getMessage().contains("Issues"));
    assertTrue(ex.getMessage().contains("IN_TRANSIT"));
  }

  @Test
  void bolGeneratedDocumentTypeDoNotThrow() {
    // Ensure BOL_GENERATED (which has no validation rule) doesn't throw
    assertDoesNotThrow(() -> LoadDocumentPolicy.validateUpload(DocumentType.BOL_GENERATED, LoadStatus.DRAFT));
    assertDoesNotThrow(() -> LoadDocumentPolicy.validateUpload(DocumentType.BOL_GENERATED, LoadStatus.CLAIMED));
    assertDoesNotThrow(() -> LoadDocumentPolicy.validateUpload(DocumentType.BOL_GENERATED, LoadStatus.IN_TRANSIT));
  }

  @Test
  void allLoadStatusCombinationsHandledForUnregualtedDocumentType() {
    // Ensure all LoadStatus values are handled without unexpected exceptions for unregulated document types
    for (LoadStatus status : LoadStatus.values()) {
      assertDoesNotThrow(() -> LoadDocumentPolicy.validateUpload(DocumentType.BOL_GENERATED, status));
    }
  }
}
