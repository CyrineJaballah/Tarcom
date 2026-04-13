package com.tarcom.dossiers.repository;

import com.tarcom.dossiers.model.Submission;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;
import org.bson.types.ObjectId;
import java.util.List;
import java.util.Optional;
import java.time.LocalDateTime;

@Repository
public interface SubmissionRepository extends MongoRepository<Submission, ObjectId> {
    
    // Trouver par email
    Optional<Submission> findByEmail(String email);
    
    // Trouver tous les dossiers d'un utilisateur
    List<Submission> findByFirstNameAndLastName(String firstName, String lastName);
    
    // Trouver par statut
    List<Submission> findByStatus(String status);

    // Trouver par statut avec pagination
    List<Submission> findByStatusOrderBySubmittedAtDesc(String status);

    @Query("{ $or: [ { 'archived': false }, { 'archived': { $exists: false } } ] }")
    List<Submission> findByArchivedFalseOrderBySubmittedAtDesc();

    List<Submission> findByArchivedTrueOrderByArchivedAtDesc();

    @Query("{ $and: [ { 'status': ?0 }, { $or: [ { 'archived': false }, { 'archived': { $exists: false } } ] } ] }")
    List<Submission> findByArchivedFalseAndStatusOrderBySubmittedAtDesc(String status);

    // Trouver les dossiers soumis entre deux dates
    List<Submission> findBySubmittedAtBetweenOrderBySubmittedAtDesc(LocalDateTime start, LocalDateTime end);
    
    // Compter par statut
    long countByStatus(String status);

    long countByArchivedTrue();

    long countByArchivedTrueAndArchiveStatus(String archiveStatus);
    
    // Recherche personnalisée
    @Query("{ 'email' : ?0, 'status' : ?1 }")
    Optional<Submission> findByEmailAndStatus(String email, String status);
    
    // Trouver les dossiers non révisés
    @Query("{ 'status' : 'pending', 'reviewedAt' : null }")
    List<Submission> findPendingReviews();
    
    // Getters et Setters (générés par Spring Data)
}
