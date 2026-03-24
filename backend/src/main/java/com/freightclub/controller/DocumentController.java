package com.freightclub.controller;

import com.freightclub.dto.DocumentResponse;
import com.freightclub.service.DocumentService;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/documents")
public class DocumentController {

    private final DocumentService documentService;

    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }

    @GetMapping("/{loadId}")
    public List<DocumentResponse> listDocuments(@PathVariable String loadId,
                                                @AuthenticationPrincipal String userId) {
        return documentService.getLoadDocuments(loadId, userId);
    }

    @PostMapping(value = "/{loadId}/bol-photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public DocumentResponse uploadBolPhoto(@PathVariable String loadId,
                                           @RequestPart("file") MultipartFile file,
                                           @AuthenticationPrincipal String userId) {
        return documentService.uploadBolPhoto(loadId, userId, file);
    }

    @PostMapping(value = "/{loadId}/pod-photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public DocumentResponse uploadPodPhoto(@PathVariable String loadId,
                                           @RequestPart("file") MultipartFile file,
                                           @AuthenticationPrincipal String userId) {
        return documentService.uploadPodPhoto(loadId, userId, file);
    }

    @PostMapping(value = "/{loadId}/issue", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Void> reportIssue(@PathVariable String loadId,
                                            @RequestParam String description,
                                            @RequestPart(name = "photo", required = false) MultipartFile photo,
                                            @AuthenticationPrincipal String userId) {
        documentService.reportIssue(loadId, userId, description, photo);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/file/{documentId}")
    public ResponseEntity<byte[]> downloadDocument(@PathVariable String documentId,
                                                   @AuthenticationPrincipal String userId) {
        DocumentService.DocumentContent content = documentService.getDocumentContent(documentId, userId);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(content.contentType()));
        headers.setContentDisposition(
                ContentDisposition.attachment().filename(content.filename()).build());
        return ResponseEntity.ok().headers(headers).body(content.bytes());
    }

    @GetMapping("/{loadId}/export")
    public ResponseEntity<byte[]> exportLoadPdf(@PathVariable String loadId,
                                                @AuthenticationPrincipal String userId) {
        byte[] pdf = documentService.exportLoadPdf(loadId, userId);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDisposition(
                ContentDisposition.attachment()
                        .filename("load-export-" + loadId.substring(0, 8) + ".pdf")
                        .build());
        return ResponseEntity.ok().headers(headers).body(pdf);
    }
}
