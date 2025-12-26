package com.dataCenter.adoptionCenter.controllers;

import com.dataCenter.adoptionCenter.entities.Owner;
import com.dataCenter.adoptionCenter.services.OwnerService;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import java.util.List;

@Controller
public class OwnerController {

	private final OwnerService ownerService;

	public OwnerController(OwnerService ownerService) {
		this.ownerService = ownerService;
	}

	@QueryMapping
	public List<Owner> owners() {
		return ownerService.getAllOwners();
	}

	@QueryMapping
	public Owner ownerById(@Argument long id) {
		return ownerService.getOwnerById(id);
	}

	@MutationMapping
	public Owner createOwner(@Argument String name, @Argument double money) {
		Owner owner = new Owner().withMoney(money).withName(name);
		return ownerService.createOwner(owner);
	}

	@MutationMapping
	public int deleteOwnerById(@Argument long id) {
		return ownerService.deleteOwnerById(id);
	}

	@MutationMapping
	public Owner updateOwnerMoney(@Argument long id, @Argument double money) {
		return ownerService.updateOwnerMoney(id, money);
	}
}
