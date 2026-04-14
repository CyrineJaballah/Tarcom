package com.tarcom.dossiers.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.gridfs.GridFsTemplate;
import org.springframework.data.mongodb.gridfs.GridFsResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.bson.Document;
import org.bson.types.ObjectId;
import com.mongodb.client.gridfs.model.GridFSFile;
import java.io.IOException;

@Service
public class FileStorageService {
    
    @Autowired
    private GridFsTemplate gridFsTemplate;
    
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
    
    /**
     * Stocker un fichier avec GridFS
     */
    public ObjectId storeFile(MultipartFile file, String documentType, String submissionId) throws IOException {
        
        // Valider la taille du fichier
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new RuntimeException("File size exceeds maximum limit of 10MB");
        }
        
        // Créer les métadonnées
        Document metadata = new Document();
        metadata.append("documentType", documentType);
        metadata.append("submissionId", submissionId);
        metadata.append("originalName", file.getOriginalFilename());
        
        // Stocker le fichier
        ObjectId fileId = gridFsTemplate.store(
            file.getInputStream(),
            file.getOriginalFilename(),
            file.getContentType(),
            metadata
        );
        
        return fileId;
    }
    
    /**
     * Récupérer un fichier par ID
     */
    public GridFsResource getFile(ObjectId fileId) {
        GridFSFile file = gridFsTemplate.findOne(
            new org.springframework.data.mongodb.core.query.Query(
                org.springframework.data.mongodb.core.query.Criteria.where("_id").is(fileId)
            )
        );
        
        if (file == null) {
            throw new RuntimeException("File not found");
        }
        return gridFsTemplate.getResource(file);
    }
    
    /**
     * Supprimer un fichier
     */
    public void deleteFile(ObjectId fileId) {
        gridFsTemplate.delete(
            new org.springframework.data.mongodb.core.query.Query(
                org.springframework.data.mongodb.core.query.Criteria.where("_id").is(fileId)
            )
        );
    }
    
    /**
     * Obtenir les informations du fichier
     */
    public GridFSFile getFileInfo(ObjectId fileId) {
        return gridFsTemplate.findOne(
            new org.springframework.data.mongodb.core.query.Query(
                org.springframework.data.mongodb.core.query.Criteria.where("_id").is(fileId)
            )
        );
    }
    
    /**
     * Vérifier que la taille du fichier est valide
     */
    public boolean isFileSizeValid(long fileSize) {
        return fileSize <= MAX_FILE_SIZE;
    }
}
