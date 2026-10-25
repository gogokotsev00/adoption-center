package com.dataCenter.adoptionCenter.services;

import com.dataCenter.adoptionCenter.entities.Notification;
import com.dataCenter.adoptionCenter.entities.NotificationEventType;
import com.dataCenter.adoptionCenter.entities.Owner;
import com.dataCenter.adoptionCenter.repositories.NotificationRepository;
import com.dataCenter.adoptionCenter.repositories.OwnerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationService {

	private final NotificationRepository notificationRepository;
	private final OwnerRepository ownerRepository;

	public NotificationService(NotificationRepository notificationRepository,
	                           OwnerRepository ownerRepository) {
		this.notificationRepository = notificationRepository;
		this.ownerRepository = ownerRepository;
	}

	public List<Notification> getAllNotifications() {
		return notificationRepository.findAllByOrderByCreatedAtDesc();
	}

	public List<Notification> getNotificationsByOwnerId(long ownerId) {
		return notificationRepository.findByOwnerIdOrderByCreatedAtDesc(ownerId);
	}

	@Transactional
	public Notification createNotification(long ownerId, NotificationEventType eventType, String message) {
		Owner owner = ownerRepository.findById(ownerId);
		if (owner == null) {
			throw new IllegalArgumentException("Owner not found with id: " + ownerId);
		}

		Notification notification = new Notification()
				.withOwner(owner)
				.withEventType(eventType)
				.withMessage(message)
				.withRead(false)
				.withCreatedAt(LocalDateTime.now());

		return notificationRepository.save(notification);
	}

	@Transactional
	public Notification markAsRead(long notificationId) {
		Notification notification = notificationRepository.findById(notificationId);
		if (notification == null) {
			throw new IllegalArgumentException("Notification not found with id: " + notificationId);
		}
		notification.setRead(true);
		return notificationRepository.save(notification);
	}

	@Transactional
	public List<Notification> markAllAsReadForOwner(long ownerId) {
		List<Notification> notifications = notificationRepository.findByOwnerIdOrderByCreatedAtDesc(ownerId);
		for (Notification notification : notifications) {
			if (!notification.isRead()) {
				notification.setRead(true);
				notificationRepository.save(notification);
			}
		}
		return notifications;
	}
}
