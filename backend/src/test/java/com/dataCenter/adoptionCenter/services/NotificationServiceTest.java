package com.dataCenter.adoptionCenter.services;

import com.dataCenter.adoptionCenter.entities.Notification;
import com.dataCenter.adoptionCenter.entities.NotificationEventType;
import com.dataCenter.adoptionCenter.entities.Owner;
import com.dataCenter.adoptionCenter.repositories.NotificationRepository;
import com.dataCenter.adoptionCenter.repositories.OwnerRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

	@Mock
	private NotificationRepository notificationRepository;

	@Mock
	private OwnerRepository ownerRepository;

	@InjectMocks
	private NotificationService notificationService;

	private Owner owner;

	@BeforeEach
	void setUp() {
		owner = new Owner().withId(1L).withName("Alice").withMoney(150.0);
	}

	@Test
	void testCreateNotification_Success() {
		when(ownerRepository.findById(1L)).thenReturn(owner);
		when(notificationRepository.save(any(Notification.class))).thenAnswer(inv -> inv.getArgument(0));

		Notification notification = notificationService.createNotification(
				1L,
				NotificationEventType.DOG_PURCHASE_COMPLETED,
				"Purchase complete!"
		);

		assertNotNull(notification);
		assertEquals(owner, notification.getOwner());
		assertEquals(NotificationEventType.DOG_PURCHASE_COMPLETED, notification.getEventType());
		assertEquals("Purchase complete!", notification.getMessage());
		assertFalse(notification.isRead());
		verify(notificationRepository).save(any(Notification.class));
	}

	@Test
	void testMarkAsRead_Success() {
		Notification notification = new Notification()
				.withId(5L)
				.withOwner(owner)
				.withEventType(NotificationEventType.DOG_PURCHASE_COMPLETED)
				.withMessage("Purchase complete!")
				.withRead(false);

		when(notificationRepository.findById(5L)).thenReturn(notification);
		when(notificationRepository.save(any(Notification.class))).thenAnswer(inv -> inv.getArgument(0));

		Notification updated = notificationService.markAsRead(5L);

		assertTrue(updated.isRead());
		verify(notificationRepository).save(notification);
	}

	@Test
	void testMarkAllAsReadForOwner() {
		Notification n1 = new Notification().withId(1L).withOwner(owner).withRead(false);
		Notification n2 = new Notification().withId(2L).withOwner(owner).withRead(true);

		when(notificationRepository.findByOwnerIdOrderByCreatedAtDesc(1L)).thenReturn(List.of(n1, n2));

		List<Notification> result = notificationService.markAllAsReadForOwner(1L);

		assertEquals(2, result.size());
		assertTrue(n1.isRead());
		assertTrue(n2.isRead());
		verify(notificationRepository, times(1)).save(n1);
		verify(notificationRepository, never()).save(n2);
	}
}
