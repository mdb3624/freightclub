package com.freightclub.service;

import com.freightclub.domain.User;
import com.freightclub.dto.ProfileResponse;
import com.freightclub.dto.UpdateProfileRequest;
import com.freightclub.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ProfileService {

    private final UserRepository userRepository;

    public ProfileService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public ProfileResponse getProfile(String userId) {
        User user = findUser(userId);
        return ProfileResponse.from(user);
    }

    public ProfileResponse updateProfile(String userId, UpdateProfileRequest request) {
        User user = findUser(userId);
        user.setFirstName(request.firstName());
        user.setLastName(request.lastName());
        user.setBusinessName(request.businessName());
        user.setPhone(request.phone());
        user.setBillingAddress(request.billingAddress());
        user.setBillingCity(request.billingCity());
        user.setBillingState(request.billingState());
        user.setBillingZip(request.billingZip());
        user.setDefaultPickupAddress(request.defaultPickupAddress());
        user.setDefaultPickupCity(request.defaultPickupCity());
        user.setDefaultPickupState(request.defaultPickupState());
        user.setDefaultPickupZip(request.defaultPickupZip());
        user.setNotifyEmail(request.notifyEmail());
        user.setNotifySms(request.notifySms());
        user.setNotifyInApp(request.notifyInApp());
        return ProfileResponse.from(userRepository.save(user));
    }

    private User findUser(String userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalStateException("User not found: " + userId));
    }
}
