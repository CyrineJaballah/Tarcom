package com.tarcom.dossiers.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FicheRenseignement {
    
    // Identité (obligatoire)
    @JsonProperty("firstName")
    private String firstName;
    
    @JsonProperty("lastName")
    private String lastName;
    
    @JsonProperty("dateOfBirth")
    private LocalDate dateOfBirth;
    
    @JsonProperty("placeOfBirth")
    private String placeOfBirth;
    
    @JsonProperty("nationality")
    private String nationality;
    
    // Contact (obligatoire)
    @JsonProperty("email")
    private String email;
    
    @JsonProperty("phone")
    private String phone;
    
    @JsonProperty("address")
    private String address;
    
    @JsonProperty("city")
    private String city;
    
    @JsonProperty("postalCode")
    private String postalCode;
    
    // Urgence (obligatoire)
    @JsonProperty("emergencyName")
    private String emergencyName;
    
    @JsonProperty("emergencyPhone")
    private String emergencyPhone;
    
    @JsonProperty("emergencyRelation")
    private String emergencyRelation;
    
    // Sécurité Sociale (optionnel)
    @JsonProperty("socialSecurityNumber")
    private String socialSecurityNumber;
    
    @JsonProperty("healthMutual")
    private String healthMutual;
    
    @JsonProperty("healthMutualNumber")
    private String healthMutualNumber;
    
    // Permis de conduire (obligatoire)
    @JsonProperty("drivingLicense")
    private String drivingLicense;
    
    @JsonProperty("licenseExpiryDate")
    private LocalDate licenseExpiryDate;
    
    // Getters et Setters (générés par Lombok)
}
