import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert,
  Modal,
  FlatList,
  Linking,
  Platform,
} from 'react-native';

// API Config - Default Localhost backend
const API_BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5000/api' : 'http://localhost:5000/api';

export default function App() {
  // Auth State
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState('vishal@crm.com');
  const [password, setPassword] = useState('Password@123');
  const [authLoading, setAuthLoading] = useState(false);

  // Active Tab: 'visits' | 'customers' | 'profile'
  const [activeTab, setActiveTab] = useState<'visits' | 'customers' | 'profile'>('visits');

  // App Data State
  const [visits, setVisits] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [activityTypes, setActivityTypes] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [expenseHeads, setExpenseHeads] = useState<any[]>([]);
  const [gradeFuelRates, setGradeFuelRates] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  // Add Visit Modal State
  const [openVisitModal, setOpenVisitModal] = useState(false);
  const [savingVisit, setSavingVisit] = useState(false);

  // Form Data for Daily Visit
  const [visitForm, setVisitForm] = useState({
    visitDate: new Date().toISOString().split('T')[0],
    customerId: null as number | null,
    contactId: null as number | null,
    activityTypeId: 1,
    productId: 10,
    placeFrom: 'Baroda',
    placeTo: 'Baroda',
    startTime: '09:00',
    endTime: '18:00',
    personCount: 1,
    expenses: [
      {
        expenseHeadId: 11, // Fuel Head
        dayStartKm: 0,
        dayEndKm: 0,
        totalKm: 0,
        fuelRate: 11.50,
        tollTax: 0,
        amount: 0,
        remarks: 'Daily Visit Fuel',
      },
    ],
  });

  // Fetch Master Data & Visits upon Login
  useEffect(() => {
    if (token) {
      fetchAppData();
    }
  }, [token]);

  const apiFetch = async (endpoint: string, options: any = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'API Request Failed');
    }
    return data;
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }
    setAuthLoading(true);
    try {
      const res = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setToken(res.accessToken);
      setUser(res.user);
    } catch (err: any) {
      Alert.alert('Login Failed', err.message || 'Invalid credentials');
    } finally {
      setAuthLoading(false);
    }
  };

  const fetchAppData = async () => {
    setDataLoading(true);
    try {
      const [vData, cData, mData] = await Promise.all([
        apiFetch('/daily-visits'),
        apiFetch('/customers'),
        apiFetch('/masters/summary'),
      ]);

      setVisits(vData || []);
      const activeCusts = (cData || []).filter((c: any) => c.status === 'Active');
      setCustomers(activeCusts);
      setActivityTypes(mData.activityTypes || []);
      setProducts(mData.products || []);
      setExpenseHeads(mData.expenseHeads || []);
      setGradeFuelRates(mData.gradeFuelRates || []);

      if (activeCusts.length > 0) {
        handleCustomerSelect(activeCusts[0].id);
      }
    } catch (err: any) {
      console.log('Data loading error:', err);
    } finally {
      setDataLoading(false);
    }
  };

  const handleCustomerSelect = async (custId: number) => {
    setVisitForm((prev) => ({ ...prev, customerId: custId }));
    try {
      const cList = await apiFetch(`/customers/${custId}/contacts`);
      setContacts(cList || []);
      const primaryContact = (cList || []).find((c: any) => c.isPrimary) || (cList || [])[0];
      if (primaryContact) {
        setVisitForm((prev) => ({ ...prev, contactId: primaryContact.id }));
      }
    } catch (err) {
      setContacts([]);
    }
  };

  const getGradeFuelRate = () => {
    const empGrade = user?.grade || 'GRADE_B';
    const matched = gradeFuelRates.find((g: any) => {
      const codeA = String(g.gradeCode || '').toUpperCase().replace(/[^A-Z]/g, '');
      const codeB = String(empGrade || '').toUpperCase().replace(/[^A-Z]/g, '');
      return codeA === codeB && codeA.length > 0;
    });

    if (matched && matched.fuelRate) return parseFloat(matched.fuelRate);
    if (empGrade === 'GRADE_A') return 14.00;
    if (empGrade === 'GRADE_B') return 11.50;
    if (empGrade === 'GRADE_C') return 9.00;
    if (empGrade === 'GRADE_D') return 6.50;
    return 11.50;
  };

  const handleOpenLogModal = () => {
    const fuelRate = getGradeFuelRate();
    const defaultCustId = customers[0]?.id || null;
    setVisitForm({
      visitDate: new Date().toISOString().split('T')[0],
      customerId: defaultCustId,
      contactId: contacts[0]?.id || null,
      activityTypeId: activityTypes[0]?.id || 1,
      productId: products[0]?.id || 10,
      placeFrom: 'Baroda',
      placeTo: 'Baroda',
      startTime: '09:00',
      endTime: '18:00',
      personCount: 1,
      expenses: [
        {
          expenseHeadId: 11,
          dayStartKm: 0,
          dayEndKm: 0,
          totalKm: 0,
          fuelRate: fuelRate,
          tollTax: 0,
          amount: 0,
          remarks: 'Daily Visit Fuel',
        },
      ],
    });
    if (defaultCustId) {
      handleCustomerSelect(defaultCustId);
    }
    setOpenVisitModal(true);
  };

  const handleKmChange = (startKmStr: string, endKmStr: string) => {
    const startKm = parseFloat(startKmStr) || 0;
    const endKm = parseFloat(endKmStr) || 0;
    const rate = getGradeFuelRate();
    const totalKm = endKm >= startKm ? endKm - startKm : 0;
    const amount = Math.round(totalKm * rate);

    setVisitForm((prev) => ({
      ...prev,
      expenses: [
        {
          ...prev.expenses[0],
          dayStartKm: startKm,
          dayEndKm: endKm,
          totalKm: totalKm,
          fuelRate: rate,
          amount: amount,
        },
      ],
    }));
  };

  const handleSaveVisit = async () => {
    if (!visitForm.customerId) {
      Alert.alert('Required', 'Please select a customer organization');
      return;
    }

    setSavingVisit(true);
    try {
      const payload = {
        ...visitForm,
        employeeId: user?.id,
        departmentId: user?.departmentId || 2,
        branchId: user?.branchId || 1,
      };
      await apiFetch('/daily-visits', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      Alert.alert('Success 🎉', 'Daily Visit & Expense Claim Submitted Successfully!');
      setOpenVisitModal(false);
      fetchAppData();
    } catch (err: any) {
      Alert.alert('Submission Error', err.message || 'Failed to submit visit');
    } finally {
      setSavingVisit(false);
    }
  };

  // Login Screen Render
  if (!token || !user) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.loginCard}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoText}>FV</Text>
          </View>
          <Text style={styles.brandTitle}>Field Visit CRM</Text>
          <Text style={styles.brandSubtitle}>Mobile App for Field Sales & Service Engineers</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email / Employee Username</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="vishal@crm.com"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} disabled={authLoading}>
            {authLoading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.loginBtnText}>SIGN IN TO FIELD CRM</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.demoHint}>Demo Accounts: vishal@crm.com (Grade B) / shiva@crm.com (Grade C)</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Main Mobile App View
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header Bar */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Field Visit CRM</Text>
          <Text style={styles.headerSubtitle}>
            {user.name} ({user.role}) • <Text style={styles.gradeText}>{user.grade?.replace('_', ' ')}</Text>
          </Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={() => { setToken(null); setUser(null); }}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Main Screen Content */}
      <View style={{ flex: 1 }}>
        {activeTab === 'visits' && (
          <View style={styles.tabContent}>
            <TouchableOpacity style={styles.actionBtn} onPress={handleOpenLogModal}>
              <Text style={styles.actionBtnText}>+ LOG NEW DAILY VISIT</Text>
            </TouchableOpacity>

            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>My Daily Visits ({visits.length})</Text>
              <TouchableOpacity onPress={fetchAppData}>
                <Text style={styles.refreshText}>Refresh 🔄</Text>
              </TouchableOpacity>
            </View>

            {dataLoading ? (
              <ActivityIndicator size="large" color="#1E40AF" style={{ marginTop: 40 }} />
            ) : (
              <FlatList
                data={visits}
                keyExtractor={(item) => String(item.id)}
                renderItem={({ item }) => {
                  const totalClaim = (item.expenses || []).reduce((acc: number, curr: any) => acc + (parseFloat(curr.amount) || 0), 0);
                  const isApproved = item.status === 'Approved';
                  return (
                    <View style={styles.visitCard}>
                      <View style={styles.cardHeaderRow}>
                        <Text style={styles.custName}>{item.customer?.name || 'Customer Visit'}</Text>
                        <View style={[styles.statusChip, isApproved ? styles.chipApproved : styles.chipSubmitted]}>
                          <Text style={styles.chipText}>{item.status.toUpperCase()}</Text>
                        </View>
                      </View>

                      <Text style={styles.cardDetailText}>📍 {item.placeFrom} → {item.placeTo}</Text>
                      <Text style={styles.cardDetailText}>📅 Date: {item.visitDate ? new Date(item.visitDate).toLocaleDateString('en-IN') : '-'}</Text>
                      <Text style={styles.cardDetailText}>⚡ Activity: {item.activityType?.name || 'Service'}</Text>
                      
                      <View style={styles.cardFooterRow}>
                        <Text style={styles.claimTitle}>Total Claim:</Text>
                        <Text style={styles.claimAmount}>₹{Math.round(totalClaim).toLocaleString('en-IN')}</Text>
                      </View>
                    </View>
                  );
                }}
              />
            )}
          </View>
        )}

        {activeTab === 'customers' && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Active Customers & Contacts ({customers.length})</Text>
            <FlatList
              data={customers}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => (
                <View style={styles.customerCard}>
                  <View style={styles.cardHeaderRow}>
                    <Text style={styles.custName}>{item.name}</Text>
                    <View style={styles.typeChip}>
                      <Text style={styles.typeChipText}>{item.customerType}</Text>
                    </View>
                  </View>
                  <Text style={styles.cardDetailText}>🏭 Industry: {item.industry || '-'}</Text>
                  <Text style={styles.cardDetailText}>👤 Primary Contact: {item.contactPersonPrimary || '-'}</Text>
                  <Text style={styles.cardDetailText}>🌐 Source: {item.source || '-'}</Text>
                </View>
              )}
            />
          </View>
        )}

        {activeTab === 'profile' && (
          <ScrollView style={styles.tabContent}>
            <View style={styles.profileCard}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>{user.name ? user.name[0] : 'U'}</Text>
              </View>
              <Text style={styles.profileName}>{user.name}</Text>
              <Text style={styles.profileRole}>{user.role}</Text>

              <View style={styles.profileDivider} />

              <View style={styles.profileFieldRow}>
                <Text style={styles.fieldLabel}>Employee No:</Text>
                <Text style={styles.fieldValue}>{user.employeeNo}</Text>
              </View>
              <View style={styles.profileFieldRow}>
                <Text style={styles.fieldLabel}>Employee Grade:</Text>
                <Text style={styles.fieldValueBold}>{user.grade?.replace('_', ' ')} (₹{getGradeFuelRate()}/km)</Text>
              </View>
              <View style={styles.profileFieldRow}>
                <Text style={styles.fieldLabel}>Mobile Number:</Text>
                <Text style={styles.fieldValue}>{user.mobileNo || '-'}</Text>
              </View>
              <View style={styles.profileFieldRow}>
                <Text style={styles.fieldLabel}>Email Address:</Text>
                <Text style={styles.fieldValue}>{user.email}</Text>
              </View>
              <View style={styles.profileFieldRow}>
                <Text style={styles.fieldLabel}>Branch:</Text>
                <Text style={styles.fieldValue}>{user.branch?.name || 'Mumbai'}</Text>
              </View>
            </View>
          </ScrollView>
        )}
      </View>

      {/* Bottom Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('visits')}>
          <Text style={[styles.tabIcon, activeTab === 'visits' && styles.tabActiveText]}>📋</Text>
          <Text style={[styles.tabLabel, activeTab === 'visits' && styles.tabActiveText]}>My Visits</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('customers')}>
          <Text style={[styles.tabIcon, activeTab === 'customers' && styles.tabActiveText]}>🏢</Text>
          <Text style={[styles.tabLabel, activeTab === 'customers' && styles.tabActiveText]}>Customers</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('profile')}>
          <Text style={[styles.tabIcon, activeTab === 'profile' && styles.tabActiveText]}>👤</Text>
          <Text style={[styles.tabLabel, activeTab === 'profile' && styles.tabActiveText]}>My Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Log Visit Modal */}
      <Modal visible={openVisitModal} animationType="slide">
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF' }}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Log Daily Visit & Fuel Claim</Text>
            <TouchableOpacity onPress={() => setOpenVisitModal(false)}>
              <Text style={styles.modalCloseText}>✕ Close</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={{ padding: 20 }}>
            <Text style={styles.formGroupTitle}>1. Customer & Activity</Text>
            <Text style={styles.inputLabel}>Select Customer Organization *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              {customers.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  style={[styles.choiceChip, visitForm.customerId === c.id && styles.choiceChipActive]}
                  onPress={() => handleCustomerSelect(c.id)}
                >
                  <Text style={[styles.choiceChipText, visitForm.customerId === c.id && styles.choiceChipTextActive]}>
                    {c.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.inputLabel}>Activity Type *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              {activityTypes.map((a) => (
                <TouchableOpacity
                  key={a.id}
                  style={[styles.choiceChip, visitForm.activityTypeId === a.id && styles.choiceChipActive]}
                  onPress={() => setVisitForm({ ...visitForm, activityTypeId: a.id })}
                >
                  <Text style={[styles.choiceChipText, visitForm.activityTypeId === a.id && styles.choiceChipTextActive]}>
                    {a.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.formGroupTitle}>2. Schedule & Places</Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Place From *</Text>
                <TextInput
                  style={styles.input}
                  value={visitForm.placeFrom}
                  onChangeText={(val) => setVisitForm({ ...visitForm, placeFrom: val })}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Place To *</Text>
                <TextInput
                  style={styles.input}
                  value={visitForm.placeTo}
                  onChangeText={(val) => setVisitForm({ ...visitForm, placeTo: val })}
                />
              </View>
            </View>

            <Text style={styles.formGroupTitle}>3. Fuel Expense Sub-Grid (Grade Auto-Calculated)</Text>
            <View style={styles.fuelRateNotice}>
              <Text style={styles.fuelNoticeText}>
                Grade {user.grade?.replace('_', ' ')} Mapped Rate: <Text style={{ fontWeight: '700' }}>₹{getGradeFuelRate()} / km</Text>
              </Text>
            </View>

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Start Km</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  placeholder="0"
                  onChangeText={(val) => handleKmChange(val, String(visitForm.expenses[0]?.dayEndKm || 0))}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>End Km</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  placeholder="0"
                  onChangeText={(val) => handleKmChange(String(visitForm.expenses[0]?.dayStartKm || 0), val)}
                />
              </View>
            </View>

            <View style={styles.totalClaimBox}>
              <Text style={styles.totalClaimLabel}>Calculated Fuel Amount:</Text>
              <Text style={styles.totalClaimVal}>₹{Math.round(visitForm.expenses[0]?.amount || 0).toLocaleString('en-IN')}</Text>
            </View>

            <TouchableOpacity style={styles.saveSubmitBtn} onPress={handleSaveVisit} disabled={savingVisit}>
              {savingVisit ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.saveSubmitText}>SUBMIT DAILY VISIT & CLAIM</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  loginCard: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logoBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1E40AF',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  logoText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 24,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1E40AF',
    textAlign: 'center',
  },
  brandSubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
    marginTop: 4,
  },
  inputContainer: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  loginBtn: {
    backgroundColor: '#1E40AF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  demoHint: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E40AF',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#475569',
  },
  gradeText: {
    color: '#D97706',
    fontWeight: '700',
  },
  logoutBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#FEF2F2',
    borderRadius: 6,
  },
  logoutText: {
    color: '#EF4444',
    fontWeight: '600',
    fontSize: 12,
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },
  actionBtn: {
    backgroundColor: '#0D9488',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  refreshText: {
    color: '#2563EB',
    fontSize: 12,
    fontWeight: '600',
  },
  visitCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  custName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    flex: 1,
  },
  statusChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  chipApproved: {
    backgroundColor: '#DCFCE7',
  },
  chipSubmitted: {
    backgroundColor: '#FEF3C7',
  },
  chipText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#15803D',
  },
  cardDetailText: {
    fontSize: 13,
    color: '#475569',
    marginBottom: 4,
  },
  cardFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  claimTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  claimAmount: {
    fontSize: 16,
    fontWeight: '800',
    color: '#059669',
  },
  customerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  typeChip: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  typeChipText: {
    fontSize: 11,
    color: '#2563EB',
    fontWeight: '600',
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  avatarCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#1E40AF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '700',
  },
  profileName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  profileRole: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  profileDivider: {
    width: '100%',
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 16,
  },
  profileFieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 13,
    color: '#64748B',
  },
  fieldValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  fieldValueBold: {
    fontSize: 13,
    fontWeight: '700',
    color: '#D97706',
  },
  tabBar: {
    flexDirection: 'row',
    height: 60,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabIcon: {
    fontSize: 20,
    color: '#94A3B8',
  },
  tabLabel: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  tabActiveText: {
    color: '#1E40AF',
    fontWeight: '700',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  modalCloseText: {
    color: '#EF4444',
    fontWeight: '600',
  },
  formGroupTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E40AF',
    marginTop: 12,
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
  },
  choiceChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  choiceChipActive: {
    backgroundColor: '#1E40AF',
    borderColor: '#1E40AF',
  },
  choiceChipText: {
    fontSize: 12,
    color: '#334155',
  },
  choiceChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  fuelRateNotice: {
    backgroundColor: '#FEF3C7',
    padding: 10,
    borderRadius: 6,
  },
  fuelNoticeText: {
    fontSize: 12,
    color: '#92400E',
  },
  totalClaimBox: {
    backgroundColor: '#ECFDF5',
    padding: 14,
    borderRadius: 8,
    marginVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalClaimLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#065F46',
  },
  totalClaimVal: {
    fontSize: 20,
    fontWeight: '800',
    color: '#047857',
  },
  saveSubmitBtn: {
    backgroundColor: '#1E40AF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 40,
  },
  saveSubmitText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
});
