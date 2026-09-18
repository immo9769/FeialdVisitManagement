package com.crm.fieldvisit.service;

import com.crm.fieldvisit.entity.*;
import com.crm.fieldvisit.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DatabaseSeeder implements CommandLineRunner {

    private final DepartmentRepository deptRepo;
    private final DesignationRepository desgRepo;
    private final BranchRepository branchRepo;
    private final ProductRepository productRepo;
    private final ActivityTypeRepository actRepo;
    private final ExpenseHeadRepository expHeadRepo;
    private final GradeFuelRateRepository gradeFuelRepo;
    private final IndustryRepository industryRepo;
    private final EmployeeRepository empRepo;
    private final CustomerRepository custRepo;
    private final ContactRepository contactRepo;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        try {
            if (deptRepo.count() == 0) {
                log.info("Seeding Initial Department records...");
                deptRepo.saveAll(List.of(
                        Department.builder().code("DEPT-SALES").name("Sales").build(),
                        Department.builder().code("DEPT-SERVICE").name("Service").build(),
                        Department.builder().code("DEPT-MGMT").name("Management").build()
                ));
            }

            if (desgRepo.count() == 0) {
                log.info("Seeding Initial Designation records...");
                desgRepo.saveAll(List.of(
                        Designation.builder().code("DESG-SE").title("Sales Executive").build(),
                        Designation.builder().code("DESG-SENG").title("Service Engineer").build(),
                        Designation.builder().code("DESG-BM").title("Branch Manager").build(),
                        Designation.builder().code("DESG-ADMIN").title("System Administrator").build()
                ));
            }

            if (branchRepo.count() == 0) {
                log.info("Seeding Initial Branch records...");
                branchRepo.saveAll(List.of(
                        Branch.builder().code("BR-MUMBAI").name("Mumbai HQ").city("Mumbai").isActive(true).build(),
                        Branch.builder().code("BR-BARODA").name("Baroda Branch").city("Vadodara").isActive(true).build(),
                        Branch.builder().code("BR-AHMEDABAD").name("Ahmedabad Branch").city("Ahmedabad").isActive(true).build(),
                        Branch.builder().code("BR-PUNE").name("Pune Industrial Area").city("Pune").isActive(true).build(),
                        Branch.builder().code("BR-NASHIK").name("Nashik Hub").city("Nashik").isActive(true).build()
                ));
            }

            if (productRepo.count() == 0) {
                log.info("Seeding Initial Product records...");
                productRepo.saveAll(List.of(
                        Product.builder().code("PRD-CNC-PRESS").name("Hydraulic Press Brake 100T").description("High precision 100 Ton CNC hydraulic sheet metal press brake").category("Machinery").isActive(true).build(),
                        Product.builder().code("PRD-FIBER-LASER").name("CNC Fiber Laser 3kW").description("3000W high-speed metal sheet fiber laser cutting machine").category("Machinery").isActive(true).build(),
                        Product.builder().code("PRD-TURRET-PUNCH").name("CNC Turret Punch Press").description("Servo-electric high-capacity punch press for industrial stamping").category("Machinery").isActive(true).build(),
                        Product.builder().code("PRD-SHEAR-6MM").name("Hydraulic Shearing 6mm").description("Heavy-duty 6mm thickness mechanical and hydraulic guillotine shear").category("Machinery").isActive(true).build(),
                        Product.builder().code("PRD-LASER-TUBE").name("CNC Laser Tube Cutting 2kW").description("Precision chuck automated rotary metal tube & pipe laser cutting").category("Machinery").isActive(true).build(),
                        Product.builder().code("PRD-ROBOT-WELD").name("Robotic Welding Cell 6-Axis").description("Integrated industrial 6-axis robotic GMAW/TIG welding workstation").category("Automation").isActive(true).build()
                ));
            }

            if (actRepo.count() == 0) {
                log.info("Seeding Initial Activity Types...");
                actRepo.saveAll(List.of(
                        ActivityType.builder().code("ACT-SALES").name("Sales Pitch / Discovery").description("Initial client meeting and presentation").build(),
                        ActivityType.builder().code("ACT-INSTALL").name("Machine Commissioning & Installation").description("On-site machinery erection and wiring").build(),
                        ActivityType.builder().code("ACT-AMC").name("Routine Maintenance / AMC").description("Preventive maintenance visit").build(),
                        ActivityType.builder().code("ACT-BREAKDOWN").name("Emergency Breakdown Service").description("Urgent service call").build(),
                        ActivityType.builder().code("ACT-DEMO").name("Product Live Demonstration").description("Live cutting/bending demo").build(),
                        ActivityType.builder().code("ACT-FOLLOWUP").name("Payment & Proposal Follow-up").description("Commercial discussions").build()
                ));
            }

            if (expHeadRepo.count() == 0) {
                log.info("Seeding Initial Expense Heads...");
                expHeadRepo.saveAll(List.of(
                        ExpenseHead.builder().code("EXP-FUEL").name("Fuel Allowance (Per KM)").requiresKm(true).defaultRate(new BigDecimal("11.50")).isActive(true).build(),
                        ExpenseHead.builder().code("EXP-HOTEL").name("Hotel / Lodging Expense").requiresAttachment(true).defaultRate(BigDecimal.ZERO).isActive(true).build(),
                        ExpenseHead.builder().code("EXP-FOOD").name("Daily Food / Meal Allowance").requiresAttachment(true).defaultRate(BigDecimal.ZERO).isActive(true).build(),
                        ExpenseHead.builder().code("EXP-TOLL").name("Highway Toll & Parking").requiresAttachment(true).defaultRate(BigDecimal.ZERO).isActive(true).build(),
                        ExpenseHead.builder().code("EXP-CLIENT-ENT").name("Client Entertainment / Refreshments").requiresAttachment(true).defaultRate(BigDecimal.ZERO).isActive(true).build(),
                        ExpenseHead.builder().code("EXP-PUBLIC-TRANS").name("Public Transit (Cab/Bus/Train)").requiresAttachment(true).defaultRate(BigDecimal.ZERO).isActive(true).build(),
                        ExpenseHead.builder().code("EXP-MISC").name("Miscellaneous Contingency").requiresAttachment(false).defaultRate(BigDecimal.ZERO).isActive(true).build()
                ));
            }

            if (gradeFuelRepo.count() == 0) {
                log.info("Seeding Initial Grade Fuel Rates...");
                gradeFuelRepo.saveAll(List.of(
                        GradeFuelRate.builder().gradeCode("GRADE_A").gradeName("Grade A (Senior Mgmt / SUV)").fuelRate(new BigDecimal("14.00")).isActive(true).build(),
                        GradeFuelRate.builder().gradeCode("GRADE_B").gradeName("Grade B (Mid Executive / Sedan)").fuelRate(new BigDecimal("11.50")).isActive(true).build(),
                        GradeFuelRate.builder().gradeCode("GRADE_C").gradeName("Grade C (Junior Field / Hatchback)").fuelRate(new BigDecimal("9.00")).isActive(true).build(),
                        GradeFuelRate.builder().gradeCode("GRADE_D").gradeName("Grade D (Bike / Two-Wheeler)").fuelRate(new BigDecimal("6.50")).isActive(true).build()
                ));
            }

            if (industryRepo.count() == 0) {
                log.info("Seeding Initial Industries...");
                industryRepo.saveAll(List.of(
                        Industry.builder().code("IND-AUTO").name("Automobile & Auto Components").isActive(true).build(),
                        Industry.builder().code("IND-ENG").name("General Engineering & Machining").isActive(true).build(),
                        Industry.builder().code("IND-MACH").name("Industrial Machinery & Equipment").isActive(true).build(),
                        Industry.builder().code("IND-AERO").name("Aerospace & Defense").isActive(true).build(),
                        Industry.builder().code("IND-ELEC").name("Consumer Durables & Electronics").isActive(true).build(),
                        Industry.builder().code("IND-CHEM").name("Petrochemicals & Process Industry").isActive(true).build(),
                        Industry.builder().code("IND-MOLD").name("Die & Mold Manufacturing").isActive(true).build(),
                        Industry.builder().code("IND-STEEL").name("Steel & Metals Fabrication").isActive(true).build(),
                        Industry.builder().code("IND-FOOD").name("Food Processing & Packaging").isActive(true).build()
                ));
            }

            if (empRepo.count() == 0) {
                log.info("Seeding Initial Employees...");
                Department deptSales = deptRepo.findByCode("DEPT-SALES").orElse(null);
                Department deptService = deptRepo.findByCode("DEPT-SERVICE").orElse(null);
                Department deptMgmt = deptRepo.findByCode("DEPT-MGMT").orElse(null);

                Designation desgSE = desgRepo.findByCode("DESG-SE").orElse(null);
                Designation desgSENG = desgRepo.findByCode("DESG-SENG").orElse(null);
                Designation desgBM = desgRepo.findByCode("DESG-BM").orElse(null);
                Designation desgAdmin = desgRepo.findByCode("DESG-ADMIN").orElse(null);

                Branch brMumbai = branchRepo.findByCode("BR-MUMBAI").orElse(null);
                Branch brBaroda = branchRepo.findByCode("BR-BARODA").orElse(null);

                String hash = passwordEncoder.encode("Password@123");

                Employee admin = Employee.builder()
                        .employeeNo("1000")
                        .name("System Administrator")
                        .gender("Male")
                        .dob(LocalDate.of(1985, 1, 1))
                        .departmentId(deptMgmt != null ? deptMgmt.getId() : 1)
                        .designationId(desgAdmin != null ? desgAdmin.getId() : 1)
                        .branchId(brMumbai != null ? brMumbai.getId() : 1)
                        .joiningDate(LocalDate.of(2020, 1, 1))
                        .status("Active")
                        .mobileNo("9999999999")
                        .email("admin@crm.com")
                        .passwordHash(hash)
                        .role("ADMIN")
                        .grade("GRADE_A")
                        .build();

                Employee suresh = Employee.builder()
                        .employeeNo("1001")
                        .name("Suresh Choudhary")
                        .gender("Male")
                        .dob(LocalDate.of(1989, 4, 15))
                        .departmentId(deptService != null ? deptService.getId() : 2)
                        .designationId(desgSENG != null ? desgSENG.getId() : 2)
                        .branchId(brMumbai != null ? brMumbai.getId() : 1)
                        .joiningDate(LocalDate.of(2022, 1, 10))
                        .status("Active")
                        .mobileNo("9317654322")
                        .email("suresh@crm.com")
                        .passwordHash(hash)
                        .role("SERVICE_ENG")
                        .grade("GRADE_B")
                        .build();

                Employee amit = Employee.builder()
                        .employeeNo("1002")
                        .name("Amit Sharma")
                        .gender("Male")
                        .dob(LocalDate.of(1992, 8, 22))
                        .departmentId(deptSales != null ? deptSales.getId() : 1)
                        .designationId(desgSE != null ? desgSE.getId() : 1)
                        .branchId(brBaroda != null ? brBaroda.getId() : 2)
                        .joiningDate(LocalDate.of(2021, 3, 15))
                        .status("Active")
                        .mobileNo("9823456711")
                        .email("amit@crm.com")
                        .passwordHash(hash)
                        .role("SALES_EXEC")
                        .grade("GRADE_B")
                        .build();

                Employee rajesh = Employee.builder()
                        .employeeNo("1003")
                        .name("Rajesh Patel")
                        .gender("Male")
                        .dob(LocalDate.of(1982, 11, 5))
                        .departmentId(deptMgmt != null ? deptMgmt.getId() : 1)
                        .designationId(desgBM != null ? desgBM.getId() : 3)
                        .branchId(brMumbai != null ? brMumbai.getId() : 1)
                        .joiningDate(LocalDate.of(2018, 6, 1))
                        .status("Active")
                        .mobileNo("9712345678")
                        .email("rajesh@crm.com")
                        .passwordHash(hash)
                        .role("MANAGER")
                        .grade("GRADE_A")
                        .build();

                empRepo.saveAll(List.of(admin, suresh, amit, rajesh));
            }

            if (custRepo.count() == 0) {
                log.info("Seeding Initial Customer records...");
                Customer tata = Customer.builder()
                        .customerCode("CUST-TATA-001")
                        .name("Tata Motors Ltd (Plant 1)")
                        .customerType("Existing Customer")
                        .industry("Automobile & Auto Components")
                        .contactPersonPrimary("Rajendra Deshmukh")
                        .source("Direct Referral")
                        .website("https://tatamotors.com")
                        .status("Active")
                        .remarks("Key automotive facility with active press brakes.")
                        .address("Pimpri Industrial Corridor, MIDC")
                        .city("Pune")
                        .state("Maharashtra")
                        .build();

                Customer savedTata = custRepo.save(tata);

                contactRepo.save(Contact.builder()
                        .customerId(savedTata.getId())
                        .contactName("Rajendra Deshmukh")
                        .designation("General Manager - Plant Maintenance")
                        .mobileNo("9822011223")
                        .email("rajendra.d@tatamotors.example.com")
                        .isPrimary(true)
                        .build());
            }

            log.info("Database seeding check completed.");
        } catch (Exception e) {
            log.error("Error during initial data seeding: {}", e.getMessage());
        }
    }
}
