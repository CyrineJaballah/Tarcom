package com.tarcom.dossiers.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.Map;
import org.bson.types.ObjectId;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "submissions")
public class Submission {
    
    @Id
    @JsonSerialize(using = ToStringSerializer.class)
    private ObjectId id;
    
    // Informations personnelles (Étape 1)
    @JsonProperty("firstName")
    private String firstName;
    
    @JsonProperty("lastName")
    private String lastName;
    
    @JsonProperty("email")
    private String email;
    
    @JsonProperty("phone")
    private String phone;
    
    // Fiche de Renseignement (Étape 2)
    @JsonProperty("ficheRenseignement")
    private FicheRenseignement ficheRenseignement;
    
    // Documents (Étape 3)
    @JsonProperty("documents")
    private Map<String, DocumentInfo> documents;
    
    // Métadonnées
    @JsonProperty("status")
    private String status = "pending"; // "pending", "approved", "rejected"

    @JsonProperty("archived")
    private Boolean archived = false;

    @JsonProperty("archiveStatus")
    private String archiveStatus;

    @JsonProperty("archiveReason")
    private String archiveReason;

    @JsonProperty("archivedAt")
    private LocalDateTime archivedAt;
    
    @JsonProperty("submittedAt")
    private LocalDateTime submittedAt;
    
    @JsonProperty("reviewedAt")
    private LocalDateTime reviewedAt;
    
    @JsonProperty("notes")
    private String notes;
    
    @JsonProperty("createdAt")
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @JsonProperty("updatedAt")
    private LocalDateTime updatedAt = LocalDateTime.now();
    
    // Getters et Setters (générés par Lombok)
}
