package com.crm.fieldvisit.service;

import com.crm.fieldvisit.common.ResourceNotFoundException;
import com.crm.fieldvisit.dto.MastersSummaryResponse;
import com.crm.fieldvisit.entity.*;
import com.crm.fieldvisit.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class MastersService {

    private final BranchRepository branchRepository;
    private final DepartmentRepository departmentRepository;
    private final DesignationRepository designationRepository;
    private final ProductRepository productRepository;
    private final ActivityTypeRepository activityTypeRepository;
    private final ExpenseHeadRepository expenseHeadRepository;
    private final GradeFuelRateRepository gradeFuelRateRepository;
    private final IndustryRepository industryRepository;

    @Transactional(readOnly = true)
    public MastersSummaryResponse getAllMastersSummary() {
        return MastersSummaryResponse.builder()
                .branches(branchRepository.findAll())
                .departments(departmentRepository.findAll())
                .designations(designationRepository.findAll())
                .products(productRepository.findAll())
                .activityTypes(activityTypeRepository.findAll())
                .expenseHeads(expenseHeadRepository.findAll())
                .gradeFuelRates(gradeFuelRateRepository.findAll())
                .industries(industryRepository.findAll())
                .build();
    }

    public List<Branch> getAllBranches() { return branchRepository.findAll(); }
    public Branch createBranch(Branch branch) { return branchRepository.save(branch); }

    public List<Department> getAllDepartments() { return departmentRepository.findAll(); }
    public Department createDepartment(Department department) { return departmentRepository.save(department); }

    public List<Designation> getAllDesignations() { return designationRepository.findAll(); }
    public Designation createDesignation(Designation designation) { return designationRepository.save(designation); }

    public List<Product> getAllProducts() { return productRepository.findAll(); }
    public Product createProduct(Product product) { return productRepository.save(product); }

    public List<ActivityType> getAllActivityTypes() { return activityTypeRepository.findAll(); }
    public ActivityType createActivityType(ActivityType activityType) { return activityTypeRepository.save(activityType); }

    public List<ExpenseHead> getAllExpenseHeads() { return expenseHeadRepository.findAll(); }
    public ExpenseHead createExpenseHead(ExpenseHead expenseHead) { return expenseHeadRepository.save(expenseHead); }

    public List<GradeFuelRate> getAllGradeFuelRates() { return gradeFuelRateRepository.findAll(); }
    public GradeFuelRate createGradeFuelRate(GradeFuelRate rate) { return gradeFuelRateRepository.save(rate); }

    public List<Industry> getAllIndustries() { return industryRepository.findAll(); }
    public Industry createIndustry(Industry industry) { return industryRepository.save(industry); }

    @Transactional
    public Object createMasterItem(String type, Map<String, Object> body) {
        return switch (type) {
            case "branches" -> {
                Branch b = Branch.builder()
                        .code((String) body.get("code"))
                        .name((String) body.get("name"))
                        .city((String) body.get("city"))
                        .isActive(body.get("isActive") != null ? Boolean.parseBoolean(body.get("isActive").toString()) : true)
                        .build();
                yield branchRepository.save(b);
            }
            case "departments" -> {
                Department d = Department.builder()
                        .code((String) body.get("code"))
                        .name((String) body.get("name"))
                        .build();
                yield departmentRepository.save(d);
            }
            case "designations" -> {
                Designation desg = Designation.builder()
                        .code((String) body.get("code"))
                        .title((String) body.get("title"))
                        .build();
                yield designationRepository.save(desg);
            }
            case "products" -> {
                Product p = Product.builder()
                        .code((String) body.get("code"))
                        .name((String) body.get("name"))
                        .description((String) body.get("description"))
                        .category(body.get("category") != null ? body.get("category").toString() : "Machinery")
                        .isActive(body.get("isActive") != null ? Boolean.parseBoolean(body.get("isActive").toString()) : true)
                        .build();
                yield productRepository.save(p);
            }
            case "activity-types" -> {
                ActivityType a = ActivityType.builder()
                        .code((String) body.get("code"))
                        .name((String) body.get("name"))
                        .description((String) body.get("description"))
                        .build();
                yield activityTypeRepository.save(a);
            }
            case "expense-heads" -> {
                BigDecimal rate = body.get("defaultRate") != null ? new BigDecimal(body.get("defaultRate").toString()) : BigDecimal.ZERO;
                ExpenseHead eh = ExpenseHead.builder()
                        .code((String) body.get("code"))
                        .name((String) body.get("name"))
                        .requiresAttachment(body.get("requiresAttachment") != null && Boolean.parseBoolean(body.get("requiresAttachment").toString()))
                        .requiresKm(body.get("requiresKm") != null && Boolean.parseBoolean(body.get("requiresKm").toString()))
                        .defaultRate(rate)
                        .isActive(body.get("isActive") != null ? Boolean.parseBoolean(body.get("isActive").toString()) : true)
                        .build();
                yield expenseHeadRepository.save(eh);
            }
            case "grade-fuel-rates" -> {
                BigDecimal rate = body.get("fuelRate") != null ? new BigDecimal(body.get("fuelRate").toString()) : new BigDecimal("10.35");
                GradeFuelRate g = GradeFuelRate.builder()
                        .gradeCode((String) body.get("gradeCode"))
                        .gradeName((String) body.get("gradeName"))
                        .fuelRate(rate)
                        .isActive(body.get("isActive") != null ? Boolean.parseBoolean(body.get("isActive").toString()) : true)
                        .build();
                yield gradeFuelRateRepository.save(g);
            }
            case "industries" -> {
                Industry ind = Industry.builder()
                        .code((String) body.get("code"))
                        .name((String) body.get("name"))
                        .description((String) body.get("description"))
                        .isActive(body.get("isActive") != null ? Boolean.parseBoolean(body.get("isActive").toString()) : true)
                        .build();
                yield industryRepository.save(ind);
            }
            default -> throw new IllegalArgumentException("Unknown master type: " + type);
        };
    }

    @Transactional
    public Object updateMasterItem(String type, Integer id, Map<String, Object> body) {
        return switch (type) {
            case "branches" -> {
                Branch b = branchRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Branch not found"));
                if (body.containsKey("code")) b.setCode((String) body.get("code"));
                if (body.containsKey("name")) b.setName((String) body.get("name"));
                if (body.containsKey("city")) b.setCity((String) body.get("city"));
                if (body.containsKey("isActive")) b.setIsActive(Boolean.parseBoolean(body.get("isActive").toString()));
                yield branchRepository.save(b);
            }
            case "departments" -> {
                Department d = departmentRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Department not found"));
                if (body.containsKey("code")) d.setCode((String) body.get("code"));
                if (body.containsKey("name")) d.setName((String) body.get("name"));
                yield departmentRepository.save(d);
            }
            case "designations" -> {
                Designation desg = designationRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Designation not found"));
                if (body.containsKey("code")) desg.setCode((String) body.get("code"));
                if (body.containsKey("title")) desg.setTitle((String) body.get("title"));
                yield designationRepository.save(desg);
            }
            case "products" -> {
                Product p = productRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Product not found"));
                if (body.containsKey("code")) p.setCode((String) body.get("code"));
                if (body.containsKey("name")) p.setName((String) body.get("name"));
                if (body.containsKey("description")) p.setDescription((String) body.get("description"));
                if (body.containsKey("category")) p.setCategory((String) body.get("category"));
                if (body.containsKey("isActive")) p.setIsActive(Boolean.parseBoolean(body.get("isActive").toString()));
                yield productRepository.save(p);
            }
            case "activity-types" -> {
                ActivityType a = activityTypeRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("ActivityType not found"));
                if (body.containsKey("code")) a.setCode((String) body.get("code"));
                if (body.containsKey("name")) a.setName((String) body.get("name"));
                if (body.containsKey("description")) a.setDescription((String) body.get("description"));
                yield activityTypeRepository.save(a);
            }
            case "expense-heads" -> {
                ExpenseHead eh = expenseHeadRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("ExpenseHead not found"));
                if (body.containsKey("code")) eh.setCode((String) body.get("code"));
                if (body.containsKey("name")) eh.setName((String) body.get("name"));
                if (body.containsKey("requiresAttachment")) eh.setRequiresAttachment(Boolean.parseBoolean(body.get("requiresAttachment").toString()));
                if (body.containsKey("requiresKm")) eh.setRequiresKm(Boolean.parseBoolean(body.get("requiresKm").toString()));
                if (body.containsKey("defaultRate")) eh.setDefaultRate(new BigDecimal(body.get("defaultRate").toString()));
                if (body.containsKey("isActive")) eh.setIsActive(Boolean.parseBoolean(body.get("isActive").toString()));
                yield expenseHeadRepository.save(eh);
            }
            case "grade-fuel-rates" -> {
                GradeFuelRate g = gradeFuelRateRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("GradeFuelRate not found"));
                if (body.containsKey("gradeCode")) g.setGradeCode((String) body.get("gradeCode"));
                if (body.containsKey("gradeName")) g.setGradeName((String) body.get("gradeName"));
                if (body.containsKey("fuelRate")) g.setFuelRate(new BigDecimal(body.get("fuelRate").toString()));
                if (body.containsKey("isActive")) g.setIsActive(Boolean.parseBoolean(body.get("isActive").toString()));
                yield gradeFuelRateRepository.save(g);
            }
            case "industries" -> {
                Industry ind = industryRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Industry not found"));
                if (body.containsKey("code")) ind.setCode((String) body.get("code"));
                if (body.containsKey("name")) ind.setName((String) body.get("name"));
                if (body.containsKey("description")) ind.setDescription((String) body.get("description"));
                if (body.containsKey("isActive")) ind.setIsActive(Boolean.parseBoolean(body.get("isActive").toString()));
                yield industryRepository.save(ind);
            }
            default -> throw new IllegalArgumentException("Unknown master type: " + type);
        };
    }

    @Transactional
    public boolean deleteMasterItem(String type, Integer id) {
        switch (type) {
            case "branches" -> branchRepository.deleteById(id);
            case "departments" -> departmentRepository.deleteById(id);
            case "designations" -> designationRepository.deleteById(id);
            case "products" -> productRepository.deleteById(id);
            case "activity-types" -> activityTypeRepository.deleteById(id);
            case "expense-heads" -> expenseHeadRepository.deleteById(id);
            case "grade-fuel-rates" -> gradeFuelRateRepository.deleteById(id);
            case "industries" -> industryRepository.deleteById(id);
            default -> throw new IllegalArgumentException("Unknown master type: " + type);
        }
        return true;
    }
}
