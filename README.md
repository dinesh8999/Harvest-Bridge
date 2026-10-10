# 🌱 Harvest Bridge — AI Agricultural Surplus & Loss Mitigation Platform

> **Predict · Redirect · Protect**  
> *Transforming agricultural surplus risk into immediate economic security for smallholder farmers and communities.*

---

## 📌 Executive Summary

Every harvest season, millions of tons of fresh horticultural produce rot in fields due to sudden market gluts, localized price crashes, and lack of timely access to buyers. **Harvest Bridge** is a full-stack, AI-powered agricultural surplus management and redistribution platform built to prevent post-harvest loss before it occurs.

By combining **AI Surplus Risk Forecasting**, **Multi-Factor Buyer Matching**, **Transparent Net Earnings Comparison**, **End-to-End Order & Farm-Gate Logistics Lifecycle Tracking**, **Mandi Price Intelligence**, and **Bilingual Voice Guidance (English & Telugu)**, Harvest Bridge empowers farmers, food processors, institutions, community kitchens, and NGOs to eliminate avoidable agricultural waste and protect rural livelihoods.

---

## 👥 1. User Roles & Distinct Portals

Harvest Bridge enforces server-side role-based authorization across four distinct personas:

1. **Farmers / FPOs (Farmer Producer Organizations)**:
   - Register, manage, pause, and close crop listings with quality grades, expected harvest dates, and reserve prices.
   - Receive AI-driven surplus risk assessments with explainable contributing factors.
   - Discover and rank nearby buyers with transparent estimated net returns.
   - Accept, counter, or reject buyer offers with automatic inventory locking to prevent overselling.
   - Track scheduled farm-gate collections, in-transit deliveries, and verified earnings.

2. **Commercial Buyers & Food Processors**:
   - Register buyer profiles specifying crop requirements, absorption capacity, quality standards, and pickup ability.
   - Browse active crop listings with unreserved inventory.
   - Submit formal purchase offers with logistics terms.
   - Confirm delivery destination weight and inspect produce batches.

3. **Verified Organizations (Surplus Rescue Network)**:
   - Non-profits, community kitchens, hostel kitchens, and institutional food relief partners.
   - Match with imminent surplus batches during the 3–5 day Rescue Window.
   - Record verified delivered produce vs spoilage, generating verified social and ecological impact records.

4. **Agricultural Operations Administrators**:
   - Review and accredit institutional organizations.
   - Audit trail tracking immutable security events, transaction milestones, and AI surplus spikes.
   - Monitor platform-wide aggregate impact metrics (Produce Redirected, Avoided Waste, CO₂e Saved, Water Footprint Saved).

---

## 🧠 2. Core Technical Architecture & Intelligence Engines

### A. Modular AI Surplus Risk Forecasting Model (`backend/services/surplusAiService.js`)
Evaluates:
- **Biological Perishability Index**: Species-specific decay rates (e.g., Tomato $0.88$, Leafy Greens $0.96$, Potato $0.22$) adjusted by ambient vs cold storage.
- **Seasonal Influx & Mandi Arrival Velocity**: Benchmark arrival data across Andhra Pradesh and South Indian APMC mandis.
- **Price Divergence & Market Pressure**: Deviations between farmer target reserves and regional modal benchmarks.
- **Quantity Concentration & Days-to-Harvest Proximity**: Temporal urgency modeling.
- **Explainable Factors**: Transparent breakdown of why risk is elevated.
- **Data Sufficiency Handling**: Returns explicit `INSUFFICIENT_DATA` response when essential parameters are missing without fabricating false certainty.

### B. Multi-Factor AI Buyer Matching & Ranking (`backend/services/matchingService.js`)
Ranks buyers based on:
- **Crop Compatibility (25%)**: Exact variety match.
- **Quantity Fit (20%)**: Buyer capacity vs available unreserved stock.
- **Logistics Proximity (25%)**: Haversine distance decay modeling.
- **Timing Alignment (15%)**: Harvest date vs buyer demand window.
- **Price Feasibility (15%)**: Farmer reserve price vs buyer budget.
- **Verification Bonus (+5%)**: Accredited organizations receive priority ranking.

### C. Transparent Net Earnings Calculator (`backend/services/earningsCalculator.js`)
$$\text{Estimated Net Earnings} = (\text{Quantity} \times \text{Agreed Price}) - \text{Transport Costs} - \text{Handling Costs} - \text{Platform Fees}$$
- Differentiates buyer pickup (₹0 farmer freight) vs farmer tempo delivery.
- Guarantees 0% platform commission on direct agricultural transactions.
- Allows farmers to compare multiple offers side-by-side to choose the highest net return per kg.

### D. Inventory Reservation & Overselling Protection (`backend/services/orderService.js`)
- Atomic inventory reservation upon offer acceptance.
- Real-time availability tracking (`totalQuantity`, `availableQuantity`, `reservedQuantity`, `soldQuantity`, `wastedQuantity`).
- Order cancellation automatically releases reserved inventory back to available stock.
- Multi-step state machine: `pending` $\rightarrow$ `scheduled_pickup` $\rightarrow$ `in_transit` $\rightarrow$ `completed` / `cancelled`.

