package com.freightclub.service;

import com.freightclub.domain.User;
import com.freightclub.domain.UserRole;
import com.freightclub.dto.LoginRequest;
import com.freightclub.dto.RegisterRequest;
import com.freightclub.exception.EmailAlreadyExistsException;
import com.freightclub.repository.UserRepository;
import com.freightclub.security.JwtService;
import com.freightclub.security.RefreshTokenService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;

    @Value("${app.default-tenant-id}")
    private String defaultTenantId;

    public AuthService(UserRepository userRepository,
                       JwtService jwtService,
                       RefreshTokenService refreshTokenService,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.refreshTokenService = refreshTokenService;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
    }

    public AuthResult register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new EmailAlreadyExistsException(request.email());
        }

        User user = new User();
        user.setTenantId(defaultTenantId);
        user.setEmail(request.email());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRole(request.role());
        user.setFirstName(request.firstName());
        user.setLastName(request.lastName());

        userRepository.save(user);

        String accessToken = jwtService.generateAccessToken(user);
        String rawRefreshToken = refreshTokenService.createRefreshToken(user.getId());

        return new AuthResult(accessToken, rawRefreshToken, user);
    }

    public AuthResult login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );

        User user = userRepository.findByEmailAndDeletedAtIsNull(request.email())
                .orElseThrow(() -> new IllegalStateException("User disappeared after authentication"));

        String accessToken = jwtService.generateAccessToken(user);
        String rawRefreshToken = refreshTokenService.createRefreshToken(user.getId());

        return new AuthResult(accessToken, rawRefreshToken, user);
    }

    public RefreshResult refresh(String rawRefreshToken) {
        RefreshTokenService.RotationResult rotation = refreshTokenService.rotateRefreshToken(rawRefreshToken);

        User user = userRepository.findById(rotation.userId())
                .orElseThrow(() -> new IllegalStateException("User not found for refresh token"));

        String newAccessToken = jwtService.generateAccessToken(user);

        return new RefreshResult(newAccessToken, rotation.newRawToken());
    }

    public void logout(String userId) {
        refreshTokenService.revokeAllForUser(userId);
    }

    public long accessTokenExpirySeconds() {
        return jwtService.getAccessTokenExpiryMs() / 1000;
    }

    public record AuthResult(String accessToken, String rawRefreshToken, User user) {}
    public record RefreshResult(String accessToken, String rawRefreshToken) {}
}
