package com.dataCenter.adoptionCenter.services;

import com.dataCenter.adoptionCenter.entities.AdoptionApplication;
import com.dataCenter.adoptionCenter.entities.ApplicationStatus;
import com.dataCenter.adoptionCenter.entities.Dog;
import com.dataCenter.adoptionCenter.entities.DogStatus;
import com.dataCenter.adoptionCenter.entities.Owner;
import com.dataCenter.adoptionCenter.repositories.AdoptionApplicationRepository;
import com.dataCenter.adoptionCenter.repositories.DogRepository;
import com.dataCenter.adoptionCenter.repositories.OwnerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AdoptionApplicationService {

	private final AdoptionApplicationRepository applicationRepository;
	private final DogRepository dogRepository;
	private final OwnerRepository ownerRepository;

	public AdoptionApplicationService(AdoptionApplicationRepository applicationRepository,
	                                 DogRepository dogRepository,
	                                 OwnerRepository ownerRepository) {
		this.applicationRepository = applicationRepository;
		this.dogRepository = dogRepository;
		this.ownerRepository = ownerRepository;
	}

	public List<AdoptionApplication> getAllApplications() {
		return applicationRepository.findAll();
	}

	public AdoptionApplication getApplicationById(long id) {
		return applicationRepository.findById(id);
	}

	public List<AdoptionApplication> getApplicationsByOwnerId(long ownerId) {
		return applicationRepository.findByOwnerId(ownerId);
	}

	@Transactional
	public AdoptionApplication createApplication(long ownerId, long dogId) {
		Owner owner = ownerRepository.findById(ownerId);
		if (owner == null) {
			throw new IllegalArgumentException("Owner not found with id: " + ownerId);
		}

		Dog dog = dogRepository.findById(dogId);
		if (dog == null) {
			throw new IllegalArgumentException("Dog not found with id: " + dogId);
		}

		if (dog.getStatus() != DogStatus.AVAILABLE) {
			throw new IllegalStateException("Dog is not available for adoption (status: " + dog.getStatus() + ")");
		}

		dog.setStatus(DogStatus.PENDING);
		dogRepository.save(dog);

		AdoptionApplication application = new AdoptionApplication()
				.withOwner(owner)
				.withDog(dog)
				.withStatus(ApplicationStatus.PENDING)
				.withCreatedAt(LocalDateTime.now());

		return applicationRepository.save(application);
	}

	@Transactional
	public AdoptionApplication approveApplication(long applicationId) {
		AdoptionApplication application = applicationRepository.findById(applicationId);
		if (application == null) {
			throw new IllegalArgumentException("Application not found with id: " + applicationId);
		}

		if (application.getStatus() != ApplicationStatus.PENDING) {
			throw new IllegalStateException("Application is not in PENDING status: " + application.getStatus());
		}

		Dog dog = application.getDog();
		Owner owner = application.getOwner();

		if (owner.getMoney() < dog.getFee()) {
			throw new IllegalStateException("Owner has insufficient funds (" + owner.getMoney() + ") for adoption fee (" + dog.getFee() + ")");
		}

		owner.setMoney(owner.getMoney() - dog.getFee());
		ownerRepository.save(owner);

		dog.setOwner(owner);
		dog.setStatus(DogStatus.ADOPTED);
		dogRepository.save(dog);

		application.setStatus(ApplicationStatus.APPROVED);
		return applicationRepository.save(application);
	}

	@Transactional
	public AdoptionApplication rejectApplication(long applicationId) {
		AdoptionApplication application = applicationRepository.findById(applicationId);
		if (application == null) {
			throw new IllegalArgumentException("Application not found with id: " + applicationId);
		}

		if (application.getStatus() != ApplicationStatus.PENDING) {
			throw new IllegalStateException("Application is not in PENDING status: " + application.getStatus());
		}

		Dog dog = application.getDog();
		if (dog.getStatus() == DogStatus.PENDING) {
			dog.setStatus(DogStatus.AVAILABLE);
			dogRepository.save(dog);
		}

		application.setStatus(ApplicationStatus.REJECTED);
		return applicationRepository.save(application);
	}
}
