# **TreasureSense – Smart Vacuum Cleaner (MVP)**

### *An AI-Powered Vacuum That Knows What to Keep*

TreasureSense is an IoT-based smart vacuum cleaner system enhanced with AI-powered object detection.
This MVP demonstrates a fully functional end-to-end solution that can classify items during cleaning and intelligently separate valuables from trash — ensuring nothing important gets lost.

---

## 🚀 **Features**

### ⭐ **Real-Time Monitoring**

* Live dashboard displaying:

  * Battery percentage
  * Current location
  * Active cleaning mode
  * Dust bin fill level
  * Valuables bin status

### 🤖 **AI-Based Object Detection**

* Classifies detected objects into:

  * **Valuable**
  * **Trash**
  * **Unknown**
* Shows confidence score for every detection
* AI feedback loop included for accuracy improvement

### 📌 **Recovery Log**

* Stores record of every valuable item detected
* Shows timestamp, label, confidence, and preview

### 🧹 **Cleaning Session History**

* Tracks past cleaning sessions
* Records:

  * Area cleaned
  * Duration
  * Objects detected
  * Valuables saved

### 🔔 **Smart Notifications**

* Alerts when a valuable item is detected
* Displays priority and timestamp

### 📊 **Statistics Dashboard**

* Total items detected
* Number of valuables rescued
* AI accuracy rate
* Top detected categories

### 🎮 **Vacuum Controls**

* Start cleaning
* Stop cleaning
* Return to home / dock

---

## 🏗️ **Technical Architecture**

### 🔹 **Backend – FastAPI**

* RESTful API structure
* Endpoints for:

  * Items
  * Sessions
  * Notifications
  * AI feedback
  * Vacuum status
* Dual-bin simulation (trash + valuables)
* MongoDB models for all modules
* Real-time polling endpoints

### 🔹 **Frontend – React.js**

* Modern UI with ocean-blue/cyan theme
* Pages:

  * Dashboard
  * Detection feed
  * Recovery log
  * Sessions
  * Notifications
  * Statistics
* Smooth transitions + responsive UI

### 🔹 **Database – MongoDB**

* Item collection
* Session logs
* Notifications
* Vacuum state
* Feedback entries for improving ML model

---

## 📂 **Folder Structure**

```
app/
│── backend/
│   ├── server.py
│   ├── models/
│   ├── routes/
│   ├── tests/
│   └── requirements.txt
│
│── frontend/
│   ├── public/
│   ├── src/
│   ├── components/
│   ├── pages/
│   └── package.json
│
└── README.md
```

---

## 🛠️ **Installation & Setup**

### **Backend Setup**

```bash
cd backend
pip install -r requirements.txt
uvicorn server:app --reload
```

### **Frontend Setup**

```bash
cd frontend
npm install
npm start
```

---

## 🧪 **Testing**

Backend unit tests are included under:

```
backend/tests/
```

Run tests:

```bash
pytest
```

---

## ⚙️ **Environment Variables**

