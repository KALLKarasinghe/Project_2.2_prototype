import React, { createContext, useContext, useState, useEffect } from 'react';

const SystemContext = createContext();

export const useSystemStore = () => {
  const context = useContext(SystemContext);
  if (!context) {
    throw new Error('useSystemStore must be used within a SystemProvider');
  }
  return context;
};

const defaultMedicines = [
  { id: 'm1', name: 'Panadol (Paracetamol 500mg)', brand: 'GSK', stock: 50000, price: 10, supplierId: 'u_s7', expireDate: '2027-06-30', description: 'Effective for fast pain relief and reducing fever.', reviews: [{ reviewer: 'Sethsuwa Pharmacy', rating: 5, comment: 'Always highly requested. Fast delivery from GSK.', date: '2026-04-15' }] },
  { id: 'm2', name: 'Piriton (Chlorphenamine 4mg)', brand: 'GSK', stock: 15000, price: 8, supplierId: 'u_s7', expireDate: '2027-03-31', description: 'Used for treating allergies, hay fever, and insect bites.', reviews: [] },
  { id: 'm3', name: 'Samahan', brand: 'Link Natural', stock: 100000, price: 25, supplierId: 'u_s14', expireDate: '2028-01-15', description: 'Traditional herbal remedy for cold and cold-related symptoms.', reviews: [{ reviewer: 'Kasun Silva', rating: 4, comment: 'Great for cold symptoms, genuine product.', date: '2026-05-02' }, { reviewer: 'Rajini Pharmacy - Kandy', rating: 5, comment: 'Best selling herbal item this month.', date: '2026-05-05' }] },
  { id: 'm4', name: 'Siddhalepa Balm (50g)', brand: 'Hettigoda', stock: 8000, price: 250, supplierId: 'u_s15', expireDate: '2028-09-01', description: 'Ayurvedic balm for headaches, muscular aches, and colds.', reviews: [] },
  { id: 'm5', name: 'Metformin 500mg', brand: 'SPC', stock: 30000, price: 10, supplierId: 'u_s10', expireDate: '2027-11-30', description: 'Used to treat type 2 diabetes by controlling high blood sugar.', reviews: [] },
  { id: 'm6', name: 'Losartan 50mg', brand: 'Morison', stock: 25000, price: 20, supplierId: 'u_s3', expireDate: '2027-08-31', description: 'Medication used to treat high blood pressure (hypertension).', reviews: [] },
  { id: 'm7', name: 'Amoxicillin 500mg', brand: 'Astron', stock: 12000, price: 30, supplierId: 'u_s5', expireDate: '2027-04-30', description: 'Antibiotic used for treating a wide variety of bacterial infections.', reviews: [] },
  { id: 'm8', name: 'Vitamin C 100mg', brand: 'Hemas', stock: 40000, price: 15, supplierId: 'u_s1', expireDate: '2028-05-31', description: 'Daily dietary supplement for boosting immunity and preventing scurvy.', reviews: [{ reviewer: 'City Care - Colombo', rating: 4, comment: 'Good stock availability.', date: '2026-04-20' }] },
  { id: 'm9', name: 'Aspirin 75mg', brand: 'Baurs', stock: 25000, price: 12, supplierId: 'u_s2', expireDate: '2027-09-30', description: 'Low dose aspirin to prevent blood clots and reduce heart attack risk.', reviews: [] },
  { id: 'm10', name: 'Atorvastatin 20mg', brand: 'SPC', stock: 18000, price: 35, supplierId: 'u_s10', expireDate: '2027-12-31', description: 'Lowers "bad" cholesterol and triglycerides in the blood.', reviews: [] },
  { id: 'm11', name: 'Omeprazole 20mg', brand: 'Astron', stock: 22000, price: 18, supplierId: 'u_s5', expireDate: '2027-07-31', description: 'Decreases stomach acid, used for GERD and acid reflux.', reviews: [] },
  { id: 'm12', name: 'Diclofenac Sodium 50mg', brand: 'Morison', stock: 16000, price: 10, supplierId: 'u_s3', expireDate: '2027-05-31', description: 'Nonsteroidal anti-inflammatory drug (NSAID) for pain and arthritis.', reviews: [] },
  { id: 'm13', name: 'Salbutamol Inhaler', brand: 'GSK', stock: 3500, price: 1200, supplierId: 'u_s7', expireDate: '2027-10-31', description: 'Relief inhaler for asthma and COPD bronchospasms.', reviews: [] },
  { id: 'm14', name: 'Cetirizine 10mg', brand: 'Hemas', stock: 28000, price: 15, supplierId: 'u_s1', expireDate: '2028-02-28', description: 'Non-drowsy antihistamine for allergy symptoms.', reviews: [] },
  { id: 'm15', name: 'Ibuprofen 400mg', brand: 'Sunshine', stock: 31000, price: 12, supplierId: 'u_s4', expireDate: '2027-11-30', description: 'NSAID used for reducing pain, inflammation, and high fever.', reviews: [] },
  { id: 'm16', name: 'Azithromycin 500mg', brand: 'Baurs', stock: 9000, price: 80, supplierId: 'u_s2', expireDate: '2027-06-30', description: 'Macrolide antibiotic to treat respiratory and skin infections.', reviews: [] },
  { id: 'm17', name: 'Domperidone 10mg', brand: 'Navesta', stock: 14000, price: 10, supplierId: 'u_s9', expireDate: '2028-03-31', description: 'Anti-emetic medicine to relieve nausea and vomiting.', reviews: [] },
  { id: 'm18', name: 'Folic Acid 5mg', brand: 'Astron', stock: 50000, price: 5, supplierId: 'u_s5', expireDate: '2028-07-31', description: 'Supplement for treating folic acid deficiency, especially in pregnancy.', reviews: [] },
  { id: 'm19', name: 'Calcium Sandoz', brand: 'George Steuart', stock: 6000, price: 450, supplierId: 'u_s8', expireDate: '2027-08-31', description: 'Effervescent tablets for strong bones and calcium deficiency.', reviews: [] },
  { id: 'm20', name: 'Ranitidine 150mg', brand: 'Emerchemie', stock: 20000, price: 8, supplierId: 'u_s11', expireDate: '2027-04-30', description: 'Antacid medication for treating stomach ulcers and acid indigestion.', reviews: [] },
  { id: 'm21', name: 'Thyroxine 50mcg', brand: 'Hemas', stock: 11000, price: 12, supplierId: 'u_s1', expireDate: '2028-01-31', description: 'Hormone replacement therapy for hypothyroidism.', reviews: [] },
  { id: 'm22', name: 'Amikacin Injection', brand: 'CIC', stock: 4000, price: 850, supplierId: 'u_s6', expireDate: '2027-09-30', description: 'Injectable antibiotic for severe, hospital-acquired bacterial infections.', reviews: [] },
  { id: 'm23', name: 'Dexamethasone 0.5mg', brand: 'Astron', stock: 17000, price: 8, supplierId: 'u_s5', expireDate: '2027-12-31', description: 'Corticosteroid used to relieve severe inflammation and allergic reactions.', reviews: [] },
  { id: 'm24', name: 'Ciprofloxacin 500mg', brand: 'Morison', stock: 13000, price: 25, supplierId: 'u_s3', expireDate: '2027-06-30', description: 'Fluoroquinolone antibiotic for severe urinary tract and skin infections.', reviews: [] },
  { id: 'm25', name: 'Chlorpheniramine 4mg', brand: 'SPC', stock: 35000, price: 5, supplierId: 'u_s10', expireDate: '2028-04-30', description: 'Classic antihistamine for managing sudden allergic episodes.', reviews: [] },
  { id: 'm26', name: 'Eltroxin 50mcg', brand: 'GSK', stock: 9500, price: 20, supplierId: 'u_s7', expireDate: '2027-10-31', description: 'Thyroid hormone replacement drug for underactive thyroid conditions.', reviews: [] },
  { id: 'm27', name: 'Gliclazide 80mg', brand: 'Mega Lifesciences', stock: 12500, price: 18, supplierId: 'u_s19', expireDate: '2027-07-31', description: 'Anti-diabetic medication used to control type 2 diabetes mellitus.', reviews: [] },
  { id: 'm28', name: 'Clopidogrel 75mg', brand: 'Baurs', stock: 10500, price: 30, supplierId: 'u_s2', expireDate: '2028-02-28', description: 'Antiplatelet medication for patients with a high risk of stroke.', reviews: [] },
  { id: 'm29', name: 'Enalapril 5mg', brand: 'Astron', stock: 14000, price: 15, supplierId: 'u_s5', expireDate: '2027-11-30', description: 'ACE inhibitor prescribed for hypertension and heart failure.', reviews: [] },
  { id: 'm30', name: 'Mefenamic Acid 500mg', brand: 'Sunshine', stock: 16000, price: 18, supplierId: 'u_s4', expireDate: '2027-08-31', description: 'NSAID commonly used to treat menstrual pain and moderate cramps.', reviews: [] },
  { id: 'm31', name: 'Zinnat (Cefuroxime)', brand: 'GSK', stock: 4000, price: 180, supplierId: 'u_s7', expireDate: '2027-05-31', description: 'Broad-spectrum antibiotic for serious throat and respiratory infections.', reviews: [] },
  { id: 'm32', name: 'Prednisolone 5mg', brand: 'Morison', stock: 22000, price: 6, supplierId: 'u_s3', expireDate: '2028-06-30', description: 'Steroid medication for controlling severe inflammatory diseases.', reviews: [] },
  { id: 'm33', name: 'Augmentin 625mg', brand: 'GSK', stock: 8000, price: 240, supplierId: 'u_s7', expireDate: '2027-09-30', description: 'Potent antibiotic combination for resistant bacterial infections.', reviews: [] },
  { id: 'm34', name: 'Neurobion', brand: 'Baurs', stock: 15000, price: 35, supplierId: 'u_s2', expireDate: '2028-03-31', description: 'Vitamin B complex supplement supporting nerve health and metabolism.', reviews: [] },
  { id: 'm35', name: 'Link Sudantha (Toothpaste)', brand: 'Link Natural', stock: 40000, price: 150, supplierId: 'u_s14', expireDate: '2028-08-31', description: 'Ayurvedic herbal toothpaste for complete oral hygiene and care.', reviews: [] },
  { id: 'm36', name: 'Amlodipine 5mg', brand: 'Emerchemie', stock: 18000, price: 12, supplierId: 'u_s11', expireDate: '2027-10-31', description: 'Calcium channel blocker to lower blood pressure and prevent chest pain.', reviews: [] },
  { id: 'm37', name: 'Losartan 25mg', brand: 'Navesta', stock: 9000, price: 15, supplierId: 'u_s9', expireDate: '2027-12-31', description: 'Low dose medication for mild hypertension and kidney protection.', reviews: [] },
  { id: 'm38', name: 'Pantoprazole 40mg', brand: 'CIC', stock: 13000, price: 22, supplierId: 'u_s6', expireDate: '2028-05-31', description: 'Proton-pump inhibitor for severe acid reflux and ulcer healing.', reviews: [] },
  { id: 'm39', name: 'Saline Solution 500ml', brand: 'B. Braun', stock: 5000, price: 350, supplierId: 'u_s20', expireDate: '2027-07-31', description: 'Sterile IV fluid for dehydration and intravenous medication delivery.', reviews: [] },
  { id: 'm40', name: 'Surgical Spirit 50ml', brand: 'George Steuart', stock: 12000, price: 150, supplierId: 'u_s8', expireDate: '2028-04-30', description: 'Topical antiseptic application for sterilizing skin and small wounds.', reviews: [] }
];

