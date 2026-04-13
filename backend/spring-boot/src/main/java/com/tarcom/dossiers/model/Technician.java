package com.tarcom.dossiers.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "technicians")
public class Technician {

    @Id
    @JsonProperty("id")
    private ObjectId id;

    @JsonProperty("name")
    private String name;

    @JsonProperty("email")
    private String email;

    @JsonProperty("phone")
    private String phone;

    @JsonProperty("role")
    private String role; // SAV or D3/D1

    @JsonProperty("subdivision")
    private String subdivision;

    @JsonProperty("active")
    private Boolean active = true;

    @JsonProperty("createdAt")
    private LocalDateTime createdAt = LocalDateTime.now();

    @JsonProperty("updatedAt")
    private LocalDateTime updatedAt = LocalDateTime.now();
}
