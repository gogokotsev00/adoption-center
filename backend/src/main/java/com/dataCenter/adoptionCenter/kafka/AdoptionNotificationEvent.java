package com.dataCenter.adoptionCenter.kafka;

import com.dataCenter.adoptionCenter.entities.NotificationEventType;

public record AdoptionNotificationEvent(
		NotificationEventType eventType,
		long applicationId,
		long ownerId,
		String ownerName,
		long dogId,
		String dogName,
		double fee,
		double remainingMoney,
		String occurredAt
) {
}
