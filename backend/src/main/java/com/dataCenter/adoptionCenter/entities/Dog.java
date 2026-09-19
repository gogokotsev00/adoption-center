package com.dataCenter.adoptionCenter.entities;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@With
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(schema = "center", name = "dog")
public class Dog {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "dog_id")
	long id;

	@Column(name = "dog_name", nullable = false)
	String name;

	@Column(name = "dog_age", nullable = false)
	int age;

	@Column(name = "dog_fee", nullable = false)
	double fee;

	@Enumerated(EnumType.STRING)
	@Column(name = "dog_status", nullable = false, length = 35)
	DogStatus status = DogStatus.AVAILABLE;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "dog_owner_id", referencedColumnName = "owner_id")
	Owner owner;
}
