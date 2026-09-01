# 🤝 Contributing to Quiz Platform

Thank you for your interest in contributing to the **Automated Cyber-Secure Quiz & Assessment Platform**!

---

## 📌 Development Workflow

Follow this step-by-step workflow to submit bug fixes, features, and documentation updates.

### 1. Fork the Repository
Click the **Fork** button on the top right of the repository to create your own copy on GitHub.

---

### 2. Clone Locally
Clone your forked repository to your local machine:
```bash
git clone [https://github.com/](https://github.com/)<your-username>/Quiz.git
cd Quiz
```

### 3. Create a Feature Branch
Always branch off the dev branch for active development:
```bash
# Ensure your local dev branch is up to date
git checkout dev
git pull origin dev

# Create and switch to your feature branch
git checkout -b feature/your-feature-name
```

### 4. Environment Setup
* **Backend (Flask):** Follow the Python virtual environment setup in README.md and ensure database connection variables are set in your root .env file.  
* **Frontend (React):** Install node packages using npm install inside the frontend/ directory and configure your frontend/.env.  
* **Database (MySQL):** Verify that local relational schema credentials match your .env configuration.

### 5. Commit Your Changes
Format your commit messages using standard conventional prefixes:
* **feat:** for new features or enhancements

* **fix:** for bug fixes and patches

* **docs:** for documentation updates

* **refactor:** for code restructuring without changing functionality

### 6. Submit a Pull Request (PR)
1. Push your branch to GitHub:
```bash
git push origin feature/your-feature-name
```
2. Open a Pull Request: Navigate to the original repository on GitHub and open a PR targeting the dev branch.  
3. Describe Your Changes: Include a clear summary of the problem solved, new UI/API behavior, and test scenarios verified. 

 *⚠️ Note: Direct commits and unauthorized merges to the main branch are restricted. All features must be tested and merged into dev first.*