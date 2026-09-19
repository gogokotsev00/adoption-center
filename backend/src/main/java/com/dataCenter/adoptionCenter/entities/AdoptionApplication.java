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
@Table(schema = "center", name = "adoption_application")
public class AdoptionApplication {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "application_id")
	long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "owner_id", referencedColumnName = "owner_id", nullable = false)
	Owner owner;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "dog_id", referencedColumnName = "dog_id", nullable = false)
	Dog dog;

	@Enumerated(EnumType.STRING)
	@Column(name = "status", nullable = false)
	ApplicationStatus status = ApplicationStatus.PENDING;

	@Column(name = "created_at")
	LocalDateTime createdAt = LocalDateTime.now();
}
