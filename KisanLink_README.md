# KisanLink
**Connect • Trade • Grow**  
**Strengthening Market Linkages & Price Discovery for Farmers**

## Overview
KisanLink is a farmer–buyer direct dealing platform for SIH 2026 problem statement **SIH26132**. It connects farmers and buyers, supports crop discovery and requests, and provides price discovery and rule-based farmer–buyer matching.

## Technology
- Frontend: HTML, CSS, JavaScript
- Backend: Python + FastAPI + Uvicorn
- Database: SQLite
- Frontend server: Python HTTP server

## Implemented Features
- Farmer and buyer registration/login
- Crop listing
- Buyer crop search and filters
- Price discovery and price trends
- Smart farmer–buyer matching with match score
- Verified buyer functionality
- Buyer requests
- Accept/reject workflow
- Deal creation and completion
- Transaction history
- Notifications
- Farmer contact

## Smart Matching
The implemented matching system is rule-based. It considers crop, location, price suitability, available quantity and verification, then ranks suitable available listings.

## Local Run
Backend:
```powershell
cd E:\SIH26132_PYTHON\backend
python -m uvicorn app:app --host 127.0.0.1 --port 8081
```

Frontend:
```powershell
cd E:\SIH26132_PYTHON\frontend
python -m http.server 5501
```

Open `http://127.0.0.1:5501/index.html`.

Launchers:
- Windows: `START_KISANLINK.bat`
- macOS: `START_KISANLINK.command`
- Linux/macOS shell: `start_kisanlink.sh`

## Demonstration Flow
1. Farmer login.
2. List a crop with quantity, unit, price and location.
3. Buyer login.
4. Search/filter the crop in Market.
5. Check Price Discovery and trend.
6. Open Smart Matching and enter buyer requirement.
7. Show ranked farmer matches and match score.
8. Send a buyer request.
9. Farmer reviews buyer name/mobile and request.
10. Accept or reject.
11. Create and complete the deal.
12. Verify the completed transaction in History.

## Project Structure
```text
E:\SIH26132_PYTHON
├── backend
│   ├── app.py
│   ├── database.py
│   ├── requirements.txt
│   └── routes
├── database
│   └── sih26132_python.db
├── frontend
├── START_KISANLINK.bat
├── START_KISANLINK.command
└── start_kisanlink.sh
```

## Important
The Python version is separate from the original C project:
- Original C: `E:\SIH26132`
- Python: `E:\SIH26132_PYTHON`

There is no database synchronization between them.

## SIH Message
KisanLink helps farmers reach buyers directly, improves crop discovery and price visibility, and provides a structured request-to-deal workflow with rule-based smart matching.
