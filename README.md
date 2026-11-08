# NexusHealth - Hospital Management System (HMS)

NexusHealth is an enterprise-grade Hospital Management System designed for seamless clinical workflows, secure role-based access control, and resilient DevOps deployment. The system connects Doctors, Nurses, Receptionists, Patients, and Administrators into a unified digital healthcare platform.

---

##  Table of Contents
1. [Core Features & Role Workflows](#-core-features--role-workflows)
2. [Authentication & Multi-Account Architecture](#-authentication--multi-account-architecture)
3. [Environment Configuration (`.env`)](#-environment-configuration-env)
4. [API Reference (Table Format)](#-api-reference)
   - [GET Endpoints](#1-get-endpoints-data-retrieval)
   - [POST Endpoints](#2-post-endpoints-creation--authentication)
   - [PUT Endpoints](#3-put-endpoints-updates--status-changes)
   - [DELETE & Lifecycle Endpoints](#4-delete--lifecycle-endpoints)
5. [Tech Stack](#-tech-stack)
6. [DevOps & Deployment](#-devops--deployment)

---

##  Core Features & Role Workflows

| Role | Key Capabilities & Features |
| :--- | :--- |
| **Doctor** | • View dynamic patient queue & token allocations.<br>• Access complete medical histories, allergies, and vitals.<br>• Issue electronic prescriptions with multi-drug dosages and durations.<br>• Initiate hospital admission orders to specific wards. |
| **Nurse** | • Ward monitoring and bed tracking across hospital departments.<br>• Medication administration and dispensing audit tracking.<br>• Shift management (Morning, Evening, Night) and ward assignments. |
| **Receptionist** | • Single designated system receptionist account.<br>• Patient intake registration and demographic recording.<br>• Appointment booking, fee collection, and token generation.<br>• Ward bed allocation and patient discharge processing. |
| **Patient** | • Self-service account registration.<br>• Doctor directory discovery and in-person consultation booking.<br>• Live queue token status tracking.<br>• Access to personal prescriptions, diagnosis history, and follow-up advice. |
| **Admin** | • System oversight, staff audits, and analytics.<br>• Full oversight of patient records, staff accounts, and configurations. |

---

##  Authentication & Multi-Account Architecture

### 1. Zero Credential Exposure
- **No Credentials Displayed in UI**: All sensitive information (emails, passwords, authorized credentials) is stripped from the frontend interface and documentation pages.
- **Git Protection**: Private credentials reside purely in `.env`, which is strictly ignored by `.gitignore` to prevent any secrets from being pushed to GitHub.

### 2. 5 Default Seeded Doctors (`.env`)
- The system seeds 5 default specialist doctors on database startup.


### 3. Single Designated Receptionist (`.env`)
- Unofficial or duplicate receptionist registrations are rejected by the backend.

### 4. Multi-Role Shared Email Architecture
- **Flexible Registration**: New Doctors, Nurses, and Patients can register using any valid email address (personal or shared).
- **Shared Email Support**: Multiple accounts (e.g. a Doctor and a Nurse, two Doctors, or a Patient and a Nurse) can register using the **exact same email**.
- **Different Password Enforcement**: When multiple accounts share an email, each account **must have a different password**. Attempting to register the same email with an existing password will be rejected.
- **Login Disambiguation**: Upon entering an email and password at login, the backend automatically compares the bcrypt password hash to identify the exact user and authenticates them into their respective role dashboard (`/doctor`, `/nurse`, or `/patient`).

---



---

##  API Reference

All backend endpoints are prefixed with `/api`. Protected routes enforce session cookie verification and role-based permissions.

### 1. GET Endpoints (Data Retrieval)

| Method | Endpoint | Allowed Roles | Query / URL Params | Description | Success Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`GET`** | `/health` | Public | None | Server and database health check status. | `200 OK` |
| **`GET`** | `/api/doctors` | Public / All | None | Retrieves list of all active doctors with specialties, room numbers, and fees. | `200 OK` |
| **`GET`** | `/api/auth/me` | Authenticated | None | Retrieves profile and session details of currently logged-in user. | `200 OK` |
| **`GET`** | `/api/patients` | All Roles | None | Retrieves all patient records (populated with assigned doctor details). | `200 OK` |
| **`GET`** | `/api/appointments` | All Roles | None | Retrieves all scheduled appointments sorted chronologically by token number. | `200 OK` |
| **`GET`** | `/api/prescriptions` | All Roles | None | Retrieves all issued prescriptions including diagnosis, symptoms, and medications. | `200 OK` |
| **`GET`** | `/api/admissions` | All Roles | None | Retrieves all hospital admission orders and current bed allocation status. | `200 OK` |

---

### 2. POST Endpoints (Creation & Authentication)

| Method | Endpoint | Allowed Roles | Request Body Fields | Description | Success Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`POST`** | `/api/auth/register` | Public (Staff & Patient) | `name`, `email`, `phone`, `password`, `confirmPassword`, `role`, `doctorDetails` *(optional)*, `nurseDetails` *(optional)*, `receptionistDetails` *(optional)* | Registers a new account. Doctors, Nurses, and Patients may share an email as long as passwords differ. | `201 Created` |
| **`POST`** | `/api/auth/login` | Public | `email` (or `identifier`), `password`, `role` *(optional)* | Authenticates user credentials, sets secure HTTP-only session cookie, and returns user profile. | `200 OK` |
| **`POST`** | `/api/auth/logout` | Authenticated | None | Invalidates the active server session and clears session cookies. | `200 OK` |
| **`POST`** | `/api/patients` | Admin, Receptionist | `name`, `contact`, `age`, `gender`, `nic`, `bloodGroup`, `allergies`, `diagnosis`, `wardNumber`, `status` | Registers a new hospital patient record. | `201 Created` |
| **`POST`** | `/api/appointments` | Admin, Receptionist, Patient | `patientName`, `patientId`, `doctorName`, `department`, `dateTime`, `tokenNumber`, `fee`, `type` | Books an appointment and atomically allocates a sequential consultation token. | `201 Created` |
| **`POST`** | `/api/prescriptions` | Admin, Doctor | `patientName`, `patientId`, `doctorName`, `diagnosis`, `symptoms`, `medications` (array of `{name, dosage, frequency, duration}`), `followUpAdvice` | Creates a digital prescription and synchronizes patient clinical diagnosis. | `201 Created` |
| **`POST`** | `/api/admissions` | Admin, Doctor | `patientName`, `patientId`, `doctorName`, `ward`, `bedNo`, `diagnosis`, `orderNotes` | Generates a hospital admission request to transfer patient to in-patient care. | `201 Created` |

---

### 3. PUT Endpoints (Updates & Status Changes)

| Method | Endpoint | Allowed Roles | Request Body Fields | Description | Success Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`PUT`** | `/api/patients/:id` | Admin, Doctor, Nurse, Receptionist | `status`, `diagnosis`, `wardNumber`, `assignedDoctor`, `admittedAt` | Updates patient medical information, assigned doctor, ward location, or admission status. | `200 OK` |
| **`PUT`** | `/api/appointments/:id` | Admin, Doctor, Receptionist | `status`, `doctorName` | Updates consultation status (e.g. `Waiting`, `Serving`, `Completed`, `Cancelled`). | `200 OK` |
| **`PUT`** | `/api/prescriptions/:id` | Admin, Doctor, Nurse | `status` | Updates overall prescription status (e.g. `Pending Dispensing`, `Dispensed`). | `200 OK` |
| **`PUT`** | `/api/prescriptions/:id/medications/:medicationId` | Admin, Nurse | `administered` *(boolean)*, `administeredBy`, `administeredAt` | Audits and updates administration status of individual medication line items. | `200 OK` |
| **`PUT`** | `/api/admissions/:id` | Admin, Doctor, Receptionist, Nurse | `status`, `bedNo`, `ward` | Allocates ward beds, updates admission status, and synchronizes patient admission records. | `200 OK` |

---

### 4. DELETE & Lifecycle Endpoints

| Method | Endpoint | Allowed Roles | Description | Implementation Details |
| :--- | :--- | :--- | :--- | :--- |
| **`POST` / `PUT`** | `/api/auth/logout` | Authenticated | Deletes active session instance from database and clears cookie. | Revokes session token on server and removes client credentials. |
| **`PUT`** | `/api/appointments/:id` *(status: 'Cancelled')* | Admin, Receptionist, Doctor | Soft-cancels an appointment token and frees consultation slots. | Preserves appointment audit history while releasing token position. |
| **`PUT`** | `/api/patients/:id` *(status: 'Discharged')* | Admin, Receptionist | Releases assigned ward bed and finalizes inpatient stay. | Clears patient `wardNumber` and transitions patient status to `Discharged`. |

---

##  Tech Stack

- **Client**: React 18, Vite, React Router 6, Axios, Lucide Icons, Vanilla CSS Design System.
- **Server**: Node.js, Express 5, Mongoose ODM, bcryptjs, CORS, Dotenv.
- **Database**: MongoDB (Local instance or MongoDB Atlas).
- **Containerization**: Docker, Docker Compose.
- **Orchestration & DevOps**: Kubernetes (`k8s/`), Ansible (`ansible/`).

---

##  DevOps & Deployment

### 1. Run Locally with Node.js
```bash
# Start Backend
cd server
npm install
npm start

# Start Frontend (in separate terminal)
cd client
npm install
npm run dev
```

### 2. Run with Docker Compose
```bash
docker-compose up --build -d
```

### 3. Deploy to Kubernetes
```bash
kubectl apply -k k8s/
# Verify deployment
kubectl get pods
kubectl get services
```

### 4. Deploy via Ansible
```bash
ansible-playbook -i ansible/inventory.ini ansible/deploy-k8s.yml
```
