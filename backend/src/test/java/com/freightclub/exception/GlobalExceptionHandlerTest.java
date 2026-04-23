package com.freightclub.exception;

import com.freightclub.dto.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    private HttpServletRequest req(String uri) {
        HttpServletRequest r = mock(HttpServletRequest.class);
        when(r.getRequestURI()).thenReturn(uri);
        return r;
    }

    @Test
    @DisplayName("EmailAlreadyExistsException → 409")
    void emailExists_409() {
        ResponseEntity<ErrorResponse> r = handler.handleEmailExists(
                new EmailAlreadyExistsException("alice@example.com"), req("/api/auth/register"));
        assertThat(r.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(r.getBody()).isNotNull();
        assertThat(r.getBody().path()).isEqualTo("/api/auth/register");
    }

    @Test
    @DisplayName("LoadNotFoundException → 404")
    void loadNotFound_404() {
        ResponseEntity<ErrorResponse> r = handler.handleLoadNotFound(
                new LoadNotFoundException("load-abc"), req("/api/loads/load-abc"));
        assertThat(r.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    @DisplayName("LoadStatusTransitionException → 409")
    void statusTransition_409() {
        ResponseEntity<ErrorResponse> r = handler.handleLoadStatusTransition(
                new LoadStatusTransitionException("bad transition"), req("/api/loads/x/publish"));
        assertThat(r.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
    }

    @Test
    @DisplayName("LoadNotClaimableException → 409")
    void notClaimable_409() {
        ResponseEntity<ErrorResponse> r = handler.handleLoadNotClaimable(
                new LoadNotClaimableException("not claimable"), req("/api/loads/x/claim"));
        assertThat(r.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
    }

    @Test
    @DisplayName("LoadEditForbiddenException → 403")
    void loadEditForbidden_403() {
        ResponseEntity<ErrorResponse> r = handler.handleLoadEditForbidden(
                new LoadEditForbiddenException("forbidden"), req("/api/loads/x"));
        assertThat(r.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
    }

    @Test
    @DisplayName("DocumentUploadRequiredException → 422")
    void documentRequired_422() {
        ResponseEntity<ErrorResponse> r = handler.handleDocumentUploadRequired(
                new DocumentUploadRequiredException("pod required"), req("/api/loads/x/deliver"));
        assertThat(r.getStatusCode()).isEqualTo(HttpStatus.UNPROCESSABLE_ENTITY);
    }

    @Test
    @DisplayName("DocumentNotFoundException → 404")
    void documentNotFound_404() {
        ResponseEntity<ErrorResponse> r = handler.handleDocumentNotFound(
                new DocumentNotFoundException("doc-1"), req("/api/documents/doc-1"));
        assertThat(r.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    @DisplayName("AccessDeniedException → 403")
    void accessDenied_403() {
        ResponseEntity<ErrorResponse> r = handler.handleAccessDenied(req("/api/loads"));
        assertThat(r.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
    }

    @Test
    @DisplayName("BadCredentialsException → 401")
    void badCredentials_401() {
        ResponseEntity<ErrorResponse> r = handler.handleBadCredentials(req("/api/auth/login"));
        assertThat(r.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    @DisplayName("IllegalArgumentException → 400")
    void illegalArgument_400() {
        ResponseEntity<ErrorResponse> r = handler.handleIllegalArgument(
                new IllegalArgumentException("bad arg"), req("/api/loads"));
        assertThat(r.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    @DisplayName("RatingAlreadyExistsException → 409")
    void ratingAlreadyExists_409() {
        ResponseEntity<ErrorResponse> r = handler.handleRatingAlreadyExists(
                new RatingAlreadyExistsException(), req("/api/ratings"));
        assertThat(r.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
    }

    @Test
    @DisplayName("RatingNotAllowedException → 403")
    void ratingNotAllowed_403() {
        ResponseEntity<ErrorResponse> r = handler.handleRatingNotAllowed(
                new RatingNotAllowedException("not allowed"), req("/api/ratings"));
        assertThat(r.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
    }

    @Test
    @DisplayName("InvalidJoinCodeException → 409")
    void invalidJoinCode_409() {
        ResponseEntity<ErrorResponse> r = handler.handleInvalidJoinCode(
                new InvalidJoinCodeException(), req("/api/auth/register"));
        assertThat(r.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
    }

    @Test
    @DisplayName("Generic Exception → 500")
    void generic_500() {
        ResponseEntity<ErrorResponse> r = handler.handleGeneric(
                new RuntimeException("unexpected"), req("/api/loads"));
        assertThat(r.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @Test
    @DisplayName("InvalidRefreshTokenException → 401")
    void invalidRefreshToken_401() {
        ResponseEntity<ErrorResponse> r = handler.handleInvalidRefreshToken(
                new InvalidRefreshTokenException(), req("/api/auth/refresh"));
        assertThat(r.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }
}
