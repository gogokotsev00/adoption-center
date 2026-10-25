package com.dataCenter.adoptionCenter.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@With
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(schema = "center", name = "notification")
public class Notification {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "notification_id")
	long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "owner_id", referencedColumnName = "owner_id", nullable = false)
	Owner owner;

	@Enumerated(EnumType.STRING)
	@Column(name = "event_type", nullable = false)
	NotificationEventType eventType;

	@Column(name = "message", nullable = false)
	String message;

	@Column(name = "is_read", nullable = false)
	boolean read = false;

	@Column(name = "created_at")
	LocalDateTime createdAt = LocalDateTime.now();
}
