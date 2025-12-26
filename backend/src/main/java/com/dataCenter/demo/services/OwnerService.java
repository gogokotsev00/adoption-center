package com.dataCenter.demo.services;

import com.dataCenter.demo.entities.Owner;
import com.dataCenter.demo.repositories.OwnerRepository;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OwnerService {

	private final OwnerRepository ownerRepository;

	public OwnerService(OwnerRepository ownerRepository) {
		this.ownerRepository = ownerRepository;
	}

	public List<Owner> getAllOwners() {
		return ownerRepository.findAll();
	}

	public Owner getOwnerById(long id) {
		return ownerRepository.findById(id);
	}

	public Owner createOwner(Owner dog) {
		return ownerRepository.save(dog);
	}

	public int deleteOwnerById(long id) {
		return ownerRepository.deleteOwnerById(id);
	}

	public Owner updateOwnerMoney(long id, double money) {
		Owner dbOwner = ownerRepository.findById(id);
		dbOwner.setMoney(money);
		return ownerRepository.save(dbOwner);
	}
}
