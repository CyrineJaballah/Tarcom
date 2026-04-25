package com.tarcom.dossiers.service;

import com.tarcom.dossiers.model.Submission;
import com.tarcom.dossiers.repository.SubmissionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.bson.types.ObjectId;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class SubmissionService {
    
    @Autowired
    private SubmissionRepository submissionRepository;
    
    /**
     * Créer une nouvelle soumission
     */
    public Submission createSubmission(Submission submission) {
        submission.setCreatedAt(LocalDateTime.now());
        submission.setUpdatedAt(LocalDateTime.now());
        submission.setStatus("pending");
        submission.setArchived(false);
        return submissionRepository.save(submission);
    }
    
    /**
     * Enregistrer une soumission existante
     */
    public Submission saveSubmission(Submission submission) {
        submission.setUpdatedAt(LocalDateTime.now());
        return submissionRepository.save(submission);
    }
    
    /**
     * Obtenir toutes les soumissions
     */
    public List<Submission> getAllSubmissions() {
        return submissionRepository.findByArchivedFalseOrderBySubmittedAtDesc();
    }

    public List<Submission> getArchivedSubmissions() {
        return submissionRepository.findByArchivedTrueOrderByArchivedAtDesc();
    }
    
    /**
     * Obtenir une soumission par ID
     */
    @java.lang.SuppressWarnings("null")
    public Optional<Submission> getSubmissionById(ObjectId id) {
        return submissionRepository.findById(id);
    }
    
    /**
     * Obtenir une soumission par email
     */
    public Optional<Submission> getSubmissionByEmail(String email) {
        return submissionRepository.findByEmail(email);
    }
    
    /**
     * Mettre à jour une soumission
     */
    @java.lang.SuppressWarnings("null")
    public Submission updateSubmission(ObjectId id, Submission submission) {
        Optional<Submission> existing = submissionRepository.findById(id);
        
        if (existing.isPresent()) {
            Submission toUpdate = existing.get();
            toUpdate.setFirstName(submission.getFirstName());
            toUpdate.setLastName(submission.getLastName());
            toUpdate.setEmail(submission.getEmail());
            toUpdate.setPhone(submission.getPhone());
            toUpdate.setFicheRenseignement(submission.getFicheRenseignement());
            toUpdate.setDocuments(submission.getDocuments());
            return saveSubmission(toUpdate);
        }
        
        throw new RuntimeException("Submission not found");
    }
    
    /**
     * Mettre à jour le statut
     */
    @java.lang.SuppressWarnings("null")
    public Submission updateStatus(ObjectId id, String status) {
        Optional<Submission> existing = submissionRepository.findById(id);
        
        if (existing.isPresent()) {
            Submission submission = existing.get();
            submission.setStatus(status);
            submission.setReviewedAt(LocalDateTime.now());
            return saveSubmission(submission);
        }
        
        throw new RuntimeException("Submission not found");
    }

    @java.lang.SuppressWarnings("null")
    public Submission archiveSubmission(ObjectId id, String archiveStatus, String reason) {
        Optional<Submission> existing = submissionRepository.findById(id);

        if (existing.isPresent()) {
            Submission submission = existing.get();
            submission.setArchived(true);
            submission.setArchiveStatus(archiveStatus);
            submission.setArchiveReason(reason);
            submission.setArchivedAt(LocalDateTime.now());
            return saveSubmission(submission);
        }

        throw new RuntimeException("Submission not found");
    }
    
    /**
     * Supprimer une soumission
     */
    @java.lang.SuppressWarnings("null")
    public void deleteSubmission(ObjectId id) {
        submissionRepository.deleteById(id);
    }

    /**
     * Supprimer un fichier spécifique d'une soumission
     */
    @java.lang.SuppressWarnings("null")
    public Submission deleteFileFromSubmission(ObjectId submissionId, String fileId) {
        Optional<Submission> existing = submissionRepository.findById(submissionId);
        if (existing.isPresent()) {
            Submission submission = existing.get();
            if (submission.getDocuments() != null) {
                submission.getDocuments().entrySet().removeIf(entry -> 
                    entry.getValue().getFileId().toString().equals(fileId)
                );
                return saveSubmission(submission);
            }
        }
        throw new RuntimeException("Submission or file not found");
    }
    
    /**
     * Obtenir toutes les soumissions par statut
     */
    public List<Submission> getSubmissionsByStatus(String status) {
        return submissionRepository.findByStatusOrderBySubmittedAtDesc(status);
    }
    
    /**
     * Obtenir les dossiers en attente de révision
     */
    public List<Submission> getPendingSubmissions() {
        return submissionRepository.findByStatus("pending");
    }
    

    
    /**
     * Compter les dossiers par statut
     */
    public long countByStatus(String status) {
        return submissionRepository.countByStatus(status);
    }
    
    /**
     * Obtenir les statistiques
     */
    public SubmissionStats getStatistics() {
        return new SubmissionStats(
            submissionRepository.count(),
            submissionRepository.countByStatus("pending"),
            submissionRepository.countByStatus("approved"),
            submissionRepository.countByStatus("rejected"),
            submissionRepository.countByStatus("hold")
        );
    }
    
    // Classe interne pour les statistiques
    public static class SubmissionStats {
        public long total;
        public long pending;
        public long approved;
        public long rejected;
        public long hold;
        
        public SubmissionStats(long total, long pending, long approved, long rejected, long hold) {
            this.total = total;
            this.pending = pending;
            this.approved = approved;
            this.rejected = rejected;
            this.hold = hold;
        }
    }
}
