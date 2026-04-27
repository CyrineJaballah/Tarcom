package com.tarcom.dossiers.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tarcom.dossiers.model.DocumentInfo;
import com.tarcom.dossiers.model.FicheRenseignement;
import com.tarcom.dossiers.model.Submission;
import com.tarcom.dossiers.service.FileStorageService;
import com.tarcom.dossiers.service.SubmissionService;
import org.bson.types.ObjectId;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

@RestController
@RequestMapping("/submissions")
public class SubmissionController {

    private final SubmissionService submissionService;
    private final FileStorageService fileStorageService;
    private final ObjectMapper objectMapper;

    public SubmissionController(SubmissionService submissionService, FileStorageService fileStorageService) {
        this.submissionService = submissionService;
        this.fileStorageService = fileStorageService;
        this.objectMapper = new ObjectMapper();
        this.objectMapper.findAndRegisterModules();
    }

    @PostMapping
    public ResponseEntity<?> createSubmission(MultipartHttpServletRequest request) {
        try {
            String firstName = request.getParameter("firstName");
            String lastName = request.getParameter("lastName");
            String email = request.getParameter("email");
            String phone = request.getParameter("phone");

            // Validate required fields
            if (firstName == null || firstName.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "error", "Le prénom est obligatoire"));
            }
            if (lastName == null || lastName.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "error", "Le nom est obligatoire"));
            }
            if (email == null || email.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "error", "L'email est obligatoire"));
            }

            Submission submission = new Submission();
            submission.setFirstName(firstName.trim());
            submission.setLastName(lastName.trim());
            submission.setEmail(email.trim());
            submission.setPhone(phone != null ? phone.trim() : "");
            submission.setSubmittedAt(LocalDateTime.now());

            // Create submission first (minimal info)
            Submission created = submissionService.createSubmission(submission);
            
            // Collect all documents (fiche + other documents)
            Map<String, DocumentInfo> documents = new HashMap<>();

            // Handle fiche file
            MultipartFile ficheFile = request.getFile("fiche");
            if (ficheFile != null && !ficheFile.isEmpty()) {
                ObjectId fileId = fileStorageService.storeFile(ficheFile, "fiche", created.getId().toString());
                DocumentInfo ficheInfo = new DocumentInfo();
                ficheInfo.setDocumentType("fiche");
                ficheInfo.setFileId(fileId);
                ficheInfo.setFileName(ficheFile.getOriginalFilename());
                ficheInfo.setFileSize(ficheFile.getSize());
                ficheInfo.setContentType(ficheFile.getContentType());
                ficheInfo.setUploadedAt(LocalDateTime.now());
                documents.put("fiche", ficheInfo);
            }

            // Handle other documents
            Iterator<String> fileNames = request.getFileNames();
            while (fileNames.hasNext()) {
                String paramName = fileNames.next();
                if (!paramName.startsWith("documents[")) {
                    continue;
                }

                String documentType = paramName.substring("documents[".length(), paramName.length() - 1);
                MultipartFile file = request.getFile(paramName);
                if (file == null || file.isEmpty()) {
                    continue;
                }

                ObjectId fileId = fileStorageService.storeFile(file, documentType, created.getId().toString());
                DocumentInfo documentInfo = new DocumentInfo();
                documentInfo.setDocumentType(documentType);
                documentInfo.setFileId(fileId);
                documentInfo.setFileName(file.getOriginalFilename());
                documentInfo.setFileSize(file.getSize());
                documentInfo.setContentType(file.getContentType());
                documentInfo.setUploadedAt(LocalDateTime.now());
                documents.put(documentType, documentInfo);
            }

            // Save all documents at once (single database write)
            if (!documents.isEmpty()) {
                created.setDocuments(documents);
                submissionService.saveSubmission(created);
            }

            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "success", true,
                "message", "Dossier soumis avec succès",
                "submissionId", created.getId() != null ? created.getId().toString() : ""
            ));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                "success", false,
                "error", "Erreur lors du traitement du fichier : " + e.getMessage()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "error", "Erreur serveur : " + e.getMessage()
            ));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateSubmission(@PathVariable String id, @RequestBody Submission body) {
        try {
            ObjectId objectId = new ObjectId(id);
            Submission updated = submissionService.updateSubmission(objectId, body);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}/archive")
    public ResponseEntity<?> archiveSubmission(@PathVariable String id, @RequestBody Map<String, String> body) {
        try {
            ObjectId objectId = new ObjectId(id);
            String archiveStatus = body.getOrDefault("archiveStatus", "approved");
            String reason = body.getOrDefault("reason", "");
            if (!archiveStatus.matches("approved|cancelled")) {
                return ResponseEntity.badRequest().body(Map.of("error", "Statut d'archive invalide"));
            }

            Submission archived = submissionService.archiveSubmission(objectId, archiveStatus, reason);
            return ResponseEntity.ok(archived);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getSubmission(@PathVariable String id) {
        try {
            ObjectId objectId = new ObjectId(id);
            return submissionService.getSubmissionById(objectId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "ID invalide"));
        }
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<?> getSubmissionByEmail(@PathVariable String email) {
        return submissionService.getSubmissionByEmail(email)
            .map(ResponseEntity::ok)
            .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<?> listSubmissions(
        @RequestParam(required = false, defaultValue = "pending") String status,
        @RequestParam(required = false, defaultValue = "false") boolean archived
    ) {
        if (archived) {
            return ResponseEntity.ok(submissionService.getArchivedSubmissions());
        }

        if ("all".equalsIgnoreCase(status)) {
            return ResponseEntity.ok(submissionService.getAllSubmissions());
        }

        return ResponseEntity.ok(submissionService.getSubmissionsByStatus(status));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable String id, @RequestBody Map<String, String> body) {
        try {
            ObjectId objectId = new ObjectId(id);
            String status = body.get("status");
            if (status == null || !status.matches("pending|approved|rejected|hold")) {
                return ResponseEntity.badRequest().body(Map.of("error", "Statut invalide"));
            }

            Submission updated = submissionService.updateStatus(objectId, status);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        SubmissionService.SubmissionStats stats = submissionService.getStatistics();
        return ResponseEntity.ok(stats);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSubmission(@PathVariable String id) {
        try {
            ObjectId objectId = new ObjectId(id);
            submissionService.deleteSubmission(objectId);
            return ResponseEntity.ok(Map.of("success", true, "message", "Soumission supprimée"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}/files/{fileId}")
    public ResponseEntity<?> deleteFile(@PathVariable String id, @PathVariable String fileId) {
        try {
            ObjectId submissionId = new ObjectId(id);
            Submission updated = submissionService.deleteFileFromSubmission(submissionId, fileId);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
