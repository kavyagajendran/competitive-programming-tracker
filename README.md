# Competitive Programming Tracker

A powerful, full-stack application to track and visualize competitive programming statistics from **LeetCode**, **CodeChef**, and **Codeforces**. It automatically fetches user data and synchronizes it with a Google Sheet for easy classroom or team monitoring.

##  Features

-   **Multi-Platform Support**:
    -   **LeetCode**: Global Ranking, Contest Rating, Top %, Problems Solved (Easy/Med/Hard), Last Contest Stats.
    -   **CodeChef**: Current Rating, Star Rating, Division (inferred), Global/Country Rank, Total Solved.
    -   **Codeforces**: Current/Max Rating, Rank, Problems Solved, Last Contest Analysis (Rank, Solved, Title).
-   **Google Sheets Integration**: Seamlessly updates a target Google Sheet with the latest data.
-   **Live Monitoring**: Real-time logs with color-coded status updates (Success/Processing/Error) in a modern UI.
-   **Modern UI**: Clean **Light Mode** aesthetic with glassmorphism effects, responsive design, and intuitive controls.
-   **Robust Error Handling**: Auto-retries often-failing requests and provides clear feedback on invalid profiles.

##  Tech Stack

-   **Frontend**: React (Vite), Modern CSS (Variables, Animations, Flex/Grid).
-   **Backend**: Node.js, Express.
-   **Worker**: Python (Pandas, Requests, BeautifulSoup) for reliable data scraping and API interaction.

##  Prerequisites

-   **Node.js** (v14+)
-   **Python** (v3.8+)
-   **Google Service Account JSON** (for Sheets API access) - Save as `service_account.json` in `worker/`.

##  Installation

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/cp-tracker.git
cd cp-tracker
```

### 2. Backward & Worker Setup
Install the required Python dependencies.
```bash
cd worker
pip install -r requirements.txt
cd ..
```
*Note: Ensure you have your `service_account.json` inside the `worker/` directory.*

### 3. Frontend & Server Setup
Install Node.js dependencies.
```bash
# Install root/server dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..
```

##  Usage

### 1. Start the Application
You need to run both the backend server and the frontend client.

**Option A: Concurrent (Recommended)**
If you have `concurrently` set up or prefer separate terminals:

**Terminal 1 (Server):**
```bash
node server/index.js
```

**Terminal 2 (Client):**
```bash
cd client
npm run dev
```

### 2. Configure Tracking
1.  Open the web app (usually `http://localhost:5173`).
2.  **Platform**: Select LeetCode, CodeChef, or Codeforces.
3.  **Fields**: Choose which stats you want to update (e.g., "Problems Solved", "Division").
4.  **CSV File**: Upload a CSV file containing a column of profile links.
5.  **Google Sheet**: Enter the Name or URL of the target Google Sheet.

### 3. Start Tracking
Click **Start Tracking**. The Live Logs panel will show real-time progress:
-    **[1/N] Processing...**:  Fetching data for a user.
-    **Done**: Success.
-    **Failed**: Error encountered (log will show details).

##  Project Structure

```
├── client/          # React Frontend
│   ├── src/
│   └── package.json
├── server/          # Node.js Express Server
│   └── index.js
├── worker/          # Python Scraper & Logic
│   ├── tracker.py       # Main orchestration script
│   ├── codechef_api.py  # CodeChef scraping logic
│   ├── leetcode_api.py  # LeetCode GraphQL logic
│   ├── codeforces_api.py# Codeforces API logic
│   └── requirements.txt
└── README.md
```

##  Contributing
Contributions are welcome! Please open an issue or submit a pull request for any improvements.

##  License
This project is licensed under the MIT License.
