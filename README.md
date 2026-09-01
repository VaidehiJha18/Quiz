<div id="top">

<!-- HEADER STYLE: CLASSIC -->
<div align="center">

<img src="readmeai/assets/logos/purple.svg" width="30%" style="position: relative; top: 0; right: 0;" alt="Project Logo"/>

# 🛡️ QUIZ - Automated Cyber-Secure Assessment Platform

<em>A full-stack examination platform featuring role-based workflows, dynamic test paper generation, and real-time behavioral anti-cheat monitoring.</em>

<!-- BADGES -->
<img src="https://img.shields.io/github/license/VaidehiJha18/Quiz?style=default&logo=opensourceinitiative&logoColor=white&color=0080ff" alt="license">
<img src="https://img.shields.io/github/last-commit/VaidehiJha18/Quiz?style=default&logo=git&logoColor=white&color=0080ff" alt="last-commit">
<img src="https://img.shields.io/github/languages/top/VaidehiJha18/Quiz?style=default&color=0080ff" alt="repo-top-language">
<img src="https://img.shields.io/github/languages/count/VaidehiJha18/Quiz?style=default&color=0080ff" alt="repo-language-count">

</div>
<br>

---

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
  - [Project Index](#project-index)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Usage](#usage)
  - [Testing](#testing)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)

---
## Overview

The **Automated Cyber-Secure Quiz & Exam Blueprint System** is a full-stack, enterprise-grade academic assessment platform designed to modernize digital examinations while actively safeguarding academic integrity[cite: 1, 2]. Built using a decoupled architecture with a **React.js** frontend, a **Python Flask** REST API, and a relational **MySQL** database, the platform replaces manual test administration with an automated, tamper-resistant ecosystem[cite: 1, 2, 4].

### 🎯 Problem Statement & Purpose
Traditional online learning management systems frequently suffer from unauthorized collaboration, tab-switching, and manual overhead in test compilation[cite: 2, 4]. This platform addresses these vulnerabilities by establishing a controlled, proctored browser environment coupled with automated question extraction, strict schedule windows, and domain-level authentication[cite: 1, 2, 9].

---

### 🏛️ Core System Architecture
				  ┌─────────────────────────────────────────┐
                  │          React.js Frontend (UI)         │
                  │  • Glassmorphism Dashboards             │
                  │  • Anti-Cheat Window & Tab Hooks        │
                  │  • KaTeX Mathematical Rendering         │
                  └────────────────────┬────────────────────┘
                                       │
                                REST API (JSON)
                             Axios / CORS Enabled
                                       │
                  ┌────────────────────▼────────────────────┐
                  │          Flask Backend (Python)         │
                  │  • RBAC Session & Auth (Argon2 / JWT)   │
                  │  • Randomized Quiz Engine (UUID Tokens) │
                  │  • Blueprint & Multi-Format Parsers     │
                  └────────────────────┬────────────────────┘
                                       │
                              PyMySQL / SSL-TLS
                                       │
                  ┌────────────────────▼────────────────────┐
                  │         MySQL Database (Relational)     │
                  │  • ACID Institutional Hierarchies       │
                  │  • Question Banks & Tagged Metadatas    │
                  │  • Real-Time Violation & Attempt Logs   │
                  └─────────────────────────────────────────┘

---

### 🛡️ Architectural Pillars

* **Active Proctoring & Behavioral Analysis:**  
  Leverages browser event listeners and the HTML5 Page Visibility API to lock the screen into fullscreen mode, track window blur/tab-switch events, and log real-time violations directly to the database, auto-submitting exams when thresholds are breached[cite: 1, 2, 9].

* **Dynamic Question Bank & Blueprint Generation:**  
  Automates test creation by drawing questions dynamically from course- and unit-tagged pools[cite: 1, 4, 10]. It supports rule-based exam compilation for mid-semester and end-semester blueprints with custom mark weightings (e.g., 1M, 2M, 4M, 5M) and formats (MCQ vs. Descriptive)[cite: 10].

* **Role-Based Governance (RBAC):**  
  Maintains distinct workflows and data boundaries for **Admins** (system-wide entity setup, user management, and Excel bulk imports), **Professors** (question bank authoring, exam generation, and grade analytics), and **Students** (secure testing portal and published scorecard reviews)[cite: 1, 2, 6].

* **Data Integrity & Security:**  
  Secures passwords using cryptographic hashing (**Argon2 / Werkzeug**), manages exam sessions via unguessable **UUID tokens**, and safeguards all database communication using connection pooling and SSL encryption[cite: 1, 2, 4].


## Features

- **Anti-Cheat Lockdown:** Enforces fullscreen mode, logs tab switches and window blur events, and auto-submits tests on violation limits.
- **Role-Based Portals:** Dedicated dashboards and navigation workflows for Admin, Professor, and Student roles.
- **Dynamic Quiz Compilation:** Course-, unit-, and division-filtered randomized question generation with unique exam session tokens.
- **Scheduled Examination Delivery:** Automated time windows enforcing strict start and end deadlines for test availability.
- **Academic Analytics:** Result aggregation, score distribution tracking, and student attempt histories.

## Project Structure

```sh
└── Quiz/
    ├── backend
    │   ├── __init__.py
    │   ├── app.py
    │   ├── config.py
    │   ├── extensions.py
    │   ├── models
    │   ├── routes
    │   └── services
    ├── frontend
    │   ├── .DS_Store
    │   ├── .env.production
    │   ├── package-lock.json
    │   ├── package.json
    │   ├── public
    │   ├── README.md
    │   └── src
    ├── package-lock.json
    ├── README.md
    ├── requirements.txt
    └── run.py
```

## Tech Stack

| Layer        | Technologies                                       |
| ------------ | -------------------------------------------------- |
| **Frontend** | React.js, Tailwind CSS, Axios, React Router, KaTeX |
| **Backend**  | Python Flask, PyMySQL, Flask-CORS, WTForms         |
| **Database** | MySQL (Relational Schema with ACID integrity)      |

---

### Project Index

<details open>
	<summary><b><code>QUIZ/</code></b></summary>
	<!-- __root__ Submodule -->
	<details>
		<summary><b>__root__</b></summary>
		<blockquote>
			<div class='directory-path' style='padding: 8px 0; color: #666;'>
				<code><b>⦿ __root__</b></code>
			<table style='width: 100%; border-collapse: collapse;'>
			<thead>
				<tr style='background-color: #f8f9fa;'>
					<th style='width: 30%; text-align: left; padding: 8px;'>File Name</th>
					<th style='text-align: left; padding: 8px;'>Summary</th>
				</tr>
			</thead>
				<tr style='border-bottom: 1px solid #eee;'>
					<td style='padding: 8px;'><b><a href='https://github.com/VaidehiJha18/Quiz/blob/master/package-lock.json'>package-lock.json</a></b></td>
					<td style='padding: 8px;'>Code>❯ REPLACE-ME</code></td>
				</tr>
				<tr style='border-bottom: 1px solid #eee;'>
					<td style='padding: 8px;'><b><a href='https://github.com/VaidehiJha18/Quiz/blob/master/requirements.txt'>requirements.txt</a></b></td>
					<td style='padding: 8px;'>Code>❯ REPLACE-ME</code></td>
				</tr>
				<tr style='border-bottom: 1px solid #eee;'>
					<td style='padding: 8px;'><b><a href='https://github.com/VaidehiJha18/Quiz/blob/master/run.py'>run.py</a></b></td>
					<td style='padding: 8px;'>Code>❯ REPLACE-ME</code></td>
				</tr>
				<tr style='border-bottom: 1px solid #eee;'>
					<td style='padding: 8px;'><b><a href='https://github.com/VaidehiJha18/Quiz/blob/master/test.py'>test.py</a></b></td>
					<td style='padding: 8px;'>Code>❯ REPLACE-ME</code></td>
				</tr>
				<tr style='border-bottom: 1px solid #eee;'>
					<td style='padding: 8px;'><b><a href='https://github.com/VaidehiJha18/Quiz/blob/master/test_quiz_generation.py'>test_quiz_generation.py</a></b></td>
					<td style='padding: 8px;'>Code>❯ REPLACE-ME</code></td>
				</tr>
			</table>
		</blockquote>
	</details>
	<!-- backend Submodule -->
	<details>
		<summary><b>backend</b></summary>
		<blockquote>
			<div class='directory-path' style='padding: 8px 0; color: #666;'>
				<code><b>⦿ backend</b></code>
			<table style='width: 100%; border-collapse: collapse;'>
			<thead>
				<tr style='background-color: #f8f9fa;'>
					<th style='width: 30%; text-align: left; padding: 8px;'>File Name</th>
					<th style='text-align: left; padding: 8px;'>Summary</th>
				</tr>
			</thead>
				<tr style='border-bottom: 1px solid #eee;'>
					<td style='padding: 8px;'><b><a href='https://github.com/VaidehiJha18/Quiz/blob/master/backend\app.py'>app.py</a></b></td>
					<td style='padding: 8px;'>Code>❯ REPLACE-ME</code></td>
				</tr>
				<tr style='border-bottom: 1px solid #eee;'>
					<td style='padding: 8px;'><b><a href='https://github.com/VaidehiJha18/Quiz/blob/master/backend\config.py'>config.py</a></b></td>
					<td style='padding: 8px;'>Code>❯ REPLACE-ME</code></td>
				</tr>
				<tr style='border-bottom: 1px solid #eee;'>
					<td style='padding: 8px;'><b><a href='https://github.com/VaidehiJha18/Quiz/blob/master/backend\extensions.py'>extensions.py</a></b></td>
					<td style='padding: 8px;'>Code>❯ REPLACE-ME</code></td>
				</tr>
			</table>
			<!-- models Submodule -->
			<details>
				<summary><b>models</b></summary>
				<blockquote>
					<div class='directory-path' style='padding: 8px 0; color: #666;'>
						<code><b>⦿ backend.models</b></code>
					<table style='width: 100%; border-collapse: collapse;'>
					<thead>
						<tr style='background-color: #f8f9fa;'>
							<th style='width: 30%; text-align: left; padding: 8px;'>File Name</th>
							<th style='text-align: left; padding: 8px;'>Summary</th>
						</tr>
					</thead>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/VaidehiJha18/Quiz/blob/master/backend\models\governance.py'>governance.py</a></b></td>
							<td style='padding: 8px;'>Code>❯ REPLACE-ME</code></td>
						</tr>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/VaidehiJha18/Quiz/blob/master/backend\models\quiz.py'>quiz.py</a></b></td>
							<td style='padding: 8px;'>Code>❯ REPLACE-ME</code></td>
						</tr>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/VaidehiJha18/Quiz/blob/master/backend\models\user.py'>user.py</a></b></td>
							<td style='padding: 8px;'>Code>❯ REPLACE-ME</code></td>
						</tr>
					</table>
				</blockquote>
			</details>
			<!-- routes Submodule -->
			<details>
				<summary><b>routes</b></summary>
				<blockquote>
					<div class='directory-path' style='padding: 8px 0; color: #666;'>
						<code><b>⦿ backend.routes</b></code>
					<table style='width: 100%; border-collapse: collapse;'>
					<thead>
						<tr style='background-color: #f8f9fa;'>
							<th style='width: 30%; text-align: left; padding: 8px;'>File Name</th>
							<th style='text-align: left; padding: 8px;'>Summary</th>
						</tr>
					</thead>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/VaidehiJha18/Quiz/blob/master/backend\routes\admin.py'>admin.py</a></b></td>
							<td style='padding: 8px;'>Code>❯ REPLACE-ME</code></td>
						</tr>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/VaidehiJha18/Quiz/blob/master/backend\routes\auth.py'>auth.py</a></b></td>
							<td style='padding: 8px;'>Code>❯ REPLACE-ME</code></td>
						</tr>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/VaidehiJha18/Quiz/blob/master/backend\routes\professor.py'>professor.py</a></b></td>
							<td style='padding: 8px;'>Code>❯ REPLACE-ME</code></td>
						</tr>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/VaidehiJha18/Quiz/blob/master/backend\routes\student.py'>student.py</a></b></td>
							<td style='padding: 8px;'>Code>❯ REPLACE-ME</code></td>
						</tr>
					</table>
				</blockquote>
			</details>
			<!-- services Submodule -->
			<details>
				<summary><b>services</b></summary>
				<blockquote>
					<div class='directory-path' style='padding: 8px 0; color: #666;'>
						<code><b>⦿ backend.services</b></code>
					<table style='width: 100%; border-collapse: collapse;'>
					<thead>
						<tr style='background-color: #f8f9fa;'>
							<th style='width: 30%; text-align: left; padding: 8px;'>File Name</th>
							<th style='text-align: left; padding: 8px;'>Summary</th>
						</tr>
					</thead>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/VaidehiJha18/Quiz/blob/master/backend\services\admin_service.py'>admin_service.py</a></b></td>
							<td style='padding: 8px;'>Code>❯ REPLACE-ME</code></td>
						</tr>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/VaidehiJha18/Quiz/blob/master/backend\services\auth_service.py'>auth_service.py</a></b></td>
							<td style='padding: 8px;'>Code>❯ REPLACE-ME</code></td>
						</tr>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/VaidehiJha18/Quiz/blob/master/backend\services\quiz_service.py'>quiz_service.py</a></b></td>
							<td style='padding: 8px;'>Code>❯ REPLACE-ME</code></td>
						</tr>
					</table>
				</blockquote>
			</details>
		</blockquote>
	</details>
	<!-- frontend Submodule -->
	<details>
		<summary><b>frontend</b></summary>
		<blockquote>
			<div class='directory-path' style='padding: 8px 0; color: #666;'>
				<code><b>⦿ frontend</b></code>
			<table style='width: 100%; border-collapse: collapse;'>
			<thead>
				<tr style='background-color: #f8f9fa;'>
					<th style='width: 30%; text-align: left; padding: 8px;'>File Name</th>
					<th style='text-align: left; padding: 8px;'>Summary</th>
				</tr>
			</thead>
				<tr style='border-bottom: 1px solid #eee;'>
					<td style='padding: 8px;'><b><a href='https://github.com/VaidehiJha18/Quiz/blob/master/frontend\.env.production'>.env.production</a></b></td>
					<td style='padding: 8px;'>Code>❯ REPLACE-ME</code></td>
				</tr>
				<tr style='border-bottom: 1px solid #eee;'>
					<td style='padding: 8px;'><b><a href='https://github.com/VaidehiJha18/Quiz/blob/master/frontend\package-lock.json'>package-lock.json</a></b></td>
					<td style='padding: 8px;'>Code>❯ REPLACE-ME</code></td>
				</tr>
				<tr style='border-bottom: 1px solid #eee;'>
					<td style='padding: 8px;'><b><a href='https://github.com/VaidehiJha18/Quiz/blob/master/frontend\package.json'>package.json</a></b></td>
					<td style='padding: 8px;'>Code>❯ REPLACE-ME</code></td>
				</tr>
			</table>
			<!-- public Submodule -->
			<details>
				<summary><b>public</b></summary>
				<blockquote>
					<div class='directory-path' style='padding: 8px 0; color: #666;'>
						<code><b>⦿ frontend.public</b></code>
					<table style='width: 100%; border-collapse: collapse;'>
					<thead>
						<tr style='background-color: #f8f9fa;'>
							<th style='width: 30%; text-align: left; padding: 8px;'>File Name</th>
							<th style='text-align: left; padding: 8px;'>Summary</th>
						</tr>
					</thead>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/VaidehiJha18/Quiz/blob/master/frontend\public\index.html'>index.html</a></b></td>
							<td style='padding: 8px;'>Code>❯ REPLACE-ME</code></td>
						</tr>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/VaidehiJha18/Quiz/blob/master/frontend\public\manifest.json'>manifest.json</a></b></td>
							<td style='padding: 8px;'>Code>❯ REPLACE-ME</code></td>
						</tr>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/VaidehiJha18/Quiz/blob/master/frontend\public\robots.txt'>robots.txt</a></b></td>
							<td style='padding: 8px;'>Code>❯ REPLACE-ME</code></td>
						</tr>
					</table>
				</blockquote>
			</details>
			<!-- src Submodule -->
			<details>
				<summary><b>src</b></summary>
				<blockquote>
					<div class='directory-path' style='padding: 8px 0; color: #666;'>
						<code><b>⦿ frontend.src</b></code>
					<table style='width: 100%; border-collapse: collapse;'>
					<thead>
						<tr style='background-color: #f8f9fa;'>
							<th style='width: 30%; text-align: left; padding: 8px;'>File Name</th>
							<th style='text-align: left; padding: 8px;'>Summary</th>
						</tr>
					</thead>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/VaidehiJha18/Quiz/blob/master/frontend\src\App.css'>App.css</a></b></td>
							<td style='padding: 8px;'>Code>❯ REPLACE-ME</code></td>
						</tr>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/VaidehiJha18/Quiz/blob/master/frontend\src\App.js'>App.js</a></b></td>
							<td style='padding: 8px;'>Code>❯ REPLACE-ME</code></td>
						</tr>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/VaidehiJha18/Quiz/blob/master/frontend\src\index.css'>index.css</a></b></td>
							<td style='padding: 8px;'>Code>❯ REPLACE-ME</code></td>
						</tr>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/VaidehiJha18/Quiz/blob/master/frontend\src\index.js'>index.js</a></b></td>
							<td style='padding: 8px;'>Code>❯ REPLACE-ME</code></td>
						</tr>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/VaidehiJha18/Quiz/blob/master/frontend\src\reportWebVitals.js'>reportWebVitals.js</a></b></td>
							<td style='padding: 8px;'>Code>❯ REPLACE-ME</code></td>
						</tr>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/VaidehiJha18/Quiz/blob/master/frontend\src\setupTests.js'>setupTests.js</a></b></td>
							<td style='padding: 8px;'>Code>❯ REPLACE-ME</code></td>
						</tr>
					</table>
					<!-- api Submodule -->
					<details>
						<summary><b>api</b></summary>
						<blockquote>
							<div class='directory-path' style='padding: 8px 0; color: #666;'>
								<code><b>⦿ frontend.src.api</b></code>
							<table style='width: 100%; border-collapse: collapse;'>
							<thead>
								<tr style='background-color: #f8f9fa;'>
									<th style='width: 30%; text-align: left; padding: 8px;'>File Name</th>
									<th style='text-align: left; padding: 8px;'>Summary</th>
								</tr>
							</thead>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='https://github.com/VaidehiJha18/Quiz/blob/master/frontend\src\api\apiService.js'>apiService.js</a></b></td>
									<td style='padding: 8px;'>Code>❯ REPLACE-ME</code></td>
								</tr>
							</table>
						</blockquote>
					</details>
					<!-- components Submodule -->
					<details>
						<summary><b>components</b></summary>
						<blockquote>
							<div class='directory-path' style='padding: 8px 0; color: #666;'>
								<code><b>⦿ frontend.src.components</b></code>
							<table style='width: 100%; border-collapse: collapse;'>
							<thead>
								<tr style='background-color: #f8f9fa;'>
									<th style='width: 30%; text-align: left; padding: 8px;'>File Name</th>
									<th style='text-align: left; padding: 8px;'>Summary</th>
								</tr>
							</thead>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='https://github.com/VaidehiJha18/Quiz/blob/master/frontend\src\components\QuizTimer.jsx'>QuizTimer.jsx</a></b></td>
									<td style='padding: 8px;'>Code>❯ REPLACE-ME</code></td>
								</tr>
							</table>
							<!-- forms Submodule -->
							<details>
								<summary><b>forms</b></summary>
								<blockquote>
									<div class='directory-path' style='padding: 8px 0; color: #666;'>
										<code><b>⦿ frontend.src.components.forms</b></code>
									<table style='width: 100%; border-collapse: collapse;'>
									<thead>
										<tr style='background-color: #f8f9fa;'>
											<th style='width: 30%; text-align: left; padding: 8px;'>File Name</th>
											<th style='text-align: left; padding: 8px;'>Summary</th>
										</tr>
									</thead>
										<tr style='border-bottom: 1px solid #eee;'>
											<td style='padding: 8px;'><b><a href='https://github.com/VaidehiJha18/Quiz/blob/master/frontend\src\components\forms\AdminBulkUploadForm.js'>AdminBulkUploadForm.js</a></b></td>
											<td style='padding: 8px;'>Code>❯ REPLACE-ME</code></td>
										</tr>
										<tr style='border-bottom: 1px solid #eee;'>
											<td style='padding: 8px;'><b><a href='https://github.com/VaidehiJha18/Quiz/blob/master/frontend\src\components\forms\Button.js'>Button.js</a></b></td>
											<td style='padding: 8px;'>Code>❯ REPLACE-ME</code></td>
										</tr>
										<tr style='border-bottom: 1px solid #eee;'>
											<td style='padding: 8px;'><b><a href='https://github.com/VaidehiJha18/Quiz/blob/master/frontend\src\components\forms\FormInput.css'>FormInput.css</a></b></td>
											<td style='padding: 8px;'>Code>❯ REPLACE-ME</code></td>
										</tr>
										<tr style='border-bottom: 1px solid #eee;'>
											<td style='padding: 8px;'><b><a href='https://github.com/VaidehiJha18/Quiz/blob/master/frontend\src\components\forms\FormInput.js'>FormInput.js</a></b></td>
											<td style='padding: 8px;'>Code>❯ REPLACE-ME</code></td>
										</tr>
										<tr style='border-bottom: 1px solid #eee;'>
											<td style='padding: 8px;'><b><a href='https://github.com/VaidehiJha18/Quiz/blob/master/frontend\src\components\forms\LoginForm.js'>LoginForm.js</a></b></td>
											<td style='padding: 8px;'>Code>❯ REPLACE-ME</code></td>
										</tr>
										<tr style='border-bottom: 1px solid #eee;'>
											<td style='padding: 8px;'><b><a href='https://github.com/VaidehiJha18/Quiz/blob/master/frontend\src\components\forms\SignupForm.js'>SignupForm.js</a></b></td>
											<td style='padding: 8px;'>Code>❯ REPLACE-ME</code></td>
										</tr>
									</table>
								</blockquote>
							</details>
							<!-- layout Submodule -->
							<details>
								<summary><b>layout</b></summary>
								<blockquote>
									<div class='directory-path' style='padding: 8px 0; color: #666;'>
										<code><b>⦿ frontend.src.components.layout</b></code>
									<table style='width: 100%; border-collapse: collapse;'>
									<thead>
										<tr style='background-color: #f8f9fa;'>
											<th style='width: 30%; text-align: left; padding: 8px;'>File Name</th>
											<th style='text-align: left; padding: 8px;'>Summary</th>
										</tr>
									</thead>
										<tr style='border-bottom: 1px solid #eee;'>
											<td style='padding: 8px;'><b><a href='https://github.com/VaidehiJha18/Quiz/blob/master/frontend\src\components\layout\AdminRoute.js'>AdminRoute.js</a></b></td>
											<td style='padding: 8px;'>Code>❯ REPLACE-ME</code></td>
										</tr>
										<tr style='border-bottom: 1px solid #eee;'>
											<td style='padding: 8px;'><b><a href='https://github.com/VaidehiJha18/Quiz/blob/master/frontend\src\components\layout\AdminSidebar.js'>AdminSidebar.js</a></b></td>
											<td style='padding: 8px;'>Code>❯ REPLACE-ME</code></td>
										</tr>
										<tr style='border-bottom: 1px solid #eee;'>
											<td style='padding: 8px;'><b><a href='https://github.com/VaidehiJha18/Quiz/blob/master/frontend\src\components\layout\Dropdown.js'>Dropdown.js</a></b></td>
											<td style='padding: 8px;'>Code>❯ REPLACE-ME</code></td>
										</tr>
										<tr style='border-bottom: 1px solid #eee;'>
											<td style='padding: 8px;'><b><a href='https://github.com/VaidehiJha18/Quiz/blob/master/frontend\src\components\layout\Footer.js'>Footer.js</a></b></td>
											<td style='padding: 8px;'>Code>❯ REPLACE-ME</code></td>
										</tr>
										<tr style='border-bottom: 1px solid #eee;'>
											<td style='padding: 8px;'><b><a href='https://github.com/VaidehiJha18/Quiz/blob/master/frontend\src\components\layout\Header.js'>Header.js</a></b></td>
											<td style='padding: 8px;'>Code>❯ REPLACE-ME</code></td>
										</tr>
										<tr style='border-bottom: 1px solid #eee;'>
											<td style='padding: 8px;'><b><a href='https://github.com/VaidehiJha18/Quiz/blob/master/frontend\src\components\layout\ProfessorLayout.js'>ProfessorLayout.js</a></b></td>
											<td style='padding: 8px;'>Code>❯ REPLACE-ME</code></td>
										</tr>
										<tr style='border-bottom: 1px solid #eee;'>
											<td style='padding: 8px;'><b><a href='https://github.com/VaidehiJha18/Quiz/blob/master/frontend\src\components\layout\Sidebar.js'>Sidebar.js</a></b></td>
											<td style='padding: 8px;'>Code>❯ REPLACE-ME</code></td>
										</tr>
										<tr style='border-bottom: 1px solid #eee;'>
											<td style='padding: 8px;'><b><a href='https://github.com/VaidehiJha18/Quiz/blob/master/frontend\src\components\layout\StudentLayout.js'>StudentLayout.js</a></b></td>
											<td style='padding: 8px;'>Code>❯ REPLACE-ME</code></td>
										</tr>
										<tr style='border-bottom: 1px solid #eee;'>
											<td style='padding: 8px;'><b><a href='https://github.com/VaidehiJha18/Quiz/blob/master/frontend\src\components\layout\StudentSidebar.js'>StudentSidebar.js</a></b></td>
											<td style='padding: 8px;'>Code>❯ REPLACE-ME</code></td>
										</tr>
									</table>
								</blockquote>
							</details>
							<!-- quiz Submodule -->
							<details>
								<summary><b>quiz</b></summary>
								<blockquote>
									<div class='directory-path' style='padding: 8px 0; color: #666;'>
										<code><b>⦿ frontend.src.components.quiz</b></code>
									<table style='width: 100%; border-collapse: collapse;'>
									<thead>
										<tr style='background-color: #f8f9fa;'>
											<th style='width: 30%; text-align: left; padding: 8px;'>File Name</th>
											<th style='text-align: left; padding: 8px;'>Summary</th>
										</tr>
									</thead>
										<tr style='border-bottom: 1px solid #eee;'>
											<td style='padding: 8px;'><b><a href='https://github.com/VaidehiJha18/Quiz/blob/master/frontend\src\components\quiz\QuestionCard.js'>QuestionCard.js</a></b></td>
											<td style='padding: 8px;'>Code>❯ REPLACE-ME</code></td>
										</tr>
										<tr style='border-bottom: 1px solid #eee;'>
											<td style='padding: 8px;'><b><a href='https://github.com/VaidehiJha18/Quiz/blob/master/frontend\src\components\quiz\QuestionIndicator.js'>QuestionIndicator.js</a></b></td>
											<td style='padding: 8px;'>Code>❯ REPLACE-ME</code></td>
										</tr>
										<tr style='border-bottom: 1px solid #eee;'>
											<td style='padding: 8px;'><b><a href='https://github.com/VaidehiJha18/Quiz/blob/master/frontend\src\components\quiz\QuizQCard.js'>QuizQCard.js</a></b></td>
											<td style='padding: 8px;'>Code>❯ REPLACE-ME</code></td>
										</tr>
										<tr style='border-bottom: 1px solid #eee;'>
											<td style='padding: 8px;'><b><a href='https://github.com/VaidehiJha18/Quiz/blob/master/frontend\src\components\quiz\QuizSidebar.js'>QuizSidebar.js</a></b></td>
											<td style='padding: 8px;'>Code>❯ REPLACE-ME</code></td>
										</tr>
										<tr style='border-bottom: 1px solid #eee;'>
											<td style='padding: 8px;'><b><a href='https://github.com/VaidehiJha18/Quiz/blob/master/frontend\src\components\quiz\StudentQuizCard.js'>StudentQuizCard.js</a></b></td>
											<td style='padding: 8px;'>Code>❯ REPLACE-ME</code></td>
										</tr>
									</table>
								</blockquote>
							</details>
							<!-- ui Submodule -->
							<details>
								<summary><b>ui</b></summary>
								<blockquote>
									<div class='directory-path' style='padding: 8px 0; color: #666;'>
										<code><b>⦿ frontend.src.components.ui</b></code>
									<table style='width: 100%; border-collapse: collapse;'>
									<thead>
										<tr style='background-color: #f8f9fa;'>
											<th style='width: 30%; text-align: left; padding: 8px;'>File Name</th>
											<th style='text-align: left; padding: 8px;'>Summary</th>
										</tr>
									</thead>
										<tr style='border-bottom: 1px solid #eee;'>
											<td style='padding: 8px;'><b><a href='https://github.com/VaidehiJha18/Quiz/blob/master/frontend\src\components\ui\Card.js'>Card.js</a></b></td>
											<td style='padding: 8px;'>Code>❯ REPLACE-ME</code></td>
										</tr>
										<tr style='border-bottom: 1px solid #eee;'>
											<td style='padding: 8px;'><b><a href='https://github.com/VaidehiJha18/Quiz/blob/master/frontend\src\components\ui\MessageDisplay.js'>MessageDisplay.js</a></b></td>
											<td style='padding: 8px;'>Code>❯ REPLACE-ME</code></td>
										</tr>
										<tr style='border-bottom: 1px solid #eee;'>
											<td style='padding: 8px;'><b><a href='https://github.com/VaidehiJha18/Quiz/blob/master/frontend\src\components\ui\StatCard.js'>StatCard.js</a></b></td>
											<td style='padding: 8px;'>Code>❯ REPLACE-ME</code></td>
										</tr>
										<tr style='border-bottom: 1px solid #eee;'>
											<td style='padding: 8px;'><b><a href='https://github.com/VaidehiJha18/Quiz/blob/master/frontend\src\components\ui\Table.js'>Table.js</a></b></td>
											<td style='padding: 8px;'>Code>❯ REPLACE-ME</code></td>
										</tr>
									</table>
								</blockquote>
							</details>
						</blockquote>
					</details>
					<!-- hooks Submodule -->
					<details>
						<summary><b>hooks</b></summary>
						<blockquote>
							<div class='directory-path' style='padding: 8px 0; color: #666;'>
								<code><b>⦿ frontend.src.hooks</b></code>
							<table style='width: 100%; border-collapse: collapse;'>
							<thead>
								<tr style='background-color: #f8f9fa;'>
									<th style='width: 30%; text-align: left; padding: 8px;'>File Name</th>
									<th style='text-align: left; padding: 8px;'>Summary</th>
								</tr>
							</thead>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='https://github.com/VaidehiJha18/Quiz/blob/master/frontend\src\hooks\useAntiCheat.js'>useAntiCheat.js</a></b></td>
									<td style='padding: 8px;'>Code>❯ REPLACE-ME</code></td>
								</tr>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='https://github.com/VaidehiJha18/Quiz/blob/master/frontend\src\hooks\useQuizTimer.js'>useQuizTimer.js</a></b></td>
									<td style='padding: 8px;'>Code>❯ REPLACE-ME</code></td>
								</tr>
							</table>
						</blockquote>
					</details>
					<!-- pages Submodule -->
					<details>
						<summary><b>pages</b></summary>
						<blockquote>
							<div class='directory-path' style='padding: 8px 0; color: #666;'>
								<code><b>⦿ frontend.src.pages</b></code>
							<table style='width: 100%; border-collapse: collapse;'>
							<thead>
								<tr style='background-color: #f8f9fa;'>
									<th style='width: 30%; text-align: left; padding: 8px;'>File Name</th>
									<th style='text-align: left; padding: 8px;'>Summary</th>
								</tr>
							</thead>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='https://github.com/VaidehiJha18/Quiz/blob/master/frontend\src\pages\AdminDashboardPage.js'>AdminDashboardPage.js</a></b></td>
									<td style='padding: 8px;'>Code>❯ REPLACE-ME</code></td>
								</tr>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='https://github.com/VaidehiJha18/Quiz/blob/master/frontend\src\pages\AdminManageUsersPage.js'>AdminManageUsersPage.js</a></b></td>
									<td style='padding: 8px;'>Code>❯ REPLACE-ME</code></td>
								</tr>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='https://github.com/VaidehiJha18/Quiz/blob/master/frontend\src\pages\AdminSystemSetupPage.js'>AdminSystemSetupPage.js</a></b></td>
									<td style='padding: 8px;'>Code>❯ REPLACE-ME</code></td>
								</tr>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='https://github.com/VaidehiJha18/Quiz/blob/master/frontend\src\pages\AuthPage.js'>AuthPage.js</a></b></td>
									<td style='padding: 8px;'>Code>❯ REPLACE-ME</code></td>
								</tr>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='https://github.com/VaidehiJha18/Quiz/blob/master/frontend\src\pages\EditQuestionsPage.js'>EditQuestionsPage.js</a></b></td>
									<td style='padding: 8px;'>Code>❯ REPLACE-ME</code></td>
								</tr>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='https://github.com/VaidehiJha18/Quiz/blob/master/frontend\src\pages\GenerateQuizPage.js'>GenerateQuizPage.js</a></b></td>
									<td style='padding: 8px;'>Code>❯ REPLACE-ME</code></td>
								</tr>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='https://github.com/VaidehiJha18/Quiz/blob/master/frontend\src\pages\HomePage.css'>HomePage.css</a></b></td>
									<td style='padding: 8px;'>Code>❯ REPLACE-ME</code></td>
								</tr>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='https://github.com/VaidehiJha18/Quiz/blob/master/frontend\src\pages\HomePage.js'>HomePage.js</a></b></td>
									<td style='padding: 8px;'>Code>❯ REPLACE-ME</code></td>
								</tr>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='https://github.com/VaidehiJha18/Quiz/blob/master/frontend\src\pages\LoginPage.js'>LoginPage.js</a></b></td>
									<td style='padding: 8px;'>Code>❯ REPLACE-ME</code></td>
								</tr>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='https://github.com/VaidehiJha18/Quiz/blob/master/frontend\src\pages\ManageStudentsPage.css'>ManageStudentsPage.css</a></b></td>
									<td style='padding: 8px;'>Code>❯ REPLACE-ME</code></td>
								</tr>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='https://github.com/VaidehiJha18/Quiz/blob/master/frontend\src\pages\ManageStudentsPage.js'>ManageStudentsPage.js</a></b></td>
									<td style='padding: 8px;'>Code>❯ REPLACE-ME</code></td>
								</tr>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='https://github.com/VaidehiJha18/Quiz/blob/master/frontend\src\pages\ProfessorAnalyticsPage.js'>ProfessorAnalyticsPage.js</a></b></td>
									<td style='padding: 8px;'>Code>❯ REPLACE-ME</code></td>
								</tr>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='https://github.com/VaidehiJha18/Quiz/blob/master/frontend\src\pages\ProfessorDashboard.js'>ProfessorDashboard.js</a></b></td>
									<td style='padding: 8px;'>Code>❯ REPLACE-ME</code></td>
								</tr>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='https://github.com/VaidehiJha18/Quiz/blob/master/frontend\src\pages\ProfessorResultsPage.js'>ProfessorResultsPage.js</a></b></td>
									<td style='padding: 8px;'>Code>❯ REPLACE-ME</code></td>
								</tr>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='https://github.com/VaidehiJha18/Quiz/blob/master/frontend\src\pages\Quiz.css'>Quiz.css</a></b></td>
									<td style='padding: 8px;'>Code>❯ REPLACE-ME</code></td>
								</tr>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='https://github.com/VaidehiJha18/Quiz/blob/master/frontend\src\pages\Quiz.js'>Quiz.js</a></b></td>
									<td style='padding: 8px;'>Code>❯ REPLACE-ME</code></td>
								</tr>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='https://github.com/VaidehiJha18/Quiz/blob/master/frontend\src\pages\QuizPage.js'>QuizPage.js</a></b></td>
									<td style='padding: 8px;'>Code>❯ REPLACE-ME</code></td>
								</tr>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='https://github.com/VaidehiJha18/Quiz/blob/master/frontend\src\pages\QuizPreviewPage.js'>QuizPreviewPage.js</a></b></td>
									<td style='padding: 8px;'>Code>❯ REPLACE-ME</code></td>
								</tr>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='https://github.com/VaidehiJha18/Quiz/blob/master/frontend\src\pages\QuizResult.css'>QuizResult.css</a></b></td>
									<td style='padding: 8px;'>Code>❯ REPLACE-ME</code></td>
								</tr>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='https://github.com/VaidehiJha18/Quiz/blob/master/frontend\src\pages\QuizResult.js'>QuizResult.js</a></b></td>
									<td style='padding: 8px;'>Code>❯ REPLACE-ME</code></td>
								</tr>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='https://github.com/VaidehiJha18/Quiz/blob/master/frontend\src\pages\QuizSubmission.js'>QuizSubmission.js</a></b></td>
									<td style='padding: 8px;'>Code>❯ REPLACE-ME</code></td>
								</tr>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='https://github.com/VaidehiJha18/Quiz/blob/master/frontend\src\pages\ResultsPage.js'>ResultsPage.js</a></b></td>
									<td style='padding: 8px;'>Code>❯ REPLACE-ME</code></td>
								</tr>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='https://github.com/VaidehiJha18/Quiz/blob/master/frontend\src\pages\SignupPage.js'>SignupPage.js</a></b></td>
									<td style='padding: 8px;'>Code>❯ REPLACE-ME</code></td>
								</tr>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='https://github.com/VaidehiJha18/Quiz/blob/master/frontend\src\pages\StudentDashboard.js'>StudentDashboard.js</a></b></td>
									<td style='padding: 8px;'>Code>❯ REPLACE-ME</code></td>
								</tr>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='https://github.com/VaidehiJha18/Quiz/blob/master/frontend\src\pages\ViewQuestionsPage.js'>ViewQuestionsPage.js</a></b></td>
									<td style='padding: 8px;'>Code>❯ REPLACE-ME</code></td>
								</tr>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='https://github.com/VaidehiJha18/Quiz/blob/master/frontend\src\pages\ViewQuizzesPage.js'>ViewQuizzesPage.js</a></b></td>
									<td style='padding: 8px;'>Code>❯ REPLACE-ME</code></td>
								</tr>
							</table>
						</blockquote>
					</details>
				</blockquote>
			</details>
		</blockquote>
	</details>
</details>

---

## Getting Started

### Prerequisites

This project requires the following dependencies:

- **Python:** 3.9+
- **Node.js:** 18+ & npm
- **Database:** MySQL Server (Local or Cloud instance)

### Installation

Build Quiz from the source and intsall dependencies:

1. **Clone the repository:**

   ```sh
   ❯ git clone https://github.com/VaidehiJha18/Quiz
   ```

2. **Navigate to the project directory:**

   ```sh
   ❯ cd Quiz
   ```

3. **Install the dependencies:**

<!-- SHIELDS BADGE CURRENTLY DISABLED -->

    <!-- [![npm][npm-shield]][npm-link] -->
    <!-- REFERENCE LINKS -->
    <!-- [npm-shield]: https://img.shields.io/badge/npm-CB3837.svg?style={badge_style}&logo=npm&logoColor=white -->
    <!-- [npm-link]: https://www.npmjs.com/ -->

    **Using [npm](https://www.npmjs.com/):**

    ```sh
    ❯ npm install
    ```

<!-- SHIELDS BADGE CURRENTLY DISABLED -->

    <!-- [![pip][pip-shield]][pip-link] -->
    <!-- REFERENCE LINKS -->
    <!-- [pip-shield]: None -->
    <!-- [pip-link]: None -->

    **Using [pip](None):**

    ```sh
    ❯ cd frontend
    ❯ npm install
    ```

#### 1. Backend Setup

1. **Navigate to the project root and create a virtual environment:**

```sh
   python -m venv venv

   # On Windows (PowerShell):
   .\venv\Scripts\Activate.ps1

   # On macOS/Linux:
   source venv/bin/activate
```

2. **Install backend dependencies:**

```sh
   pip install -r requirements.txt
  1. Configure Environment Variables:
Create a .env file in the root directory:
FLASK_APP=backend/app.py
FLASK_ENV=development
MYSQL_HOST=localhost
MYSQL_USER=your_mysql_username
MYSQL_PASSWORD=your_mysql_password
MYSQL_DB=dbquiz
SECRET_KEY=your_secret_key
```

#### 1. Frontend Setup

1. **Navigate to the frontend directory:**

```sh
   cd frontend
```

2. **Install frontend dependencies:**

```sh
npm install
```

3. **Configure Frontend Environment Variables:**

```sh
Create a .env file inside the frontend/ directory:

REACT_APP_API_URL=http://localhost:5000
```

#### 🚀 Running the Application

1. **Start the Flask Backend (Port 5000)**

```sh
From the project root with the virtual environment activated:
python run.py
Or using Flask CLI:
$env:FLASK_APP="backend"
flask run
```

2. **2. Start the React Frontend (Port 3000)**

```sh
In a separate terminal inside the frontend/ directory:
cd frontend
npm start
```

### Testing

Quiz uses the {**test_framework**} test framework. Run the test suite with:

**Using [npm](https://www.npmjs.com/):**

```sh
npm test
```

---

## Roadmap

- [x] **`Task 1`**: <strike>Implement feature one.</strike>
- [ ] **`Task 2`**: Implement feature two.

---

## Contributing

- **💬 [Join the Discussions](https://github.com/VaidehiJha18/Quiz/discussions)**: Share your insights, provide feedback, or ask questions.
- **🐛 [Report Issues](https://github.com/VaidehiJha18/Quiz/issues)**: Submit bugs found or log feature requests for the `Quiz` project.
- **💡 [Submit Pull Requests](https://github.com/VaidehiJha18/Quiz/blob/main/CONTRIBUTING.md)**: Review open PRs, and submit your own PRs.

<details closed>
<summary>Contributing Guidelines</summary>

1. **Fork the Repository**: Start by forking the project repository to your github account.
2. **Clone Locally**: Clone the forked repository to your local machine using a git client.
   ```sh
   git clone https://github.com/VaidehiJha18/Quiz
   ```
3. **Create a New Branch**: Always work on a new branch, giving it a descriptive name.
   ```sh
   git checkout -b new-feature-x
   ```
4. **Make Your Changes**: Develop and test your changes locally.
5. **Commit Your Changes**: Commit with a clear message describing your updates.
   ```sh
   git commit -m 'Implemented new feature x.'
   ```
6. **Push to github**: Push the changes to your forked repository.
   ```sh
   git push origin new-feature-x
   ```
7. **Submit a Pull Request**: Create a PR against the original project repository. Clearly describe the changes and their motivations.
8. **Review**: Once your PR is reviewed and approved, it will be merged into the main branch. Congratulations on your contribution!
</details>

<details closed>
<summary>Contributor Graph</summary>
<br>
<p align="left">
   <a href="https://github.com{/VaidehiJha18/Quiz/}graphs/contributors">
      <img src="https://contrib.rocks/image?repo=VaidehiJha18/Quiz">
   </a>
</p>
</details>

---

## License

Quiz is protected under the [LICENSE](https://choosealicense.com/licenses) License. For more details, refer to the [LICENSE](https://choosealicense.com/licenses/) file.

---
## 👥 Contributors

This project was developed and maintained as a B.Tech Computer Science Engineering major project by:

| Contributor | Role & Core Responsibilities | GitHub Profile |
|---|---|---|
| **Tanishka** | **Project Lead & Repository Maintainer**<br>• System architecture & version control workflows<br>• Core full-stack integration & deployment setups<br>• Project blueprint & requirement specifications| [@tanishka](https://github.com/Tanishka07Maurya) |
| **Vaidehi Jha** | **Security & Anti-Cheat Architecture**<br>• Auth services, Argon2/JWT session management<br>• Behavioral lockdown (fullscreen, tab-switch tracking)<br>• Client API integration & custom hooks| [@VaidehiJha18](https://github.com/VaidehiJha18) |
| **Priyanka** | **Frontend Lead & Exam Engine Specialist**<br>• React UI/UX, dashboards, dynamic quiz runner<br>• Student & professor role-based governance (RBAC)<br>• Security compliance & request validations & Multi-format paper compilation (DOCX/PDF/CSV) | [@priyanka](https://github.com/Pri170306) |
| **Moiesha** |**Backend Research & Database Lead**<br>• MySQL relational schema, pooling & migrations<br>• Backend research, API route development & testing<br>• Randomized quiz generation & scheduling services |  [@Moiesha](https://github.com/Moiesha) |

---
## Acknowledgments
* Special thanks to the **Department of Computer Science & Engineering, School of Technology, GSFC University** for continuous mentorship and institutional project guidance.
- Credit `contributors`, `inspiration`, `references`, etc.

<div align="right">

[![][back-to-top]](#top)

</div>

[back-to-top]: https://img.shields.io/badge/-BACK_TO_TOP-151515?style=flat-square

---
