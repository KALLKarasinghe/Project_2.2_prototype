-- =====================================================
-- B2B Pharmaceutical Network - Database Schema
-- Project: Global Medicine (Project 2.2)
-- =====================================================

CREATE DATABASE IF NOT EXISTS pharma_network;
USE pharma_network;

-- =====================================================
-- 1. USERS TABLE
-- Roles: Admin, Supplier, Pharmacy, Customer, Medical Agent
-- =====================================================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    legacy_id VARCHAR(20) UNIQUE COMMENT 'Maps to old frontend IDs like u_s1, admin1, etc.',
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE DEFAULT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('Admin', 'Supplier', 'Pharmacy', 'Customer', 'Medical Agent') NOT NULL,
    status ENUM('Active', 'Pending', 'Inactive') NOT NULL DEFAULT 'Pending',
    phone VARCHAR(20) DEFAULT NULL,
    address VARCHAR(255) DEFAULT NULL,
    license_document VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_role (role),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- 2. MEDICINES TABLE
-- =====================================================
CREATE TABLE medicines (
    id INT AUTO_INCREMENT PRIMARY KEY,
    legacy_id VARCHAR(20) UNIQUE COMMENT 'Maps to old frontend IDs like m1, m2, etc.',
    name VARCHAR(200) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    stock INT NOT NULL DEFAULT 0,
    expire_date DATE DEFAULT NULL,
    description TEXT DEFAULT NULL,
    supplier_id INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_brand (brand),
    INDEX idx_supplier (supplier_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- 3. MEDICINE REVIEWS TABLE
-- =====================================================
CREATE TABLE medicine_reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    medicine_id INT NOT NULL,
    reviewer VARCHAR(150) NOT NULL,
    rating TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT DEFAULT NULL,
    review_date DATE DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE CASCADE,
    INDEX idx_medicine (medicine_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- 4. ORDERS TABLE
-- =====================================================
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    legacy_id VARCHAR(20) UNIQUE COMMENT 'Maps to old frontend IDs like o1, o2, etc.',
    medicine_id INT NOT NULL,
    pharmacy_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    status ENUM('Pending', 'Approved', 'Delivered', 'Rejected') NOT NULL DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE CASCADE,
    FOREIGN KEY (pharmacy_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_status (status),
    INDEX idx_pharmacy (pharmacy_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- 5. SPECIAL MEDICINES TABLE
-- =====================================================
CREATE TABLE special_medicines (
    id INT AUTO_INCREMENT PRIMARY KEY,
    legacy_id VARCHAR(20) UNIQUE,
    name VARCHAR(200) NOT NULL,
    used_for TEXT NOT NULL,
    agent_name VARCHAR(150) NOT NULL,
    agent_phone VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- =====================================================
-- SEED DATA - Users
-- =====================================================

-- Admins
INSERT INTO users (legacy_id, name, email, password, role, status) VALUES
('admin1', 'Linuka', NULL, '2001', 'Admin', 'Active'),
('admin2', 'Thushara', NULL, '2003', 'Admin', 'Active'),
('admin3', 'Sasindu', NULL, '2002', 'Admin', 'Active'),
('admin4', 'Dewmini', NULL, '2002', 'Admin', 'Active');

-- Suppliers (IDs 5-24)
INSERT INTO users (legacy_id, name, email, password, role, status, phone, address) VALUES
('u_s1',  'Hemas Pharmaceuticals',            'sales@hemas.lk',            'password', 'Supplier', 'Active', '0114731731', 'Colombo 02'),
('u_s2',  'Baurs & Co',                       'medical@baurs.lk',          'password', 'Supplier', 'Active', '0112320550', 'Colombo 01'),
('u_s3',  'Morison PLC',                      'info@morison.lk',           'password', 'Supplier', 'Active', '0112698944', 'Colombo 14'),
('u_s4',  'Sunshine Healthcare',               'healthcare@sunshine.lk',    'password', 'Supplier', 'Active', '0114702400', 'Kelaniya'),
('u_s5',  'Astron Ltd',                        'info@astron.lk',            'password', 'Supplier', 'Active', '0112636711', 'Ratmalana'),
('u_s6',  'CIC Holdings',                     'pharma@cic.lk',             'password', 'Supplier', 'Active', '0112696331', 'Colombo 08'),
('u_s7',  'GlaxoSmithKline Lanka',            'gsk.lanka@gsk.com',         'password', 'Supplier', 'Active', '0112636341', 'Moratuwa'),
('u_s8',  'George Steuart Health',            'gshealth@georgesteuart.lk', 'password', 'Supplier', 'Active', '0114931931', 'Colombo 03'),
('u_s9',  'Navesta Pharmaceuticals',          'sales@navesta.lk',          'password', 'Supplier', 'Active', '0112445566', 'Horana'),
('u_s10', 'SPC Wholesale',                    'wholesale@spc.lk',          'password', 'Supplier', 'Active', '0112320500', 'Colombo 10'),
('u_s11', 'Emerchemie NB',                    'info@emerchemie.lk',        'password', 'Supplier', 'Active', '0112813131', 'Nugegoda'),
('u_s12', 'J.L. Morison Son & Jones',         'jlmsj@morison.lk',         'password', 'Supplier', 'Active', '0112431431', 'Colombo 13'),
('u_s13', 'Kevilton',                          'pharma@kevilton.lk',        'password', 'Supplier', 'Active', '0112727333', 'Peliyagoda'),
('u_s14', 'Link Natural Products',            'info@linknatural.com',      'password', 'Supplier', 'Active', '0112564223', 'Maharagama'),
('u_s15', 'Hettigoda Industries',             'info@siddhalepa.com',       'password', 'Supplier', 'Active', '0112736910', 'Ratmalana'),
('u_s16', 'Durdans Medical Supplies',         'supplies@durdans.com',      'password', 'Supplier', 'Active', '0112140000', 'Colombo 03'),
('u_s17', 'Nawaloka Medicare Supplies',       'pharma@nawaloka.com',       'password', 'Supplier', 'Active', '0112304444', 'Colombo 02'),
('u_s18', 'Asiri Health Logistics',           'supply@asiri.lk',           'password', 'Supplier', 'Active', '0114524400', 'Narahenpita'),
('u_s19', 'Mega Lifesciences Lanka',          'info@megalifesciences.lk',  'password', 'Supplier', 'Active', '0112448899', 'Colombo 04'),
('u_s20', 'B. Braun Lanka',                   'info.lk@bbraun.com',        'password', 'Supplier', 'Active', '0112595533', 'Colombo 05');

-- Pharmacies (IDs 25-29)
INSERT INTO users (legacy_id, name, email, password, role, status, phone, address) VALUES
('u_p1', 'Sethsuwa Pharmacy - Nugegoda', 'nugegoda@sethsuwa.lk', 'password', 'Pharmacy', 'Active', '0112854321', 'Nugegoda'),
('u_p2', 'Arogya Medicals - Badulla',    'badulla@arogya.lk',    'password', 'Pharmacy', 'Active', '0552223344', 'Badulla'),
('u_p3', 'Rajini Pharmacy - Kandy',      'info@rajinirx.lk',     'password', 'Pharmacy', 'Active', '0812233445', 'Kandy'),
('u_p4', 'City Care - Colombo',          'colombo@citycare.lk',  'password', 'Pharmacy', 'Active', '0112556677', 'Colombo'),
('u_p5', 'Suwasetha Pharmacy - Galle',   'galle@suwasetha.lk',   'password', 'Pharmacy', 'Active', '0912233445', 'Galle');

-- Customers (IDs 30-34)
INSERT INTO users (legacy_id, name, email, password, role, status, phone, address) VALUES
('u_c1', 'Kasun Silva',          'kasun.s@gmail.com',       'password', 'Customer', 'Active', '0771122334', 'Dehiwala'),
('u_c2', 'Nuwan Fernando',      'nuwan.f@yahoo.com',       'password', 'Customer', 'Active', '0719988776', 'Moratuwa'),
('u_c3', 'Nethmi Ratnayake',    'nethmi.r@gmail.com',      'password', 'Customer', 'Active', '0704455667', 'Maharagama'),
('u_c4', 'Dilshan Weerasinghe', 'dilshan.w@outlook.com',   'password', 'Customer', 'Active', '0782233445', 'Malabe'),
('u_c5', 'Kavindi Perera',      'kavindi.p@hotmail.com',   'password', 'Customer', 'Active', '0715566778', 'Panadura');

-- Pending Users (IDs 35-39)
INSERT INTO users (legacy_id, name, email, password, role, status, phone, address, license_document) VALUES
('p1', 'Biogenics Lanka',                       'info@biogenics.lk', 'password', 'Supplier',      'Pending', '0114556677', 'Colombo 08',    'biogenics_biz_reg.pdf'),
('p2', 'Medica Importers',                      'sales@medica.lk',   'password', 'Supplier',      'Pending', '0112334455', 'Dehiwala',       'medica_import_license.pdf'),
('p3', 'Lanka Hospitals Diagnostics (Supply)',   'supply@lhd.lk',     'password', 'Supplier',      'Pending', '0115430000', 'Colombo 05',    'lhd_dist_cert.pdf'),
('p4', 'MediCare Pharmacy - Kurunegala',         'info@medicare.lk',  'password', 'Pharmacy',      'Pending', '0372223344', 'Kurunegala',    'medicare_license.pdf'),
('p5', 'Dr. S. Wijesinghe',                     'wijesinghe.s@medagents.lk', 'password', 'Medical Agent', 'Pending', '0714455667', 'Anuradhapura', 'slmc_reg.pdf');


-- =====================================================
-- SEED DATA - Medicines
-- Uses subqueries to resolve supplier_id from legacy_id
-- =====================================================
INSERT INTO medicines (legacy_id, name, brand, stock, price, supplier_id, expire_date, description) VALUES
('m1',  'Panadol (Paracetamol 500mg)',  'GSK',              50000,  10.00,  (SELECT id FROM users WHERE legacy_id='u_s7'),  '2027-06-30', 'Effective for fast pain relief and reducing fever.'),
('m2',  'Piriton (Chlorphenamine 4mg)', 'GSK',              15000,  8.00,   (SELECT id FROM users WHERE legacy_id='u_s7'),  '2027-03-31', 'Used for treating allergies, hay fever, and insect bites.'),
('m3',  'Samahan',                      'Link Natural',     100000, 25.00,  (SELECT id FROM users WHERE legacy_id='u_s14'), '2028-01-15', 'Traditional herbal remedy for cold and cold-related symptoms.'),
('m4',  'Siddhalepa Balm (50g)',        'Hettigoda',        8000,   250.00, (SELECT id FROM users WHERE legacy_id='u_s15'), '2028-09-01', 'Ayurvedic balm for headaches, muscular aches, and colds.'),
('m5',  'Metformin 500mg',             'SPC',              30000,  10.00,  (SELECT id FROM users WHERE legacy_id='u_s10'), '2027-11-30', 'Used to treat type 2 diabetes by controlling high blood sugar.'),
('m6',  'Losartan 50mg',               'Morison',          25000,  20.00,  (SELECT id FROM users WHERE legacy_id='u_s3'),  '2027-08-31', 'Medication used to treat high blood pressure (hypertension).'),
('m7',  'Amoxicillin 500mg',           'Astron',           12000,  30.00,  (SELECT id FROM users WHERE legacy_id='u_s5'),  '2027-04-30', 'Antibiotic used for treating a wide variety of bacterial infections.'),
('m8',  'Vitamin C 100mg',             'Hemas',            40000,  15.00,  (SELECT id FROM users WHERE legacy_id='u_s1'),  '2028-05-31', 'Daily dietary supplement for boosting immunity and preventing scurvy.'),
('m9',  'Aspirin 75mg',                'Baurs',            25000,  12.00,  (SELECT id FROM users WHERE legacy_id='u_s2'),  '2027-09-30', 'Low dose aspirin to prevent blood clots and reduce heart attack risk.'),
('m10', 'Atorvastatin 20mg',           'SPC',              18000,  35.00,  (SELECT id FROM users WHERE legacy_id='u_s10'), '2027-12-31', 'Lowers "bad" cholesterol and triglycerides in the blood.'),
('m11', 'Omeprazole 20mg',             'Astron',           22000,  18.00,  (SELECT id FROM users WHERE legacy_id='u_s5'),  '2027-07-31', 'Decreases stomach acid, used for GERD and acid reflux.'),
('m12', 'Diclofenac Sodium 50mg',      'Morison',          16000,  10.00,  (SELECT id FROM users WHERE legacy_id='u_s3'),  '2027-05-31', 'Nonsteroidal anti-inflammatory drug (NSAID) for pain and arthritis.'),
('m13', 'Salbutamol Inhaler',          'GSK',              3500,   1200.00,(SELECT id FROM users WHERE legacy_id='u_s7'),  '2027-10-31', 'Relief inhaler for asthma and COPD bronchospasms.'),
('m14', 'Cetirizine 10mg',             'Hemas',            28000,  15.00,  (SELECT id FROM users WHERE legacy_id='u_s1'),  '2028-02-28', 'Non-drowsy antihistamine for allergy symptoms.'),
('m15', 'Ibuprofen 400mg',             'Sunshine',         31000,  12.00,  (SELECT id FROM users WHERE legacy_id='u_s4'),  '2027-11-30', 'NSAID used for reducing pain, inflammation, and high fever.'),
('m16', 'Azithromycin 500mg',          'Baurs',            9000,   80.00,  (SELECT id FROM users WHERE legacy_id='u_s2'),  '2027-06-30', 'Macrolide antibiotic to treat respiratory and skin infections.'),
('m17', 'Domperidone 10mg',            'Navesta',          14000,  10.00,  (SELECT id FROM users WHERE legacy_id='u_s9'),  '2028-03-31', 'Anti-emetic medicine to relieve nausea and vomiting.'),
('m18', 'Folic Acid 5mg',              'Astron',           50000,  5.00,   (SELECT id FROM users WHERE legacy_id='u_s5'),  '2028-07-31', 'Supplement for treating folic acid deficiency, especially in pregnancy.'),
('m19', 'Calcium Sandoz',              'George Steuart',   6000,   450.00, (SELECT id FROM users WHERE legacy_id='u_s8'),  '2027-08-31', 'Effervescent tablets for strong bones and calcium deficiency.'),
('m20', 'Ranitidine 150mg',            'Emerchemie',       20000,  8.00,   (SELECT id FROM users WHERE legacy_id='u_s11'), '2027-04-30', 'Antacid medication for treating stomach ulcers and acid indigestion.'),
('m21', 'Thyroxine 50mcg',             'Hemas',            11000,  12.00,  (SELECT id FROM users WHERE legacy_id='u_s1'),  '2028-01-31', 'Hormone replacement therapy for hypothyroidism.'),
('m22', 'Amikacin Injection',          'CIC',              4000,   850.00, (SELECT id FROM users WHERE legacy_id='u_s6'),  '2027-09-30', 'Injectable antibiotic for severe, hospital-acquired bacterial infections.'),
('m23', 'Dexamethasone 0.5mg',         'Astron',           17000,  8.00,   (SELECT id FROM users WHERE legacy_id='u_s5'),  '2027-12-31', 'Corticosteroid used to relieve severe inflammation and allergic reactions.'),
('m24', 'Ciprofloxacin 500mg',         'Morison',          13000,  25.00,  (SELECT id FROM users WHERE legacy_id='u_s3'),  '2027-06-30', 'Fluoroquinolone antibiotic for severe urinary tract and skin infections.'),
('m25', 'Chlorpheniramine 4mg',        'SPC',              35000,  5.00,   (SELECT id FROM users WHERE legacy_id='u_s10'), '2028-04-30', 'Classic antihistamine for managing sudden allergic episodes.'),
('m26', 'Eltroxin 50mcg',              'GSK',              9500,   20.00,  (SELECT id FROM users WHERE legacy_id='u_s7'),  '2027-10-31', 'Thyroid hormone replacement drug for underactive thyroid conditions.'),
('m27', 'Gliclazide 80mg',             'Mega Lifesciences',12500,  18.00,  (SELECT id FROM users WHERE legacy_id='u_s19'), '2027-07-31', 'Anti-diabetic medication used to control type 2 diabetes mellitus.'),
('m28', 'Clopidogrel 75mg',            'Baurs',            10500,  30.00,  (SELECT id FROM users WHERE legacy_id='u_s2'),  '2028-02-28', 'Antiplatelet medication for patients with a high risk of stroke.'),
('m29', 'Enalapril 5mg',               'Astron',           14000,  15.00,  (SELECT id FROM users WHERE legacy_id='u_s5'),  '2027-11-30', 'ACE inhibitor prescribed for hypertension and heart failure.'),
('m30', 'Mefenamic Acid 500mg',        'Sunshine',         16000,  18.00,  (SELECT id FROM users WHERE legacy_id='u_s4'),  '2027-08-31', 'NSAID commonly used to treat menstrual pain and moderate cramps.'),
('m31', 'Zinnat (Cefuroxime)',          'GSK',              4000,   180.00, (SELECT id FROM users WHERE legacy_id='u_s7'),  '2027-05-31', 'Broad-spectrum antibiotic for serious throat and respiratory infections.'),
('m32', 'Prednisolone 5mg',            'Morison',          22000,  6.00,   (SELECT id FROM users WHERE legacy_id='u_s3'),  '2028-06-30', 'Steroid medication for controlling severe inflammatory diseases.'),
('m33', 'Augmentin 625mg',             'GSK',              8000,   240.00, (SELECT id FROM users WHERE legacy_id='u_s7'),  '2027-09-30', 'Potent antibiotic combination for resistant bacterial infections.'),
('m34', 'Neurobion',                    'Baurs',            15000,  35.00,  (SELECT id FROM users WHERE legacy_id='u_s2'),  '2028-03-31', 'Vitamin B complex supplement supporting nerve health and metabolism.'),
('m35', 'Link Sudantha (Toothpaste)',   'Link Natural',     40000,  150.00, (SELECT id FROM users WHERE legacy_id='u_s14'), '2028-08-31', 'Ayurvedic herbal toothpaste for complete oral hygiene and care.'),
('m36', 'Amlodipine 5mg',              'Emerchemie',       18000,  12.00,  (SELECT id FROM users WHERE legacy_id='u_s11'), '2027-10-31', 'Calcium channel blocker to lower blood pressure and prevent chest pain.'),
('m37', 'Losartan 25mg',               'Navesta',          9000,   15.00,  (SELECT id FROM users WHERE legacy_id='u_s9'),  '2027-12-31', 'Low dose medication for mild hypertension and kidney protection.'),
('m38', 'Pantoprazole 40mg',           'CIC',              13000,  22.00,  (SELECT id FROM users WHERE legacy_id='u_s6'),  '2028-05-31', 'Proton-pump inhibitor for severe acid reflux and ulcer healing.'),
('m39', 'Saline Solution 500ml',       'B. Braun',         5000,   350.00, (SELECT id FROM users WHERE legacy_id='u_s20'), '2027-07-31', 'Sterile IV fluid for dehydration and intravenous medication delivery.'),
('m40', 'Surgical Spirit 50ml',        'George Steuart',   12000,  150.00, (SELECT id FROM users WHERE legacy_id='u_s8'),  '2028-04-30', 'Topical antiseptic application for sterilizing skin and small wounds.');


-- =====================================================
-- SEED DATA - Medicine Reviews
-- =====================================================
INSERT INTO medicine_reviews (medicine_id, reviewer, rating, comment, review_date) VALUES
((SELECT id FROM medicines WHERE legacy_id='m1'), 'Sethsuwa Pharmacy', 5, 'Always highly requested. Fast delivery from GSK.', '2026-04-15'),
((SELECT id FROM medicines WHERE legacy_id='m3'), 'Kasun Silva', 4, 'Great for cold symptoms, genuine product.', '2026-05-02'),
((SELECT id FROM medicines WHERE legacy_id='m3'), 'Rajini Pharmacy - Kandy', 5, 'Best selling herbal item this month.', '2026-05-05'),
((SELECT id FROM medicines WHERE legacy_id='m8'), 'City Care - Colombo', 4, 'Good stock availability.', '2026-04-20');


-- =====================================================
-- SEED DATA - Orders
-- =====================================================
INSERT INTO orders (legacy_id, medicine_id, pharmacy_id, quantity, status) VALUES
('o1',  (SELECT id FROM medicines WHERE legacy_id='m1'),  (SELECT id FROM users WHERE legacy_id='u_p1'), 2000, 'Delivered'),
('o2',  (SELECT id FROM medicines WHERE legacy_id='m3'),  (SELECT id FROM users WHERE legacy_id='u_p2'), 5000, 'Approved'),
('o3',  (SELECT id FROM medicines WHERE legacy_id='m5'),  (SELECT id FROM users WHERE legacy_id='u_p3'), 1500, 'Pending'),
('o4',  (SELECT id FROM medicines WHERE legacy_id='m8'),  (SELECT id FROM users WHERE legacy_id='u_p4'), 3000, 'Delivered'),
('o5',  (SELECT id FROM medicines WHERE legacy_id='m12'), (SELECT id FROM users WHERE legacy_id='u_p1'), 1000, 'Approved'),
('o6',  (SELECT id FROM medicines WHERE legacy_id='m33'), (SELECT id FROM users WHERE legacy_id='u_p5'), 500,  'Pending'),
('o7',  (SELECT id FROM medicines WHERE legacy_id='m18'), (SELECT id FROM users WHERE legacy_id='u_p2'), 4000, 'Delivered'),
('o8',  (SELECT id FROM medicines WHERE legacy_id='m21'), (SELECT id FROM users WHERE legacy_id='u_p3'), 1200, 'Approved'),
('o9',  (SELECT id FROM medicines WHERE legacy_id='m24'), (SELECT id FROM users WHERE legacy_id='u_p4'), 800,  'Pending'),
('o10', (SELECT id FROM medicines WHERE legacy_id='m26'), (SELECT id FROM users WHERE legacy_id='u_p1'), 900,  'Delivered'),
('o11', (SELECT id FROM medicines WHERE legacy_id='m39'), (SELECT id FROM users WHERE legacy_id='u_p5'), 1800, 'Approved'),
('o12', (SELECT id FROM medicines WHERE legacy_id='m10'), (SELECT id FROM users WHERE legacy_id='u_p2'), 1400, 'Pending'),
('o13', (SELECT id FROM medicines WHERE legacy_id='m13'), (SELECT id FROM users WHERE legacy_id='u_p3'), 250,  'Delivered'),
('o14', (SELECT id FROM medicines WHERE legacy_id='m29'), (SELECT id FROM users WHERE legacy_id='u_p4'), 1100, 'Approved'),
('o15', (SELECT id FROM medicines WHERE legacy_id='m30'), (SELECT id FROM users WHERE legacy_id='u_p1'), 2200, 'Pending'),
('o16', (SELECT id FROM medicines WHERE legacy_id='m35'), (SELECT id FROM users WHERE legacy_id='u_p5'), 3000, 'Approved'),
('o17', (SELECT id FROM medicines WHERE legacy_id='m4'),  (SELECT id FROM users WHERE legacy_id='u_p2'), 1500, 'Pending'),
('o18', (SELECT id FROM medicines WHERE legacy_id='m19'), (SELECT id FROM users WHERE legacy_id='u_p3'), 400,  'Delivered'),
('o19', (SELECT id FROM medicines WHERE legacy_id='m31'), (SELECT id FROM users WHERE legacy_id='u_p4'), 600,  'Pending'),
('o20', (SELECT id FROM medicines WHERE legacy_id='m40'), (SELECT id FROM users WHERE legacy_id='u_p1'), 1200, 'Approved');


-- =====================================================
-- SEED DATA - Special Medicines
-- =====================================================
INSERT INTO special_medicines (legacy_id, name, used_for, agent_name, agent_phone) VALUES
('sm1', 'Paclitaxel 100mg',       'Breast & Ovarian Cancer Treatment',              'Medical Agent Kamal', '071 223 3445'),
('sm2', 'Doxorubicin 50mg',       'Leukemia & Lymphoma Treatment',                  'Dr. S. Wijesinghe',   '071 445 5667'),
('sm3', 'Trastuzumab 440mg',      'HER2-Positive Breast Cancer',                    'Medical Agent Kamal', '071 223 3445'),
('sm4', 'Cyclophosphamide 500mg', 'Multiple Myeloma & Autoimmune Disorders',         'Dr. R. Perera',       '077 889 9001'),
('sm5', 'Imatinib 400mg',         'Chronic Myeloid Leukemia (CML)',                  'Dr. S. Wijesinghe',   '071 445 5667');
