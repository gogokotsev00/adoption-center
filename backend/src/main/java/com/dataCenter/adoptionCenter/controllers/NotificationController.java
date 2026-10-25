package com.dataCenter.adoptionCenter.controllers;

import com.dataCenter.adoptionCenter.entities.Notification;
import com.dataCenter.adoptionCenter.services.NotificationService;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.graphql.data.method.annotation.SchemaMapping;
import org.springframework.stereotype.Controller;

import java.util.List;

@Controller
public class NotificationController {

	private final NotificationService notificationService;

	public NotificationController(NotificationService notificationService) {
		this.notificationService = notificationService;
	}

	@QueryMapping
	public List<Notification> notifications() {
		return notificationService.getAllNotifications();
	}

	@QueryMapping
	public List<Notification> notificationsByOwnerId(@Argument long ownerId) {
		return notificationService.getNotificationsByOwnerId(ownerId);
	}

	@MutationMapping
	public Notification markNotificationAsRead(@Argument long id) {
		return notificationService.markAsRead(id);
	}

	@MutationMapping
	public List<Notification> markAllNotificationsAsRead(@Argument long ownerId) {
		return notificationService.markAllAsReadForOwner(ownerId);
	}

	@SchemaMapping(typeName = "Notification", field = "createdAt")
	public String createdAt(Notification notification) {
		return notification.getCreatedAt() != null ? notification.getCreatedAt().toString() : null;
	}
}
