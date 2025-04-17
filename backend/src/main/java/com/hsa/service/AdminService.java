package com.hsa.service;

import com.hsa.dto.CreateDoctorRequest;
import com.hsa.dto.CreatePatientRequest;
import com.hsa.dto.UpdateDoctorRequest;
import com.hsa.dto.UpdatePatientRequest;
import com.hsa.model.Doctor;
import com.hsa.model.Patient;
import com.hsa.repository.DoctorRepository;
import com.hsa.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.util.StringUtils;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final PasswordEncoder passwordEncoder;
    private final String uploadDir = "uploads";

    public List<Doctor> getAllDoctors() {
        return doctorRepository.findAll();
    }

    public Doctor getDoctorById(Long id) {
        return doctorRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Doctor not found with id: " + id));
    }

    public Doctor createDoctor(CreateDoctorRequest request) {
        // Check if email is already in use
        if (doctorRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email is already in use");
        }

        // Create new doctor
        Doctor doctor = new Doctor(
            request.getName(),
            request.getEmail(),
            passwordEncoder.encode(request.getPassword()),
            request.getSpecialization(),
            request.getQualification(),
            request.getExperience(),
            request.getClinicAddress()
        );

        return doctorRepository.save(doctor);
    }

    public Doctor updateDoctor(Long id, UpdateDoctorRequest request) {
        Doctor doctor = getDoctorById(id);

        // Check if email is already in use by another doctor
        doctorRepository.findByEmail(request.getEmail())
                .ifPresent(existingDoctor -> {
                    if (!existingDoctor.getId().equals(id)) {
                        throw new IllegalArgumentException("Email is already in use by another doctor");
                    }
                });

        // Update doctor details
        doctor.setName(request.getName());
        doctor.setEmail(request.getEmail());
        doctor.setSpecialization(request.getSpecialization());
        doctor.setQualification(request.getQualification());
        doctor.setExperience(request.getExperience());
        doctor.setClinicAddress(request.getClinicAddress());
        doctor.setConsultationFee(request.getConsultationFee());
        doctor.setAvailabilitySchedule(request.getAvailabilitySchedule());

        return doctorRepository.save(doctor);
    }

    public Doctor updateDoctorStatus(Long id, String status) {
        Doctor doctor = getDoctorById(id);
        
        // Update status
        doctor.setStatus(status);
        return doctorRepository.save(doctor);
    }

    public void deleteDoctor(Long id) {
        if (!doctorRepository.existsById(id)) {
            throw new IllegalArgumentException("Doctor not found with id: " + id);
        }
        doctorRepository.deleteById(id);
    }

    public Doctor uploadProfilePicture(Long id, MultipartFile file) throws IOException {
        Doctor doctor = getDoctorById(id);
        String fileName = saveFile(file, "profile-pictures");
        doctor.setProfilePicture(fileName);
        return doctorRepository.save(doctor);
    }

    public Doctor uploadCredentials(Long id, MultipartFile file) throws IOException {
        Doctor doctor = getDoctorById(id);
        String fileName = saveFile(file, "credentials");
        doctor.setCredentialsFile(fileName);
        return doctorRepository.save(doctor);
    }

    // Patient Management Methods
    public List<Patient> getAllPatients() {
        return patientRepository.findAll();
    }

    public Patient getPatientById(Long id) {
        return patientRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Patient not found with id: " + id));
    }

    public Patient createPatient(CreatePatientRequest request) {
        // Check if email is already in use
        if (patientRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email is already in use");
        }

        // Create new patient
        Patient patient = new Patient(
            request.getName(),
            request.getEmail(),
            passwordEncoder.encode(request.getPassword()),
            request.getPhoneNumber(),
            request.getAddress(),
            request.getBloodGroup(),
            request.getAge(),
            request.getGender()
        );

        return patientRepository.save(patient);
    }

    public Patient updatePatient(Long id, UpdatePatientRequest request) {
        Patient patient = getPatientById(id);

        // Check if email is already in use by another patient
        patientRepository.findByEmail(request.getEmail())
                .ifPresent(existingPatient -> {
                    if (!existingPatient.getId().equals(id)) {
                        throw new IllegalArgumentException("Email is already in use by another patient");
                    }
                });

        // Update patient details
        patient.setName(request.getName());
        patient.setEmail(request.getEmail());
        patient.setPhoneNumber(request.getPhoneNumber());
        patient.setAddress(request.getAddress());
        patient.setBloodGroup(request.getBloodGroup());
        patient.setAge(request.getAge());
        patient.setGender(request.getGender());

        return patientRepository.save(patient);
    }

    public void deletePatient(Long id) {
        if (!patientRepository.existsById(id)) {
            throw new IllegalArgumentException("Patient not found with id: " + id);
        }
        patientRepository.deleteById(id);
    }

    public Patient uploadPatientProfilePicture(Long id, MultipartFile file) throws IOException {
        Patient patient = getPatientById(id);
        String fileName = saveFile(file, "patient-profile-pictures");
        patient.setProfilePicture(fileName);
        return patientRepository.save(patient);
    }

    public Patient uploadMedicalRecords(Long id, MultipartFile file) throws IOException {
        Patient patient = getPatientById(id);
        String fileName = saveFile(file, "medical-records");
        patient.setMedicalRecords(fileName);
        return patientRepository.save(patient);
    }

    private String saveFile(MultipartFile file, String subDirectory) throws IOException {
        // Create directories if they don't exist
        Path uploadPath = Paths.get(uploadDir, subDirectory);
        Files.createDirectories(uploadPath);

        // Generate unique filename
        String originalFileName = StringUtils.cleanPath(file.getOriginalFilename());
        String fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
        String fileName = UUID.randomUUID().toString() + fileExtension;

        // Save file
        Path filePath = uploadPath.resolve(fileName);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        return fileName;
    }
} 