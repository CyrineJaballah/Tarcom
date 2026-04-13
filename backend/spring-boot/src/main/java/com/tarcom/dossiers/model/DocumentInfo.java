package com.tarcom.dossiers.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import org.bson.types.ObjectId;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DocumentInfo {
    
    @JsonProperty("documentType")
    private String documentType;
    
    @JsonProperty("fileId")
    @JsonSerialize(using = ToStringSerializer.class)
    private ObjectId fileId;  // Référence au fichier GridFS
    
    @JsonProperty("fileName")
    private String fileName;
    
    @JsonProperty("fileSize")
    private Long fileSize;
    
    @JsonProperty("contentType")
    private String contentType;
    
    @JsonProperty("uploadedAt")
    private LocalDateTime uploadedAt = LocalDateTime.now();
    
    @JsonProperty("status")
    private String status = "uploaded"; // "uploaded", "scanned", "validated"
    
    // Getters et Setters (générés par Lombok)
}
