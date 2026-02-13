# Unknown Novel

Unknown Novel is a modern web application for reading novels for free. Built with a focus on speed and user convenience, this application uses a Single Page Application (SPA) architecture to provide a seamless navigation experience.

## 🌟 Key Features

- **📖 Read Novels**: Access a collection of novels from various genres with a comfortable reading interface.
- **🔍 Quick Search**: Instantly search for novels by title, author, or description.
- **🌙 Dark Mode**: Support for automatic or manual dark theme for eye comfort.
- **📱 Responsive Design**: Optimal display on all devices (Desktop, Tablet, Mobile).
- **⚡ Fast Navigation**: Uses SPA (Single Page Application) techniques for transitions between pages without reloading.
- **📚 Library**: Save your favorite novels for easy access later.
- **👤 Account Management**: Login and registration features for readers and admins.
- **🛠️ Admin Dashboard**: Dedicated panel for administrators to manage, add, and edit novel content.

## 🛠️ Technologies Used

- **Frontend**:
  - HTML5
  - [Tailwind CSS](https://tailwindcss.com/) (Styling)
  - JavaScript (Vanilla ES6+)
  - Font Awesome (Icons)
  - Google Fonts (Inter)
- **Backend & Database**:
  - [Supabase](https://supabase.com/) (Database & Authentication)
- **Runtime**:
  - [Node.js](https://nodejs.org/) (to run the local server)

## 📋 Prerequisites

Make sure you have installed the following software on your computer:
- [Node.js](https://nodejs.org/) (v14 or later)
- npm (usually installed automatically with Node.js)

## 🚀 How to Run

Follow these steps to run this project on your local computer:

1. **Clone Repository**
   ```bash
   git clone https://github.com/username/unknown-novel.git
   cd unknown-novel
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Supabase**
   Ensure the Supabase configuration file (`assets/js/supabase.js`) is filled with your valid Supabase Project URL and Key.

4. **Run Server**
   ```bash
   npm run dev
   ```

5. **Open in Browser**
   Open your browser and visit `http://localhost:5000`.

## 📂 Project Structure

```
unknown-novel/
├── 📁 admin/          # Page files and logic for Admin Dashboard
├── 📁 assets/         # Static assets (CSS, JS, Images)
│   ├── css/           # Custom CSS files
│   ├── js/            # JavaScript scripts (including Supabase config)
│   └── img/           # Images and logos
├── 📁 database/       # Database related files (SQL dump, etc.)
├── 📁 pages/          # Partial HTML files for page content (Home, Explore, etc.)
├── 📄 index.html      # Main application file (SPA Shell)
├── 📄 server.js       # Simple Node.js server to serve static files
└── 📄 package.json    # List of dependencies and NPM scripts
```

## 📜 License

This project is distributed under the **ISC** license.