const defaultUsers = [
  // 4 Admins
  { id: 'admin1', name: 'Linuka', password: '2001', role: 'Admin', status: 'Active' },
  { id: 'admin2', name: 'Thushara', password: '2003', role: 'Admin', status: 'Active' },
  { id: 'admin3', name: 'Sasindu', password: '2002', role: 'Admin', status: 'Active' },
  { id: 'admin4', name: 'Dewmini', password: '2002', role: 'Admin', status: 'Active' },
  
  // 20 Massive Suppliers
  { id: 'u_s1', name: 'Hemas Pharmaceuticals', email: 'sales@hemas.lk', password: 'password', role: 'Supplier', status: 'Active', phone: '0114731731', address: 'Colombo 02' },
  { id: 'u_s2', name: 'Baurs & Co', email: 'medical@baurs.lk', password: 'password', role: 'Supplier', status: 'Active', phone: '0112320550', address: 'Colombo 01' },
  { id: 'u_s3', name: 'Morison PLC', email: 'info@morison.lk', password: 'password', role: 'Supplier', status: 'Active', phone: '0112698944', address: 'Colombo 14' },
  { id: 'u_s4', name: 'Sunshine Healthcare', email: 'healthcare@sunshine.lk', password: 'password', role: 'Supplier', status: 'Active', phone: '0114702400', address: 'Kelaniya' },
  { id: 'u_s5', name: 'Astron Ltd', email: 'info@astron.lk', password: 'password', role: 'Supplier', status: 'Active', phone: '0112636711', address: 'Ratmalana' },
  { id: 'u_s6', name: 'CIC Holdings', email: 'pharma@cic.lk', password: 'password', role: 'Supplier', status: 'Active', phone: '0112696331', address: 'Colombo 08' },
  { id: 'u_s7', name: 'GlaxoSmithKline Lanka', email: 'gsk.lanka@gsk.com', password: 'password', role: 'Supplier', status: 'Active', phone: '0112636341', address: 'Moratuwa' },
  { id: 'u_s8', name: 'George Steuart Health', email: 'gshealth@georgesteuart.lk', password: 'password', role: 'Supplier', status: 'Active', phone: '0114931931', address: 'Colombo 03' },
  { id: 'u_s9', name: 'Navesta Pharmaceuticals', email: 'sales@navesta.lk', password: 'password', role: 'Supplier', status: 'Active', phone: '0112445566', address: 'Horana' },
  { id: 'u_s10', name: 'SPC Wholesale', email: 'wholesale@spc.lk', password: 'password', role: 'Supplier', status: 'Active', phone: '0112320500', address: 'Colombo 10' },
  { id: 'u_s11', name: 'Emerchemie NB', email: 'info@emerchemie.lk', password: 'password', role: 'Supplier', status: 'Active', phone: '0112813131', address: 'Nugegoda' },
  { id: 'u_s12', name: 'J.L. Morison Son & Jones', email: 'jlmsj@morison.lk', password: 'password', role: 'Supplier', status: 'Active', phone: '0112431431', address: 'Colombo 13' },
  { id: 'u_s13', name: 'Kevilton', email: 'pharma@kevilton.lk', password: 'password', role: 'Supplier', status: 'Active', phone: '0112727333', address: 'Peliyagoda' },
  { id: 'u_s14', name: 'Link Natural Products', email: 'info@linknatural.com', password: 'password', role: 'Supplier', status: 'Active', phone: '0112564223', address: 'Maharagama' },
  { id: 'u_s15', name: 'Hettigoda Industries', email: 'info@siddhalepa.com', password: 'password', role: 'Supplier', status: 'Active', phone: '0112736910', address: 'Ratmalana' },
  { id: 'u_s16', name: 'Durdans Medical Supplies', email: 'supplies@durdans.com', password: 'password', role: 'Supplier', status: 'Active', phone: '0112140000', address: 'Colombo 03' },
  { id: 'u_s17', name: 'Nawaloka Medicare Supplies', email: 'pharma@nawaloka.com', password: 'password', role: 'Supplier', status: 'Active', phone: '0112304444', address: 'Colombo 02' },
  { id: 'u_s18', name: 'Asiri Health Logistics', email: 'supply@asiri.lk', password: 'password', role: 'Supplier', status: 'Active', phone: '0114524400', address: 'Narahenpita' },
  { id: 'u_s19', name: 'Mega Lifesciences Lanka', email: 'info@megalifesciences.lk', password: 'password', role: 'Supplier', status: 'Active', phone: '0112448899', address: 'Colombo 04' },
  { id: 'u_s20', name: 'B. Braun Lanka', email: 'info.lk@bbraun.com', password: 'password', role: 'Supplier', status: 'Active', phone: '0112595533', address: 'Colombo 05' },

  // 5 Pharmacies
  { id: 'u_p1', name: 'Sethsuwa Pharmacy - Nugegoda', email: 'nugegoda@sethsuwa.lk', password: 'password', role: 'Pharmacy', status: 'Active', phone: '0112854321', address: 'Nugegoda' },
  { id: 'u_p2', name: 'Arogya Medicals - Badulla', email: 'badulla@arogya.lk', password: 'password', role: 'Pharmacy', status: 'Active', phone: '0552223344', address: 'Badulla' },
  { id: 'u_p3', name: 'Rajini Pharmacy - Kandy', email: 'info@rajinirx.lk', password: 'password', role: 'Pharmacy', status: 'Active', phone: '0812233445', address: 'Kandy' },
  { id: 'u_p4', name: 'City Care - Colombo', email: 'colombo@citycare.lk', password: 'password', role: 'Pharmacy', status: 'Active', phone: '0112556677', address: 'Colombo' },
  { id: 'u_p5', name: 'Suwasetha Pharmacy - Galle', email: 'galle@suwasetha.lk', password: 'password', role: 'Pharmacy', status: 'Active', phone: '0912233445', address: 'Galle' },
  
  // 5 Customers
  { id: 'u_c1', name: 'Kasun Silva', email: 'kasun.s@gmail.com', password: 'password', role: 'Customer', status: 'Active', phone: '0771122334', address: 'Dehiwala' },
  { id: 'u_c2', name: 'Nuwan Fernando', email: 'nuwan.f@yahoo.com', password: 'password', role: 'Customer', status: 'Active', phone: '0719988776', address: 'Moratuwa' },
  { id: 'u_c3', name: 'Nethmi Ratnayake', email: 'nethmi.r@gmail.com', password: 'password', role: 'Customer', status: 'Active', phone: '0704455667', address: 'Maharagama' },
  { id: 'u_c4', name: 'Dilshan Weerasinghe', email: 'dilshan.w@outlook.com', password: 'password', role: 'Customer', status: 'Active', phone: '0782233445', address: 'Malabe' },
  { id: 'u_c5', name: 'Kavindi Perera', email: 'kavindi.p@hotmail.com', password: 'password', role: 'Customer', status: 'Active', phone: '0715566778', address: 'Panadura' }
];

