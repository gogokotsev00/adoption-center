package com.dataCenter.demo.entities;

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

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name="dog_owner_id", referencedColumnName = "owner_id", nullable = false)
	Owner owner;
}
