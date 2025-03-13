package com.giftedlabs.eventfinder.service;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class S3Service {

    private final S3Client s3Client;
    private final S3Presigner s3Presigner;

    @Value("${cloud.aws.s3.bucket}")
    private String bucketName;


    public String uploadFile(MultipartFile file) throws IOException {
        String filename = generateFileName(file); // Implement this method to create a unique filename

        // Define metadata
        Map<String, String> metadata = new HashMap<>();
        metadata.put("Content-Type", file.getContentType());
        metadata.put("Content-Length", String.valueOf(file.getSize()));

        // Create PutObjectRequest
        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(filename)
                .metadata(metadata)
                .contentType(file.getContentType())
                .build();

        // Upload the file
        PutObjectResponse response = s3Client.putObject(putObjectRequest, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

        // Generate pre-signed URL for accessing the file
        return generatePresignedUrl(filename);
    }

    private String generatePresignedUrl(String filename) {
        // Create a pre-signed URL valid for 1 hour
        GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                .signatureDuration(Duration.ofHours(1))
                .getObjectRequest(builder -> builder.bucket(bucketName).key(filename).build())
                .build();

        PresignedGetObjectRequest presignedRequest = s3Presigner.presignGetObject(presignRequest);
        return presignedRequest.url().toString();
    }



    private String generateFileName(MultipartFile file) {
        String extension = "";

        // Extract file extension (if available)
        String originalFileName = file.getOriginalFilename();
        if (originalFileName != null && originalFileName.contains(".")) {
            extension = originalFileName.substring(originalFileName.lastIndexOf("."));
        }

        // Generate unique filename using UUID
        return "images/" + UUID.randomUUID().toString() + extension;
    }


    public void deleteFile(String fileUrl) {
        try {
            // Extract key from URL
            String key = extractS3Key(fileUrl);

            log.info("Attempting to delete file from S3 - Bucket: {}, Key: {}", bucketName, key);

            // Create DeleteObjectRequest
            DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .build();

            // Delete the object
            DeleteObjectResponse response = s3Client.deleteObject(deleteObjectRequest);

            log.info("Successfully deleted file from S3. Status: {}", response.sdkHttpResponse().statusCode());

        } catch (S3Exception e) {
            log.error("AWS S3 Error: {}", e.awsErrorDetails().errorMessage());
        } catch (URISyntaxException e) {
            log.error("Invalid file URL: {}", fileUrl, e);
        } catch (Exception e) {
            log.error("Error deleting file from S3: {}", e.getMessage());
        }
    }

    private String extractS3Key(String fileUrl) throws URISyntaxException {
        // Convert URL to URI to properly extract the key
        URI uri = new URI(fileUrl);
        String key = uri.getPath();

        // Remove leading slash if present
        return key.startsWith("/") ? key.substring(1) : key;
    }

}
