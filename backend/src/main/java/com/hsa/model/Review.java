package com.hsa.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "reviews")
@Data
@NoArgsConstructor
public class Review {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String doctorId;
    private Long patientId;
    private int rating; // 1-5
    @Column(length = 2000)
    private String comment;
    private boolean anonymous;

    private LocalDate date;
}