const defaultOrders = [
  { id: 'o1', medicineId: 'm1', medicineName: 'Panadol (Paracetamol 500mg)', quantity: 2000, status: 'Delivered', pharmacyId: 'u_p1' },
  { id: 'o2', medicineId: 'm3', medicineName: 'Samahan', quantity: 5000, status: 'Approved', pharmacyId: 'u_p2' },
  { id: 'o3', medicineId: 'm5', medicineName: 'Metformin 500mg', quantity: 1500, status: 'Pending', pharmacyId: 'u_p3' },
  { id: 'o4', medicineId: 'm8', medicineName: 'Vitamin C 100mg', quantity: 3000, status: 'Delivered', pharmacyId: 'u_p4' },
  { id: 'o5', medicineId: 'm12', medicineName: 'Diclofenac Sodium 50mg', quantity: 1000, status: 'Approved', pharmacyId: 'u_p1' },
  { id: 'o6', medicineId: 'm33', medicineName: 'Augmentin 625mg', quantity: 500, status: 'Pending', pharmacyId: 'u_p5' },
  { id: 'o7', medicineId: 'm18', medicineName: 'Folic Acid 5mg', quantity: 4000, status: 'Delivered', pharmacyId: 'u_p2' },
  { id: 'o8', medicineId: 'm21', medicineName: 'Thyroxine 50mcg', quantity: 1200, status: 'Approved', pharmacyId: 'u_p3' },
  { id: 'o9', medicineId: 'm24', medicineName: 'Ciprofloxacin 500mg', quantity: 800, status: 'Pending', pharmacyId: 'u_p4' },
  { id: 'o10', medicineId: 'm26', medicineName: 'Eltroxin 50mcg', quantity: 900, status: 'Delivered', pharmacyId: 'u_p1' },
  { id: 'o11', medicineId: 'm39', medicineName: 'Saline Solution 500ml', quantity: 1800, status: 'Approved', pharmacyId: 'u_p5' },
  { id: 'o12', medicineId: 'm10', medicineName: 'Atorvastatin 20mg', quantity: 1400, status: 'Pending', pharmacyId: 'u_p2' },
  { id: 'o13', medicineId: 'm13', medicineName: 'Salbutamol Inhaler', quantity: 250, status: 'Delivered', pharmacyId: 'u_p3' },
  { id: 'o14', medicineId: 'm29', medicineName: 'Enalapril 5mg', quantity: 1100, status: 'Approved', pharmacyId: 'u_p4' },
  { id: 'o15', medicineId: 'm30', medicineName: 'Mefenamic Acid 500mg', quantity: 2200, status: 'Pending', pharmacyId: 'u_p1' },
  { id: 'o16', medicineId: 'm35', medicineName: 'Link Sudantha (Toothpaste)', quantity: 3000, status: 'Approved', pharmacyId: 'u_p5' },
  { id: 'o17', medicineId: 'm4', medicineName: 'Siddhalepa Balm (50g)', quantity: 1500, status: 'Pending', pharmacyId: 'u_p2' },
  { id: 'o18', medicineId: 'm19', medicineName: 'Calcium Sandoz', quantity: 400, status: 'Delivered', pharmacyId: 'u_p3' },
  { id: 'o19', medicineId: 'm31', medicineName: 'Zinnat (Cefuroxime)', quantity: 600, status: 'Pending', pharmacyId: 'u_p4' },
  { id: 'o20', medicineId: 'm40', medicineName: 'Surgical Spirit 50ml', quantity: 1200, status: 'Approved', pharmacyId: 'u_p1' }
];

