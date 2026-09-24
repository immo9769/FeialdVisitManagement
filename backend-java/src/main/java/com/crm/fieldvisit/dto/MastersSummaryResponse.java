package com.crm.fieldvisit.dto;

import com.crm.fieldvisit.entity.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MastersSummaryResponse {
    private List<Branch> branches;
    private List<Department> departments;
    private List<Designation> designations;
    private List<Product> products;
    private List<ActivityType> activityTypes;
    private List<ExpenseHead> expenseHeads;
    private List<GradeFuelRate> gradeFuelRates;
    private List<Industry> industries;
    private List<Principal> principals;
}
