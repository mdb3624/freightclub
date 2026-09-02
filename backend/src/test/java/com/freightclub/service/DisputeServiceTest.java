package com.freightclub.service;

import com.freightclub.domain.Dispute;
import com.freightclub.domain.User;
import com.freightclub.dto.RaiseDisputeRequest;
import com.freightclub.repository.DisputeRepository;
import com.freightclub.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.lang.reflect.Field;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DisputeServiceTest {

    @Mock private DisputeRepository disputeRepository;
    @Mock private UserRepository userRepository;

    @InjectMocks
    private DisputeService disputeService;

    private static void setField(Object target, String name, Object value) {
        try {
            Field f = target.getClass().getDeclaredField(name);
            f.setAccessible(true);
            f.set(target, value);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Test
    void raisesDispute_scopedToRaisingUsersTenant() {
        User user = new User();
        setField(user, "id", "user-1");
        user.setTenantId("tenant-1");
        when(userRepository.findById("user-1")).thenReturn(Optional.of(user));

        disputeService.raiseDispute("user-1", new RaiseDisputeRequest("load-1", "Load arrived damaged"));

        ArgumentCaptor<Dispute> captor = ArgumentCaptor.forClass(Dispute.class);
        verify(disputeRepository).save(captor.capture());
        Dispute saved = captor.getValue();
        assertThat(saved.getTenantId()).isEqualTo("tenant-1");
        assertThat(saved.getLoadId()).isEqualTo("load-1");
        assertThat(saved.getRaisedByUserId()).isEqualTo("user-1");
        assertThat(saved.getReason()).isEqualTo("Load arrived damaged");
    }
}