### E. Mandi Price Intelligence (`backend/services/marketIntelligenceService.js`)
- Sourced modal price benchmarks and daily arrival volumes for APMC mandis (Madanapalle, Chittoor, Tirupati, Kurnool).
- 7-day historical price and arrival charts.
- Honest data source attribution (Department of Agricultural Marketing AP & Agmarknet).

### F. Bilingual & Voice Accessibility (`backend/services/assistantService.js` & Web Speech API)
- Full translation dictionary for English and Telugu.
- Web Speech API speech-to-text input and speech synthesis audio readouts.
- Factual knowledge base citing ICAR, e-NAM, and Operation Greens guidelines.

---

## 🛡️ 3. Security & Quality Assurance

| Security Layer | Implementation Details |
| :--- | :--- |
| **Authentication** | PBKDF2 with 10,000 iterations & cryptographic salt; RFC-7519 HMAC-SHA256 JWT tokens. |
| **Authorization** | Server-side role-based access control middleware (`requireAuth`, `requireRole`). |
| **HTTP Security** | `Helmet` HTTP security headers, CORS origin filtering. |
| **Rate Limiting** | `express-rate-limit` DDoS and brute-force protection on all `/api/` endpoints. |
| **Data Persistence** | ACID-compliant persistent JSON storage engine with atomic writes and mutex protection. |

---

## 📊 4. Automated Test Results

The backend includes a comprehensive automated test suite (`backend/test-suite.js`) executing 14 test suites covering all layers:

```
═══════════════════════════════════════════════════════════════
🌱 HARVEST BRIDGE — COMPREHENSIVE AUTOMATED TEST SUITE
═══════════════════════════════════════════════════════════════

--- 1. Cryptography & Authentication Suite ---
  ✅ PASS: PBKDF2 password hashing & verification
  ✅ PASS: RFC-7519 HMAC-SHA256 JWT generation and validation
  ✅ PASS: User registration and duplicate phone protection
  ✅ PASS: User login with valid & invalid credentials

--- 2. AI Surplus Risk Engine Suite ---
  ✅ PASS: High-perishability crop (Tomato) triggers elevated surplus risk with explainability
  ✅ PASS: Low-perishability crop (Potato) returns lower surplus risk
  ✅ PASS: Honest handling of insufficient or invalid input data

--- 3. Buyer Matching & Multi-Factor Ranking Suite ---
  ✅ PASS: Multi-factor ranking filters by crop compatibility and ranks by proximity/capacity

--- 4. Net Earnings & Offer Comparison Engine Suite ---
  ✅ PASS: Accurate net earnings deduction formula
  ✅ PASS: Offer comparison ranks by highest effective net return

--- 5. Order Lifecycle & Overselling Protection Suite ---
  ✅ PASS: Offer submission, acceptance, atomic inventory reservation, and overselling protection
  ✅ PASS: Order cancellation automatically releases reserved inventory

--- 6. Mandi Intelligence & AI Assistant Suite ---
  ✅ PASS: Market price intelligence returns verified APMC benchmarks
  ✅ PASS: Grounded bilingual AI assistant answers accurately

═══════════════════════════════════════════════════════════════
📊 TEST SUITE SUMMARY: 14/14 PASSED (100%)
═══════════════════════════════════════════════════════════════
```

---

## 🚀 5. Local Setup & Running Instructions

### Prerequisites
- Node.js v18+ or v22+
- npm v9+

### Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run Automated Test Suite**:
   ```bash
   npm test
   ```

3. **Start Development Servers**:
   ```bash
   # In terminal 1 (Backend API Server on port 3001)
   npm run server

   # In terminal 2 (Frontend Vite Server on port 5173)
   npm run dev
   ```

4. **Open in Browser**:
   Navigate to [http://localhost:5173](http://localhost:5173).

---

## 🧪 6. Demo Accounts (Quick Persona Switcher)

Harvest Bridge includes pre-seeded demo accounts with password `Harvest@123`:

| Role | Name | Phone Number | Location |
| :--- | :--- | :--- | :--- |
| **Farmer** | Ravi Kumar | `9876543001` | Palamaner, Chittoor |
| **Farmer** | Anitha Devi | `9876543002` | Kuppam, Chittoor |
| **Buyer (Processor)** | Chittoor Tomato Processing Co. | `9876543210` | Chittoor Industrial Area |
| **Organization (NGO)** | Sri Venkateswara Community Kitchen | `9876543300` | Tirupati |
| **Administrator** | Operations Admin | `9876543999` | Vijayawada APMC HQ |

---

## 🌐 7. Production Deployment (Render / Docker)

The application includes a production-ready `Dockerfile` and Render configuration:

```bash
# Build Docker image
docker build -t harvest-bridge .

# Run Docker container
docker run -p 3001:3001 harvest-bridge
```

---

*Built with ❤️ for national agricultural innovation, loss prevention, and rural prosperity.*