const defaultPendingUsers = [
  { id: 'p1', name: 'Biogenics Lanka', email: 'info@biogenics.lk', password: 'password', role: 'Supplier', status: 'Pending', licenseDocument: 'biogenics_biz_reg.pdf', phone: '0114556677', address: 'Colombo 08' },
  { id: 'p2', name: 'Medica Importers', email: 'sales@medica.lk', password: 'password', role: 'Supplier', status: 'Pending', licenseDocument: 'medica_import_license.pdf', phone: '0112334455', address: 'Dehiwala' },
  { id: 'p3', name: 'Lanka Hospitals Diagnostics (Supply)', email: 'supply@lhd.lk', password: 'password', role: 'Supplier', status: 'Pending', licenseDocument: 'lhd_dist_cert.pdf', phone: '0115430000', address: 'Colombo 05' },
  { id: 'p4', name: 'MediCare Pharmacy - Kurunegala', email: 'info@medicare.lk', password: 'password', role: 'Pharmacy', status: 'Pending', licenseDocument: 'medicare_license.pdf', phone: '0372223344', address: 'Kurunegala' },
  { id: 'p5', name: 'Dr. S. Wijesinghe', email: 'wijesinghe.s@medagents.lk', password: 'password', role: 'Medical Agent', status: 'Pending', licenseDocument: 'slmc_reg.pdf', phone: '0714455667', address: 'Anuradhapura' }
];

