package com.freightclub.security;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    private final LoginLookupRepository loginLookupRepository;

    public UserDetailsServiceImpl(LoginLookupRepository loginLookupRepository) {
        this.loginLookupRepository = loginLookupRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        LoginLookupCredentials credentials = loginLookupRepository.findUserByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));

        return new AuthenticatedUserPrincipal(
                credentials.userId(),
                credentials.tenantId(),
                credentials.email(),
                credentials.passwordHash(),
                List.of(new SimpleGrantedAuthority("ROLE_" + credentials.role().name()))
        );
    }
}
