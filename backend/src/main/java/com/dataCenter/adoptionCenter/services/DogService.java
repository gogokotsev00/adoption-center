package com.dataCenter.adoptionCenter.services;

import com.dataCenter.adoptionCenter.entities.Dog;
import com.dataCenter.adoptionCenter.repositories.DogRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DogService {

	private final DogRepository dogRepository;

	public DogService(DogRepository dogRepository) {
		this.dogRepository = dogRepository;
	}

	public List<Dog> getAllDogs() {
		return dogRepository.findAll();
	}

	public Dog getDogById(long id) {
		return dogRepository.findById(id);
	}

	public List<Dog> getDogsByOwnerId(long ownerId) {
		return dogRepository.findByOwnerId(ownerId);
	}

	public Dog createDog(Dog dog) {
		return dogRepository.save(dog);
	}
}
