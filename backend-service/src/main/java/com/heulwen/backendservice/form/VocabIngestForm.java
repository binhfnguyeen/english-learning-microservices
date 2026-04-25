package com.heulwen.backendservice.form;

import com.heulwen.backendservice.dto.VocabDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class VocabIngestForm {
    private List<VocabDto> items;
}
