# Medical Machine App V2 - Frontend

A modern React-based frontend for the Medical Machine Management System with all the improvements and features from the notes.

## Features

### Core Features
- User Authentication with JWT
- Role-based Access Control (Super Admin, Admin, Technician, Reception)
- Responsive Design for all devices
- Real-time Dashboard with Analytics
- Export to Excel functionality

### Pages & Modules

#### 1. **Dashboard**
- Key metrics and statistics
- Machine status overview
- Financial summaries
- Charts and visualizations

#### 2. **Machine Management**
- Add/Edit/Delete machines
- Manage machine locations (dropdown)
- Track machine prices
- Serial number management
- Excel export

#### 3. **Panne Management (Breakdown)**
- Report breakdowns with timestamps
- Assign technicians
- Track repair costs
- Search by serial number or breakdown ID
- Filter by date period
- Track "discovered by" and "reported by"
- Mark breakdowns as resolved (auto date field)
- Manage parts modifications
- Excel export

#### 4. **Maintenance Management**
- Schedule preventive and corrective maintenance
- Assign technicians
- Track maintenance costs (in MAD)
- Maintenance calendar/agenda
- Cost tracking with currency set to MAD

#### 5. **Machine Usage**
- Record machine usage by date
- Track number of patients
- Calculate total revenue (amount)
- Filter by machine and date period
- Real-time total amount calculation
- Excel export

#### 6. **User Management**
- Create and manage users
- Roles: Admin, Technician, Reception (removed superadmin from user-facing roles)
- Email and password management
- Excel export

#### 7. **Reports**
- Machine reports with filters
- Breakdowns/Pannes reports
- Maintenance reports
- Usage reports
- Date range filtering
- Excel export

## Permission System

### Technician Access
- Breakdown (Panne) page
- Maintenance page

### Reception Access
- Machine Management
- Machine Usage
- Reports
- Dashboard

### Admin/SuperAdmin Access
- All pages
- User Management

## Technology Stack

- **React 18** - UI Framework
- **Redux Toolkit** - State Management
- **React Router** - Navigation
- **Bootstrap 5** - UI Components
- **Axios** - HTTP Client
- **React Icons** - Icons
- **Recharts** - Charts & Visualization
- **React Toastify** - Notifications
- **React Table** - Data Tables
- **React Hook Form** - Form Management

## Installation

```bash
npm install
```

## Development

```bash
npm start
```

The app will run on `http://localhost:3000`

## Build

```bash
npm run build
```

## Environment Setup

Make sure the backend API is running on `http://localhost:5000`

## Features Implemented from Notes

✅ Machine page: Added price field and location dropdown
✅ Panne page: 
  - Personalized breakdown ID
  - Serial number in table
  - Time clock to date field
  - Repair cost column
  - Search by serial number and breakdown ID
  - "Reported by" column
  - "Resolution date" (auto-filled on resolve)
  - "Who discovered the issue" field
  - Parts modification field
  - Technician field
  
✅ Maintenance page:
  - Technician list/table
  - Maintenance types (Preventive/Corrective)
  - Maintenance schedule/calendar
  - Currency set to MAD
  
✅ User page:
  - Removed superadmin role from users
  - Changed to Reception role
  
✅ Usage page:
  - Machine selection
  - Date field
  - Usage type/quantity
  - Changed "quantity" to "number of patients"
  - Changed "revenue" to "amount"
  - Filters by date and machine
  - Total amount calculation
  
✅ Permissions:
  - Technicians: Panne and Maintenance pages only
  - Reception: Machines, Usage, Reports, Dashboard
  
✅ General:
  - Filters on all pages with tables
  - Excel export functionality
  - Responsive mobile design

## API Integration

All API calls are made through the `apiService.js` file which handles:
- Authentication
- Token refresh
- Error handling
- Request/Response interceptors

## Currency

The application uses **MAD (Moroccan Dirham)** as the default currency.

---

Created with ❤️ for Medical Machine Management
