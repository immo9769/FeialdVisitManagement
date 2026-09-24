package com.crm.fieldvisit.controller;

import com.crm.fieldvisit.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Tag(name = "Uploads")
@RestController
@RequestMapping("/api/upload")
public class FileUploadController {

    private final Path uploadDir = Paths.get("uploads").toAbsolutePath().normalize();

    public FileUploadController() {
        try {
            Files.createDirectories(uploadDir);
            Files.createDirectories(uploadDir.resolve("visits"));
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directory", e);
        }
    }

    @Operation(summary = "Upload attachment (receipts, sales reports, images, PDFs)")
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Map<String, Object>>> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "visitId", required = false) Integer visitId) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Cannot upload empty file");
        }

        String originalName = file.getOriginalFilename();
        if (originalName == null || originalName.isBlank()) {
            originalName = "file";
        }
        String cleanName = originalName.replaceAll("[^a-zA-Z0-9._-]", "_");

        Path targetDir;
        String relativeUrlPath;
        String storedName;

        if (visitId != null && visitId > 0) {
            Path visitDir = this.uploadDir.resolve("visits");
            try {
                Files.createDirectories(visitDir);
            } catch (IOException e) {
                throw new RuntimeException("Could not create visits upload directory", e);
            }
            storedName = "visit_" + visitId + "_" + System.currentTimeMillis() + "_" + cleanName;
            targetDir = visitDir;
            relativeUrlPath = "visits/" + storedName;
        } else {
            storedName = UUID.randomUUID().toString().substring(0, 8) + "_" + cleanName;
            targetDir = this.uploadDir;
            relativeUrlPath = storedName;
        }

        try {
            Path targetLocation = targetDir.resolve(storedName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            Map<String, Object> data = new HashMap<>();
            data.put("url", "/api/upload/files/" + relativeUrlPath);
            data.put("fileName", originalName);
            data.put("storedName", storedName);
            data.put("size", file.getSize());
            data.put("contentType", file.getContentType());
            if (visitId != null) {
                data.put("visitId", visitId);
            }

            return ResponseEntity.ok(ApiResponse.success(data));
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file: " + e.getMessage(), e);
        }
    }

    @Operation(summary = "Serve uploaded file inline (for preview)")
    @GetMapping("/files/**")
    public ResponseEntity<Resource> serveFile(HttpServletRequest request) {
        return getFileResponseEntity(request, "/api/upload/files/", true);
    }

    @Operation(summary = "Direct download uploaded file")
    @GetMapping("/download/**")
    public ResponseEntity<Resource> downloadFile(HttpServletRequest request) {
        return getFileResponseEntity(request, "/api/upload/download/", false);
    }

    private ResponseEntity<Resource> getFileResponseEntity(HttpServletRequest request, String prefix, boolean inline) {
        try {
            String uri = request.getRequestURI();
            int idx = uri.indexOf(prefix);
            if (idx == -1) {
                return ResponseEntity.badRequest().build();
            }
            String rawRelativePath = uri.substring(idx + prefix.length());
            String relativePath = URLDecoder.decode(rawRelativePath, StandardCharsets.UTF_8);

            Path filePath = uploadDir.resolve(relativePath).normalize();
            if (!filePath.startsWith(uploadDir)) {
                return ResponseEntity.badRequest().build();
            }

            Resource resource = new UrlResource(filePath.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                return ResponseEntity.notFound().build();
            }

            String contentType = null;
            try {
                contentType = Files.probeContentType(filePath);
            } catch (IOException ignored) {}

            if (contentType == null) {
                contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
            }

            String dispositionType = inline ? "inline" : "attachment";
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, dispositionType + "; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
