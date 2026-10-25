package com.dataCenter.adoptionCenter.kafka;

import com.dataCenter.adoptionCenter.entities.NotificationEventType;
import com.dataCenter.adoptionCenter.services.NotificationService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class NotificationEventConsumerTest {

	@Mock
	private NotificationService notificationService;

	@InjectMocks
	private NotificationEventConsumer consumer;

	@Test
	void testConsume_DogPurchaseCompleted() {
		AdoptionNotificationEvent event = new AdoptionNotificationEvent(
				NotificationEventType.DOG_PURCHASE_COMPLETED,
				100L,
				1L,
				"Alice",
				10L,
				"Buddy",
				50.0,
				150.0,
				"2026-10-25T21:00:00"
		);

		consumer.consume(event);

		verify(notificationService).createNotification(
				1L,
				NotificationEventType.DOG_PURCHASE_COMPLETED,
				"Congratulations Alice! Your purchase of Buddy (Application #100) for $50.00 is complete. Remaining balance: $150.00."
		);
	}
}