const defaultSpecialMedicines = [
  { id: 'sm1', name: 'Paclitaxel 100mg', usedFor: 'Breast & Ovarian Cancer Treatment', agentName: 'Medical Agent Kamal', agentPhone: '071 223 3445' },
  { id: 'sm2', name: 'Doxorubicin 50mg', usedFor: 'Leukemia & Lymphoma Treatment', agentName: 'Dr. S. Wijesinghe', agentPhone: '071 445 5667' },
  { id: 'sm3', name: 'Trastuzumab 440mg', usedFor: 'HER2-Positive Breast Cancer', agentName: 'Medical Agent Kamal', agentPhone: '071 223 3445' },
  { id: 'sm4', name: 'Cyclophosphamide 500mg', usedFor: 'Multiple Myeloma & Autoimmune Disorders', agentName: 'Dr. R. Perera', agentPhone: '077 889 9001' },
  { id: 'sm5', name: 'Imatinib 400mg', usedFor: 'Chronic Myeloid Leukemia (CML)', agentName: 'Dr. S. Wijesinghe', agentPhone: '071 445 5667' }
];

export const SystemProvider = ({ children }) => {
  // Initialize state from localStorage or fallback to defaults
  const [medicines, setMedicines] = useState(() => {
    const saved = localStorage.getItem('medicines');
    if (!saved) return defaultMedicines;
    const savedArr = JSON.parse(saved);
    // Merge: start with saved data (preserves reviews etc), but always apply defaults for new fields like expireDate
    return defaultMedicines.map(def => {
      const found = savedArr.find(s => s.id === def.id);
      if (!found) return def;
      // Keep saved fields (e.g. reviews), but fill in any NEW fields from def that aren't in saved
      return {
        ...found,
        expireDate: found.expireDate || def.expireDate,
        description: found.description || def.description,
      };
    });
  });

  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('orders');
    return saved ? JSON.parse(saved) : defaultOrders;
  });
  
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('users');
    return saved ? JSON.parse(saved) : defaultUsers;
  });

  const [pendingUsers, setPendingUsers] = useState(() => {
    const saved = localStorage.getItem('pendingUsers');
    return saved ? JSON.parse(saved) : defaultPendingUsers;
  });

  const [specialMedicines, setSpecialMedicines] = useState(() => {
    const saved = localStorage.getItem('specialMedicines');
    return saved ? JSON.parse(saved) : defaultSpecialMedicines;
  });
  
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });

  // Persist state changes to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('medicines', JSON.stringify(medicines));
  }, [medicines]);

  useEffect(() => {
    localStorage.setItem('orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('pendingUsers', JSON.stringify(pendingUsers));
  }, [pendingUsers]);

  useEffect(() => {
    localStorage.setItem('specialMedicines', JSON.stringify(specialMedicines));
  }, [specialMedicines]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [currentUser]);

  const loginUser = (user) => {
    setCurrentUser(user);
  };

  const logoutUser = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  const placeOrder = (medicine, quantity) => {
    const newOrder = {
      id: `o${Date.now()}`,
      medicineId: medicine.id,
      medicineName: medicine.name,
      quantity: quantity,
      status: 'Pending'
    };
    setOrders((prevOrders) => [...prevOrders, newOrder]);
  };

  const approveOrder = (orderId) => {
    setOrders((prevOrders) => {
      const updatedOrders = prevOrders.map(order => 
        order.id === orderId ? { ...order, status: 'Approved' } : order
      );
      
      const orderToApprove = updatedOrders.find(o => o.id === orderId);
      if (orderToApprove) {
        setMedicines((prevMedicines) => 
          prevMedicines.map(med => 
            med.id === orderToApprove.medicineId
              ? { ...med, stock: Math.max(0, med.stock - orderToApprove.quantity) }
              : med
          )
        );
      }
      return updatedOrders;
    });
  };

  const registerUser = (userData) => {
    const newUser = {
      ...userData,
      id: `u${Date.now()}`,
      status: 'Pending'
    };
    setPendingUsers((prev) => [...prev, newUser]);
  };

  const approveUser = (userId) => {
    const userToApprove = pendingUsers.find(u => u.id === userId);
    if (userToApprove) {
      setUsers([...users, { ...userToApprove, status: 'Active' }]);
      setPendingUsers(pendingUsers.filter(u => u.id !== userId));
    }
  };

  const deleteUser = (userId) => {
    setUsers((prev) => prev.filter(u => u.id !== userId));
  };

  const addMedicine = (medicineData) => {
    const newMed = {
      ...medicineData,
      id: `m${Date.now()}`,
      supplierId: 's_custom',
      reviews: []
    };
    setMedicines((prev) => [...prev, newMed]);
  };

  const addSpecialMedicine = (medicineData) => {
    const newMed = {
      ...medicineData,
      id: `sm${Date.now()}`
    };
    setSpecialMedicines((prev) => [...prev, newMed]);
  };

  const value = {
    medicines,
    specialMedicines,
    orders,
    users,
    pendingUsers,
    placeOrder,
    approveOrder,
    registerUser,
    approveUser,
    deleteUser,
    addMedicine,
    addSpecialMedicine,
    currentUser,
    loginUser,
    logoutUser
  };

  return (
    <SystemContext.Provider value={value}>
      {children}
    </SystemContext.Provider>
  );
};
