package com.tarcom.dossiers.controller;

import com.tarcom.dossiers.model.Technician;
import com.tarcom.dossiers.repository.TechnicianRepository;
import org.bson.types.ObjectId;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/technicians")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class TechnicianController {

    private final TechnicianRepository technicianRepository;

    public TechnicianController(TechnicianRepository technicianRepository) {
        this.technicianRepository = technicianRepository;
    }

    @GetMapping
    public ResponseEntity<List<Technician>> listTechnicians() {
        return ResponseEntity.ok(technicianRepository.findAll());
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        List<Technician> technicians = technicianRepository.findAll();
        long total = technicians.size();
        long sav = technicians.stream().filter(t -> "SAV".equalsIgnoreCase(t.getRole())).count();
        long d3d1 = technicians.stream().filter(t -> "D3/D1".equalsIgnoreCase(t.getRole())).count();

        Map<String, Long> subdivisions = technicians.stream()
            .filter(t -> t.getSubdivision() != null && !t.getSubdivision().isBlank())
            .collect(Collectors.groupingBy(Technician::getSubdivision, Collectors.counting()));

        Map<String, Object> payload = new HashMap<>();
        payload.put("total", total);
        payload.put("sav", sav);
        payload.put("d3d1", d3d1);
        payload.put("savPercent", total == 0 ? 0 : Math.round((sav * 10000.0) / total) / 100.0);
        payload.put("d3d1Percent", total == 0 ? 0 : Math.round((d3d1 * 10000.0) / total) / 100.0);
        payload.put("subdivisions", subdivisions.entrySet().stream()
            .map(entry -> Map.of(
                "name", entry.getKey(),
                "count", entry.getValue(),
                "percent", total == 0 ? 0 : Math.round((entry.getValue() * 10000.0) / total) / 100.0
            ))
            .toList());

        return ResponseEntity.ok(payload);
    }

    @PostMapping
    public ResponseEntity<?> createTechnician(@RequestBody Technician body) {
        Technician technician = new Technician();
        technician.setName(body.getName());
        technician.setEmail(body.getEmail());
        technician.setPhone(body.getPhone());
        technician.setRole(body.getRole());
        technician.setSubdivision(body.getSubdivision());
        technician.setActive(body.getActive() == null || body.getActive());
        technician.setCreatedAt(LocalDateTime.now());
        technician.setUpdatedAt(LocalDateTime.now());
        return ResponseEntity.ok(technicianRepository.save(technician));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateTechnician(@PathVariable String id, @RequestBody Technician body) {
        try {
            ObjectId objectId = new ObjectId(id);
            Technician existing = technicianRepository.findById(objectId)
                .orElseThrow(() -> new RuntimeException("Technician not found"));

            existing.setName(body.getName());
            existing.setEmail(body.getEmail());
            existing.setPhone(body.getPhone());
            existing.setRole(body.getRole());
            existing.setSubdivision(body.getSubdivision());
            existing.setActive(body.getActive());
            existing.setUpdatedAt(LocalDateTime.now());
            return ResponseEntity.ok(technicianRepository.save(existing));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTechnician(@PathVariable String id) {
        try {
            technicianRepository.deleteById(new ObjectId(id));
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
