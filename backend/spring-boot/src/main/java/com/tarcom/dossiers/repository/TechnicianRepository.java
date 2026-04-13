package com.tarcom.dossiers.repository;

import com.tarcom.dossiers.model.Technician;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TechnicianRepository extends MongoRepository<Technician, ObjectId> {
    List<Technician> findByActiveTrueOrderByCreatedAtDesc();
}
