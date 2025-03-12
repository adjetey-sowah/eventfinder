package com.giftedlabs.eventfinder.service;

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.CannedAccessControlList;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.amazonaws.services.s3.model.PutObjectRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
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
                        .withCannedAcl(CannedAccessControlList.PublicRead)
        );
        return s3Client.getUrl(bucketName,filename).toString();
    }


    private String generateFileName (MultipartFile file){
        // Create a unique file name with timestamp and UUID
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
        String timestamp = LocalDateTime.now().format(formatter);

        String originalFileName = file.getOriginalFilename();
        String extension = "";

        if (originalFileName != null && originalFileName.contains(".")){
            extension = originalFileName.substring(originalFileName.lastIndexOf("."));
        }

        return "images/"+ timestamp + "_" + UUID.randomUUID().toString()+extension;
    }

    public void deleteFile(String fileUrl){
        try{
            String key = fileUrl.substring(fileUrl.lastIndexOf("/")+ 1);
            s3Client.deleteObject(bucketName, key);
            log.error("Deleted file with key: {}",key);
        }
        catch (Exception e){
            log.error("Error deleting file from S3: {}", e.getMessage());
        }
    }
}
