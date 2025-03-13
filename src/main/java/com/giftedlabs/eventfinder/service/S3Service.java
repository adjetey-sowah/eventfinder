package com.giftedlabs.eventfinder.service;

import com.amazonaws.AmazonServiceException;
import com.amazonaws.SdkClientException;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.CannedAccessControlList;
import com.amazonaws.services.s3.model.DeleteObjectRequest;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.amazonaws.services.s3.model.PutObjectRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URI;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class S3Service {

    private final AmazonS3 s3Client;

    @Value("${aws.bucketName}")
    private String bucketName;

    public String uploadFile(MultipartFile file) throws IOException{
        String filename = generateFileName(file);

        ObjectMetadata metadata = new ObjectMetadata();
        metadata.setContentLength(file.getSize());
        metadata.setContentType(file.getContentType());

        s3Client.putObject(
                new PutObjectRequest(bucketName,filename,file.getInputStream(), metadata)

        );
        return s3Client.getUrl(bucketName,filename).toString();
    }


    private String generateFileName (MultipartFile file){
        // Create a unique file name with timestamp and UUID
        LocalDateTime now = LocalDateTime.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
        String timestamp = now.format(formatter);

        String originalFileName = file.getOriginalFilename();
        String extension = "";

        if (originalFileName != null && originalFileName.contains(".")){
            extension = originalFileName.substring(originalFileName.lastIndexOf("."));
        }

        return "images/"+ timestamp + "_" + UUID.randomUUID().toString()+extension;
    }

    public void deleteFile(String fileUrl) {
        try {
            // Convert URL to URI to properly extract the key
            URI uri = new URI(fileUrl);

            // Extract the key while ensuring it keeps the folder structure (removing the leading '/')
            String key = uri.getPath().startsWith("/") ? uri.getPath().substring(1) : uri.getPath();

            // Log the extracted key
            log.info("Attempting to delete file from S3 - Bucket: {}, Key: {}", bucketName, key);

            // Delete the object from S3
            s3Client.deleteObject(new DeleteObjectRequest(bucketName, key));

            log.info("Successfully deleted file with key: {}", key);
        } catch (AmazonServiceException e) {
            log.error("AWS Service Error: {}", e.getMessage());
        } catch (SdkClientException e) {
            log.error("AWS SDK Error: {}", e.getMessage());
        } catch (Exception e) {
            log.error("General Error deleting file from S3: {}", e.getMessage());
        }
    }

}
