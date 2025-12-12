# Blockchain Setup Guide

## Quick Start (Without Blockchain)

The application works WITHOUT blockchain! The blockchain features are optional.

If you see "Processing..." or "Registering..." hanging:
- **Ganache is not running** (this is okay!)
- The app will timeout after 10 seconds with instructions
- All other features (Dashboard, Predictions, Patient Records) work normally

---

## To Enable Blockchain Features

### Step 1: Install Ganache

**Option A - NPM (Recommended):**
```bash
npm install -g ganache
```

**Option B - Download:**
- Visit: https://trufflesuite.com/ganache/
- Download and install Ganache GUI

### Step 2: Start Ganache

```bash
ganache --port 8545
```

You should see:
```
ganache v7.x.x
Available Accounts
==================
(0) 0x... (1000 ETH)
(1) 0x... (1000 ETH)
...

Listening on 127.0.0.1:8545
```

### Step 3: Deploy Smart Contracts

```bash
cd backend
python blockchain/deploy.py
```

You'll see:
```
✅ PatientConsent deployed at: 0x...
✅ NodeRegistry deployed at: 0x...
```

### Step 4: Update Environment Variables

Copy the contract addresses from the deployment output:

```bash
# backend/.env
WEB3_RPC_URL=http://127.0.0.1:8545
CONSENT_CONTRACT_ADDRESS=0x... (from deploy output)
NODE_REGISTRY_ADDRESS=0x... (from deploy output)
```

### Step 5: Restart Backend

```bash
# Stop the current backend (Ctrl+C)
cd backend
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

---

## Testing Blockchain Features

### 1. Test Consent Management

1. Go to http://localhost:5173/consent
2. Enter:
   - Patient ID: `P001`
   - Hospital ID: `H001`
3. Click "Grant Consent"
4. You should see: ✅ Consent granted successfully!

### 2. Test Node Registry

1. Go to http://localhost:5173/nodes
2. Enter:
   - Node ID: `H001`
   - Hospital Name: `City Hospital`
   - Click "Generate" for public key
3. Click "Register Node"
4. You should see: ✅ Node registered successfully!

---

## Troubleshooting

### "Processing..." Never Completes
- **Cause:** Ganache not running
- **Fix:** Start Ganache (see Step 2)

### "Blockchain not connected"
- **Cause:** Wrong RPC URL or Ganache not running
- **Fix:** Check Ganache is on port 8545

### "Contract not initialized"
- **Cause:** Contracts not deployed
- **Fix:** Run `python blockchain/deploy.py`

### Import Error: "No module named 'solcx'"
- **Cause:** Missing dependencies
- **Fix:** `pip install -r requirements.txt`

---

## Docker Setup (All-in-One)

If you prefer Docker:

```bash
docker-compose up
```

This will:
- Start Ganache automatically
- Deploy contracts
- Start backend and frontend

---

## Without Blockchain

**The app works perfectly without blockchain!**

Features that work:
- ✅ Dashboard
- ✅ Risk Predictions
- ✅ Patient Records
- ✅ CSV Upload
- ✅ 20-day Forecasts

Features that require blockchain:
- ⚠️ Consent Management
- ⚠️ Node Registry

You can add blockchain later without breaking existing features!
