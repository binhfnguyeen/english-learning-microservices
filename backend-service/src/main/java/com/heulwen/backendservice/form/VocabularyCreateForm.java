package com.heulwen.backendservice.form;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Data
public class VocabularyCreateForm {
    private String word;
    private String meaning;
    private String partOfSpeech;
    private MultipartFile imageFile;
    private List<Long> topicIds;
}
