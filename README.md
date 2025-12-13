# ChainFL-Care 🏥⛓️

**Privacy-Preserving Federated Learning for Healthcare**

A blockchain-powered federated learning platform that enables hospitals to collaboratively train AI models for cardiac risk prediction without sharing sensitive patient data.

---

## 🎯 Problem Statement

Healthcare institutions cannot share patient data due to HIPAA/GDPR regulations, limiting AI model training to small local datasets that don't generalize well across diverse patient populations.

## 💡 Our Solution

**ChainFL-Care** implements a federated learning framework that:
- ✅ Trains medical diagnosis models across multiple hospitals
- ✅ Shares only encrypted model updates, never raw patient records
- ✅ Uses blockchain for immutable consent management and audit trails
- ✅ Implements differential privacy to prevent data reverse-engineering
- ✅ Handles non-IID data across different hospital demographics

---

## 🚀 Key Features

### 1. **AI-Powered Risk Prediction**
- Multi-disease risk assessment (Cardiac, Liver, Kidney, Hypertension)
- SHAP-based explainable AI showing risk factors
- Requires only 4 basic parameters (Age, BP, Cholesterol, Glucose)
- Real-time predictions with confidence scores

### 2. **Federated Learning Training**
- Collaborative model training across verified hospitals
- No raw data sharing - only model parameters
- Real-time training metrics and performance graphs
- Automated multi-round training with convergence detection

### 3. **Blockchain Consent Management**
- Immutable patient consent records on Ethereum
- Granular access control (view/edit/share permissions)
- Complete audit trail of all data access
- Smart contract-based verification

### 4. **Hospital Node Registry**
- Decentralized hospital verification system
- Blockchain-based node registration
- Transparent verification status
- Multi-hospital collaboration framework

### 5. **Professional Dashboard**
- Real-time patient monitoring
- Risk forecasting and trends
- Activity logging and audit trails
- Comprehensive analytics

---

## 🛠️ Tech Stack

### **Frontend**
- React.js with modern hooks
- Recharts for data visualization
- Lucide React icons
- Responsive design

### **Backend**
- FastAPI (Python)
- Scikit-learn for ML models
- Web3.py for blockchain integration
- Pydantic for data validation

### **Blockchain**
- Ethereum (Ganache for local development)
- Solidity smart contracts
- Web3.js integration

### **ML/AI**
- RandomForest classifier
- SHAP for explainability
- Synthetic medical data generation
- Multi-disease risk modeling

---

## 📦 Installation & Setup

### Prerequisites
- Node.js 16+
- Python 3.9+
- Ganache (for local blockchain)

### 1. Clone Repository
```bash
git clone https://github.com/Suprithh7/ChainFL.git
cd ChainFL
```

### 2. Backend Setup
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 4. Blockchain Setup
```bash
# Start Ganache on port 8545
ganache --port 8545 --chain.networkId 1337 --chain.chainId 1337
```

### 5. Access Application
- Frontend: http://localhost:5173
- Backend API: http://127.0.0.1:8000
- API Docs: http://127.0.0.1:8000/docs

---

## 🎮 Usage

### Risk Prediction
1. Navigate to "Risk Prediction" page
2. Enter patient details (minimum 4 required fields)
3. Click "Predict Risk"
4. View multi-disease risk assessment with explanations

### Federated Learning
1. Go to "FL Training" page
2. Select participating hospitals
3. Set max training rounds (default: 3)
4. Click "Start Auto-Training"
5. Monitor real-time training progress

### Consent Management
1. Access "Blockchain Consent" page
2. Grant/revoke patient data access permissions
3. View blockchain transaction confirmations
4. Track consent audit trail

---

## 🏗️ Architecture

```
┌─────────────────┐
│   React Frontend │
└────────┬────────┘
         │
    ┌────▼─────┐
    │  FastAPI  │
    │  Backend  │
    └─┬──────┬─┘
      │      │
┌─────▼──┐ ┌─▼──────────┐
│ ML Model│ │ Blockchain │
│ (Local) │ │  (Ganache) │
└─────────┘ └────────────┘
```

---

## 🔒 Privacy & Security

- **No Raw Data Sharing:** Only model parameters are exchanged
- **Blockchain Audit Trail:** Immutable record of all data access
- **Patient Consent:** Granular control over data permissions
- **Differential Privacy:** Noise addition to prevent reverse-engineering
- **HIPAA/GDPR Compliant:** Designed for healthcare regulations

---

## 📊 ML Model Details

- **Algorithm:** RandomForest Classifier
- **Features:** 10 clinical parameters + engineered features
- **Accuracy:** ~85-95% (improves with FL training)
- **Explainability:** SHAP values for interpretability
- **Diseases:** Cardiac, Liver, Kidney, Hypertension

---

## 🤝 Contributing

This project was developed for **Smart India Hackathon 2024**.

For contributions:
1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open pull request

---

## 📝 License

MIT License - See LICENSE file for details

---

## 👥 Team

Developed for Smart India Hackathon 2024

---

## 🙏 Acknowledgments

- Smart India Hackathon organizers
- Healthcare domain experts
- Open-source community

---

## 📧 Contact

For questions or collaboration:
- GitHub: [@Suprithh7](https://github.com/Suprithh7)
- Project: [ChainFL-Care](https://github.com/Suprithh7/ChainFL)

---

**Built with ❤️ for healthcare privacy and AI collaboration**
