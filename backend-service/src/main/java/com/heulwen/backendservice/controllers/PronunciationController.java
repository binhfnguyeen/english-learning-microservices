/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.heulwen.backendservice.controllers;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.heulwen.backendservice.dto.request.PostRequest;
import com.heulwen.backendservice.dto.response.PostResponse;
import com.heulwen.backendservice.dto.response.ScoreResponse;
import com.heulwen.backendservice.services.FluentMeService;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

/**
 *
 * @author Dell
 */
@RestController
@RequestMapping("/api/pronunciation")
@RequiredArgsConstructor
public class PronunciationController {

    private final FluentMeService fluentMeService;
    private final Cloudinary cloudinary;

    @PostMapping("/post")
    public ResponseEntity<PostResponse> createPost(@RequestBody PostRequest request) {
        return ResponseEntity.ok(fluentMeService.createPost(request));
    }

    @GetMapping("/post/{postId}")
    public ResponseEntity<PostResponse> getPost(@PathVariable String postId) {
        return ResponseEntity.ok(fluentMeService.getPostById(postId));
    }

    @PostMapping(path = "/score/{postId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<List<ScoreResponse>> scorePronunciation(
            @PathVariable String postId,
            @RequestParam("audio") MultipartFile audioFile) {
        try {
            Map uploadResult = cloudinary.uploader().upload(
                    audioFile.getBytes(),
                    ObjectUtils.asMap(
                            "resource_type", "raw",
                            "format", "wav"
                    )
            );
            String audioUrl = (String) uploadResult.get("secure_url");

            List<ScoreResponse> response = fluentMeService.scorePronunciation(postId, audioUrl);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
}
