package com.dataCenter.adoptionCenter.kafka;

import com.dataCenter.adoptionCenter.services.NotificationService;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.Locale;

@Component
public class NotificationEventConsumer {

	private final NotificationService notificationService;

	public NotificationEventConsumer(NotificationService notificationService) {
		this.notificationService = notificationService;
	}

	@KafkaListener(
			topics = "${adoption.events.topic:adoption-events}",
			groupId = "${spring.kafka.consumer.group-id:adoption-notification-group}"
	)
	public void consume(AdoptionNotificationEvent event) {
		String message = switch (event.eventType()) {
			case DOG_PURCHASE_COMPLETED -> String.format(
					Locale.US,
					"Congratulations %s! Your purchase of %s (Application #%d) for $%.2f is complete. Remaining balance: $%.2f.",
					event.ownerName(),
					event.dogName(),
					event.applicationId(),
					event.fee(),
					event.remainingMoney()
			);
		};

		notificationService.createNotification(event.ownerId(), event.eventType(), message);
	}
}
