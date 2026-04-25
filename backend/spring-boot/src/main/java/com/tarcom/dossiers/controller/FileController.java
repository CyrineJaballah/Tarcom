package com.tarcom.dossiers.controller;

import com.tarcom.dossiers.service.FileStorageService;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.data.mongodb.gridfs.GridFsResource;

@RestController
@RequestMapping("/files")
public class FileController {

    @Autowired
    private FileStorageService fileStorageService;

    @GetMapping("/{id}")
    public ResponseEntity<Resource> downloadFile(@PathVariable String id) {
        try {
            ObjectId fileId = new ObjectId(id);
            GridFsResource resource = fileStorageService.getFile(fileId);

            if (resource == null || !resource.exists()) {
                return ResponseEntity.notFound().build();
            }

            String filename = resource.getFilename();
            String contentType = resource.getContentType();
            if (contentType == null || contentType.isBlank()) {
                contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
            }

            // 'inline' allows the browser to show the file directly (preview)
            // We remove the filename from inline for some browser PDF viewers to avoid auto-download prompts
            String disposition = contentType.contains("pdf") ? "inline" : "inline; filename=\"" + filename + "\"";

            return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition)
                .header(HttpHeaders.ACCESS_CONTROL_EXPOSE_HEADERS, HttpHeaders.CONTENT_DISPOSITION)
                .header("X-Content-Type-Options", "nosniff")
                .body(new InputStreamResource(resource.getInputStream()));
        } catch (java.io.IOException e) {
            return ResponseEntity.internalServerError().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteFile(@PathVariable String id) {
        ObjectId fileId = new ObjectId(id);
        fileStorageService.deleteFile(fileId);
        return ResponseEntity.ok().body(java.util.Map.of("success", true, "message", "Fichier supprimé"));
    }
}
