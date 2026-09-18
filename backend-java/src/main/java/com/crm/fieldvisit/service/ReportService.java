package com.crm.fieldvisit.service;

import com.crm.fieldvisit.entity.DailyVisit;
import com.crm.fieldvisit.entity.Employee;
import com.crm.fieldvisit.entity.VisitExpense;
import com.crm.fieldvisit.repository.DailyVisitRepository;
import com.crm.fieldvisit.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final DailyVisitRepository dailyVisitRepository;
    private final EmployeeRepository employeeRepository;

    @Transactional(readOnly = true)
    public Map<String, Object> getExpenseMatrixReport(
            Integer employeeId,
            Integer customerId,
            Integer month,
            Integer year,
            String startDateStr,
            String endDateStr
    ) {
        Employee employee = null;
        if (employeeId != null) {
            employee = employeeRepository.findById(employeeId).orElse(null);
        }

        LocalDate start;
        LocalDate end;

        if (startDateStr != null && !startDateStr.isBlank() && endDateStr != null && !endDateStr.isBlank()) {
            start = LocalDate.parse(startDateStr.substring(0, 10));
            end = LocalDate.parse(endDateStr.substring(0, 10));
        } else {
            int m = (month != null) ? month : LocalDate.now().getMonthValue();
            int y = (year != null) ? year : LocalDate.now().getYear();
            YearMonth ym = YearMonth.of(y, m);
            start = ym.atDay(1);
            end = ym.atEndOfMonth();
        }

        List<DailyVisit> visits = dailyVisitRepository.findVisitsForReport(employeeId, customerId, start, end);

        BigDecimal totalClaimed = BigDecimal.ZERO;
        BigDecimal approvedAmount = BigDecimal.ZERO;
        BigDecimal pendingAmount = BigDecimal.ZERO;
        BigDecimal rejectedAmount = BigDecimal.ZERO;
        int approvedCount = 0;
        int pendingCount = 0;
        int rejectedCount = 0;

        List<Map<String, Object>> matrixRows = new ArrayList<>();

        for (DailyVisit v : visits) {
            String dateStr = v.getVisitDate().toString();
            String customerName = (v.getCustomer() != null) ? v.getCustomer().getName() : "Client";
            String employeeName = (v.getEmployee() != null) ? v.getEmployee().getName() : "Employee";

            BigDecimal lodgingBoarding = BigDecimal.ZERO;
            BigDecimal travelExp = BigDecimal.ZERO;
            BigDecimal hireCar = BigDecimal.ZERO;
            BigDecimal businessLunch = BigDecimal.ZERO;
            BigDecimal postage = BigDecimal.ZERO;
            BigDecimal telephone = BigDecimal.ZERO;
            BigDecimal motorCar = BigDecimal.ZERO;
            BigDecimal dayTotal = BigDecimal.ZERO;

            if (v.getExpenses() != null) {
                for (VisitExpense exp : v.getExpenses()) {
                    BigDecimal amt = (exp.getAmount() != null) ? exp.getAmount() : BigDecimal.ZERO;
                    dayTotal = dayTotal.add(amt);
                    totalClaimed = totalClaimed.add(amt);

                    String code = (exp.getExpenseHead() != null) ? exp.getExpenseHead().getCode() : "";
                    if ("EXP-HOTELBILL".equals(code) || "EXP-HOTELWOBILL".equals(code) || "EXP-OUTSTATION".equals(code) || "EXP-HOTEL".equals(code)) {
                        lodgingBoarding = lodgingBoarding.add(amt);
                    } else if ("EXP-TRAVEL".equals(code) || "EXP-SAMEDAY".equals(code)) {
                        travelExp = travelExp.add(amt);
                    } else if ("EXP-TAXI".equals(code) || "EXP-PUBLIC-TRANS".equals(code)) {
                        hireCar = hireCar.add(amt);
                    } else if ("EXP-ENTERTAIN".equals(code) || "EXP-LOCALFOOD".equals(code) || "EXP-FOOD".equals(code) || "EXP-CLIENT-ENT".equals(code)) {
                        businessLunch = businessLunch.add(amt);
                    } else if ("EXP-MOBILEDATA".equals(code)) {
                        telephone = telephone.add(amt);
                    } else if ("EXP-FUEL".equals(code) || "EXP-VEHMAINT".equals(code) || "EXP-TOLL".equals(code)) {
                        motorCar = motorCar.add(amt);
                    } else {
                        travelExp = travelExp.add(amt);
                    }
                }
            }

            if ("APPROVED".equalsIgnoreCase(v.getStatus())) {
                approvedAmount = approvedAmount.add(dayTotal);
                approvedCount++;
            } else if ("REJECTED".equalsIgnoreCase(v.getStatus())) {
                rejectedAmount = rejectedAmount.add(dayTotal);
                rejectedCount++;
            } else {
                pendingAmount = pendingAmount.add(dayTotal);
                pendingCount++;
            }

            Map<String, Object> row = new LinkedHashMap<>();
            row.put("visitId", v.getId());
            row.put("date", dateStr);
            row.put("employeeName", employeeName);
            row.put("customerName", customerName);
            row.put("route", v.getPlaceFrom() + " -> " + v.getPlaceTo());
            row.put("lodgingBoarding", lodgingBoarding);
            row.put("travelExp", travelExp);
            row.put("hireCar", hireCar);
            row.put("businessLunch", businessLunch);
            row.put("postage", postage);
            row.put("telephone", telephone);
            row.put("motorCar", motorCar);
            row.put("netPayment", dayTotal);
            row.put("status", v.getStatus());

            matrixRows.add(row);
        }

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("totalClaimedAmount", totalClaimed);
        summary.put("approvedAmount", approvedAmount);
        summary.put("pendingAmount", pendingAmount);
        summary.put("rejectedAmount", rejectedAmount);
        summary.put("approvedCount", approvedCount);
        summary.put("pendingCount", pendingCount);
        summary.put("rejectedCount", rejectedCount);
        summary.put("totalVisits", visits.size());

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("employee", employee);
        response.put("month", month);
        response.put("year", year);
        response.put("summary", summary);
        response.put("matrixRows", matrixRows);

        return response;
    }
}
