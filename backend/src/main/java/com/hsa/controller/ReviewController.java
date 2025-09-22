package com.hsa.controller;

import com.hsa.model.Review;
import com.hsa.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class ReviewController {

    private final ReviewRepository reviewRepository;

    @GetMapping("/doctor/{doctorId}")
    @PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN')")
    public ResponseEntity<List<Review>> getDoctorReviews(@PathVariable String doctorId) {
        try {
            return ResponseEntity.ok(reviewRepository.findByDoctorIdOrderByDateDesc(doctorId));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasRole('PATIENT') or hasRole('ADMIN')")
    public ResponseEntity<List<Review>> getPatientReviews(@PathVariable Long patientId) {
        try {
            return ResponseEntity.ok(reviewRepository.findByPatientIdOrderByDateDesc(patientId));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    public record CreateReviewRequest(String doctorId, String patientId, int rating, String comment, Boolean anonymous) {}

    @PostMapping
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<Review> addReview(@RequestBody CreateReviewRequest req) {
        try {
            Review r = new Review();
            r.setDoctorId(req.doctorId());
            r.setPatientId(Long.parseLong(req.patientId()));
            r.setRating(req.rating());
            r.setComment(req.comment());
            r.setAnonymous(Boolean.TRUE.equals(req.anonymous()));
            r.setDate(LocalDate.now());
            return ResponseEntity.ok(reviewRepository.save(r));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}


