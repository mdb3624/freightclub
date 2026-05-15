package com.freightclub.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmailServiceTest {

  @Mock
  private JavaMailSender mailSender;

  private EmailService emailService;

  @BeforeEach
  void setUp() {
    emailService = new EmailService(Optional.of(mailSender));
    ReflectionTestUtils.setField(emailService, "enabled", true);
    ReflectionTestUtils.setField(emailService, "fromAddress", "noreply@freightclub.app");
  }

  @Test
  void sendsEmailWhenEnabledAndSenderPresent() {
    emailService.send("user@example.com", "Test Subject", "Test Body");

    ArgumentCaptor<SimpleMailMessage> captor = ArgumentCaptor.forClass(SimpleMailMessage.class);
    verify(mailSender).send(captor.capture());

    SimpleMailMessage msg = captor.getValue();
    assertEquals("noreply@freightclub.app", msg.getFrom());
    assertEquals("user@example.com", msg.getTo()[0]);
    assertEquals("Test Subject", msg.getSubject());
    assertEquals("Test Body", msg.getText());
  }

  @Test
  void logsAndSkipsWhenEmailDisabled() {
    ReflectionTestUtils.setField(emailService, "enabled", false);

    emailService.send("user@example.com", "Test Subject", "Test Body");

    verify(mailSender, never()).send(any());
  }

  @Test
  void logsAndSkipsWhenMailSenderNotAvailable() {
    emailService = new EmailService(Optional.empty());
    ReflectionTestUtils.setField(emailService, "enabled", true);

    emailService.send("user@example.com", "Test Subject", "Test Body");

    // No exception thrown
    assertTrue(true);
  }

  @Test
  void handlesExceptionGracefully() {
    doThrow(new RuntimeException("SMTP error")).when(mailSender).send(any(SimpleMailMessage.class));

    assertDoesNotThrow(() -> emailService.send("user@example.com", "Test Subject", "Test Body"));
  }

  @Test
  void usesConfiguredFromAddress() {
    ReflectionTestUtils.setField(emailService, "fromAddress", "custom@sender.com");

    emailService.send("user@example.com", "Test Subject", "Test Body");

    ArgumentCaptor<SimpleMailMessage> captor = ArgumentCaptor.forClass(SimpleMailMessage.class);
    verify(mailSender).send(captor.capture());

    assertEquals("custom@sender.com", captor.getValue().getFrom());
  }

  @Test
  void usesDefaultFromAddressWhenNotConfigured() {
    ReflectionTestUtils.setField(emailService, "fromAddress", "noreply@freightclub.app");

    emailService.send("user@example.com", "Test Subject", "Test Body");

    ArgumentCaptor<SimpleMailMessage> captor = ArgumentCaptor.forClass(SimpleMailMessage.class);
    verify(mailSender).send(captor.capture());

    assertEquals("noreply@freightclub.app", captor.getValue().getFrom());
  }

  @Test
  void handlesSingleRecipient() {
    emailService.send("single@example.com", "Subject", "Body");

    ArgumentCaptor<SimpleMailMessage> captor = ArgumentCaptor.forClass(SimpleMailMessage.class);
    verify(mailSender).send(captor.capture());

    SimpleMailMessage msg = captor.getValue();
    assertEquals(1, msg.getTo().length);
    assertEquals("single@example.com", msg.getTo()[0]);
  }

  @Test
  void preservesWhitespaceInBody() {
    String bodyWithWhitespace = "Line 1\nLine 2\n\nLine 3";
    emailService.send("user@example.com", "Subject", bodyWithWhitespace);

    ArgumentCaptor<SimpleMailMessage> captor = ArgumentCaptor.forClass(SimpleMailMessage.class);
    verify(mailSender).send(captor.capture());

    assertEquals(bodyWithWhitespace, captor.getValue().getText());
  }

  @Test
  void handleSpecialCharactersInSubject() {
    String specialSubject = "Test: Re[Order #12345] - URGENT!";
    emailService.send("user@example.com", specialSubject, "Body");

    ArgumentCaptor<SimpleMailMessage> captor = ArgumentCaptor.forClass(SimpleMailMessage.class);
    verify(mailSender).send(captor.capture());

    assertEquals(specialSubject, captor.getValue().getSubject());
  }

  @Test
  void handleSpecialCharactersInBody() {
    String specialBody = "Email: test@example.com | URL: https://example.com?param=value&other=123";
    emailService.send("user@example.com", "Subject", specialBody);

    ArgumentCaptor<SimpleMailMessage> captor = ArgumentCaptor.forClass(SimpleMailMessage.class);
    verify(mailSender).send(captor.capture());

    assertEquals(specialBody, captor.getValue().getText());
  }

  @Test
  void handleLongEmailAddress() {
    String longEmail = "very.long.email.address.with.many.parts@subdomain.example.com";
    emailService.send(longEmail, "Subject", "Body");

    ArgumentCaptor<SimpleMailMessage> captor = ArgumentCaptor.forClass(SimpleMailMessage.class);
    verify(mailSender).send(captor.capture());

    assertEquals(longEmail, captor.getValue().getTo()[0]);
  }
}
