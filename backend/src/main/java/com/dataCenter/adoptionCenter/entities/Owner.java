package com.dataCenter.adoptionCenter.entities;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Getter
@Setter
@With
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(schema = "center", name = "owner")
public class Owner {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "owner_id")
	long id;

	@Column(name = "owner_name", nullable = false)
	String name;

	@Column(name="owner_money", nullable = false)
	double money;

	@OneToMany(mappedBy = "owner", cascade = CascadeType.ALL)
	private List<Dog> dog;
}
