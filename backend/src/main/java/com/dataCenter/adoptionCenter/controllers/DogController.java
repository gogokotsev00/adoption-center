package com.dataCenter.adoptionCenter.controllers;

import com.dataCenter.adoptionCenter.entities.Dog;
import com.dataCenter.adoptionCenter.entities.DogStatus;
import com.dataCenter.adoptionCenter.entities.Owner;
import com.dataCenter.adoptionCenter.services.DogService;
import com.dataCenter.adoptionCenter.services.OwnerService;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import java.util.List;

@Controller
public class DogController {

	private final DogService dogService;
	private final OwnerService ownerService;

	public DogController(DogService dogService, OwnerService ownerService) {
		this.dogService = dogService;
		this.ownerService = ownerService;
	}

	@QueryMapping
	public List<Dog> dogs() {
		return dogService.getAllDogs();
	}

	@QueryMapping
	public Dog dogById(@Argument long id) {
		return dogService.getDogById(id);
	}

	@QueryMapping
	public List<Dog> dogsByOwnerId(@Argument long ownerId) {
		return dogService.getDogsByOwnerId(ownerId);
	}

	@MutationMapping
	public Dog createDog(@Argument String name,
	                     @Argument int age,
	                     @Argument(name = "ownerId") Long ownerId,
	                     @Argument(name = "fee") Double fee,
	                     @Argument(name = "status") DogStatus status) {
		Owner owner = null;
		if (ownerId != null) {
			owner = ownerService.getOwnerById(ownerId);
		}
		double actualFee = (fee != null) ? fee : 0.0;
		DogStatus actualStatus = (status != null) ? status : (owner != null ? DogStatus.ADOPTED : DogStatus.AVAILABLE);

		Dog dog = new Dog()
				.withAge(age)
				.withName(name)
				.withFee(actualFee)
				.withStatus(actualStatus)
				.withOwner(owner);
		return dogService.createDog(dog);
	}
}