Create a `.env` file inside **backend/**:

```
MONGODB_URI=your_mongo_connection_string
SECRET_KEY=your_secret_key
```

---

## 🧠 **AI Model**

* Integrated object-detection pipeline
* Allows user feedback to improve labeling accuracy
* Supports continuous ML refinement

---

## 📦 **MVP Status**

✔ Fully functional
✔ Live dashboard
✔ AI detection simulations
✔ Complete API + Database integration
✔ UI polished and production-ready

---

## 📘 **Future Improvements**

* Integration with real sensors + camera hardware
* On-device AI inference
* Automatic path planning
* Cloud-based analytics
* OTA firmware updates

---

## 🏁 **Conclusion**

TreasureSense showcases how AI and IoT can work together to create smart household robots that are both efficient and intelligent.
The system not only cleans but also **protects valuable items**, making it a powerful, practical solution.

---

If you'd like, I can also generate:

✅ Project logo
✅ Installation GIF
✅ API documentation
✅ Demo video script

Just tell me!
Here is a clean, professional **README.md** for your TreasureSense Smart Vacuum MVP.
(You can copy–paste directly into your repository.)

---

# **TreasureSense – Smart Vacuum Cleaner (MVP)**

### *An AI-Powered Vacuum That Knows What to Keep*

TreasureSense is an IoT-based smart vacuum cleaner system enhanced with AI-powered object detection.
This MVP demonstrates a fully functional end-to-end solution that can classify items during cleaning and intelligently separate valuables from trash — ensuring nothing important gets lost.

---

## 🚀 **Features**

### ⭐ **Real-Time Monitoring**

* Live dashboard displaying:

  * Battery percentage
  * Current location
  * Active cleaning mode
  * Dust bin fill level
  * Valuables bin status

### 🤖 **AI-Based Object Detection**

* Classifies detected objects into:

  * **Valuable**
  * **Trash**
  * **Unknown**
* Shows confidence score for every detection
* AI feedback loop included for accuracy improvement

### 📌 **Recovery Log**

* Stores record of every valuable item detected
* Shows timestamp, label, confidence, and preview

### 🧹 **Cleaning Session History**

* Tracks past cleaning sessions
* Records:

  * Area cleaned
  * Duration
  * Objects detected
  * Valuables saved

### 🔔 **Smart Notifications**

* Alerts when a valuable item is detected
* Displays priority and timestamp

### 📊 **Statistics Dashboard**

* Total items detected
* Number of valuables rescued
* AI accuracy rate
* Top detected categories

### 🎮 **Vacuum Controls**

* Start cleaning
* Stop cleaning
* Return to home / dock

---

## 🏗️ **Technical Architecture**

### 🔹 **Backend – FastAPI**

* RESTful API structure
* Endpoints for:

  * Items
  * Sessions
  * Notifications
  * AI feedback
  * Vacuum status
* Dual-bin simulation (trash + valuables)
* MongoDB models for all modules
* Real-time polling endpoints

### 🔹 **Frontend – React.js**

* Modern UI with ocean-blue/cyan theme
* Pages:

  * Dashboard
  * Detection feed
  * Recovery log
  * Sessions
  * Notifications
  * Statistics
* Smooth transitions + responsive UI

### 🔹 **Database – MongoDB**

* Item collection
* Session logs
* Notifications
* Vacuum state
* Feedback entries for improving ML model

---

## 📂 **Folder Structure**

```
app/
│── backend/
│   ├── server.py
│   ├── models/
│   ├── routes/
│   ├── tests/
│   └── requirements.txt
│
│── frontend/
│   ├── public/
│   ├── src/
│   ├── components/
│   ├── pages/
│   └── package.json
│
└── README.md
```

---

## 🛠️ **Installation & Setup**

### **Backend Setup**

```bash
cd backend
pip install -r requirements.txt
uvicorn server:app --reload
```

### **Frontend Setup**

```bash
cd frontend
npm install
npm start
```

---

## 🧪 **Testing**

Backend unit tests are included under:

```
backend/tests/
```

Run tests:

```bash
pytest
```

---

## ⚙️ **Environment Variables**

Create a `.env` file inside **backend/**:

```
MONGODB_URI=your_mongo_connection_string
SECRET_KEY=your_secret_key
```

---

## 🧠 **AI Model**

* Integrated object-detection pipeline
* Allows user feedback to improve labeling accuracy
* Supports continuous ML refinement

---

## 📦 **MVP Status**

✔ Fully functional
✔ Live dashboard
✔ AI detection simulations
✔ Complete API + Database integration
✔ UI polished and production-ready

---

## 📘 **Future Improvements**

* Integration with real sensors + camera hardware
* On-device AI inference
* Automatic path planning
* Cloud-based analytics
* OTA firmware updates

---

## 🏁 **Conclusion**

TreasureSense showcases how AI and IoT can work together to create smart household robots that are both efficient and intelligent.
The system not only cleans but also **protects valuable items**, making it a powerful, practical solution.

