package com.dataCenter.adoptionCenter.controllers;

import com.dataCenter.adoptionCenter.entities.AdoptionApplication;
import com.dataCenter.adoptionCenter.services.AdoptionApplicationService;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.graphql.data.method.annotation.SchemaMapping;
import org.springframework.stereotype.Controller;

import java.util.List;

@Controller
public class AdoptionApplicationController {

	private final AdoptionApplicationService applicationService;

	public AdoptionApplicationController(AdoptionApplicationService applicationService) {
		this.applicationService = applicationService;
	}

	@QueryMapping
	public List<AdoptionApplication> applications() {
		return applicationService.getAllApplications();
	}

	@QueryMapping
	public AdoptionApplication applicationById(@Argument long id) {
		return applicationService.getApplicationById(id);
	}

	@QueryMapping
	public List<AdoptionApplication> applicationsByOwnerId(@Argument long ownerId) {
		return applicationService.getApplicationsByOwnerId(ownerId);
	}

	@MutationMapping
	public AdoptionApplication createAdoptionApplication(@Argument long ownerId, @Argument long dogId) {
		return applicationService.createApplication(ownerId, dogId);
	}

	@MutationMapping
	public AdoptionApplication approveAdoptionApplication(@Argument long id) {
		return applicationService.approveApplication(id);
	}

	@MutationMapping
	public AdoptionApplication rejectAdoptionApplication(@Argument long id) {
		return applicationService.rejectApplication(id);
	}

	@SchemaMapping(typeName = "AdoptionApplication", field = "createdAt")
	public String createdAt(AdoptionApplication application) {
		return application.getCreatedAt() != null ? application.getCreatedAt().toString() : null;
	}
}
