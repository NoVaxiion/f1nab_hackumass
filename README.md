# 🏎️ F1NAB — HackUMass Project

**F1NAB** is a Python-based Formula 1 data exploration project developed during **HackUMass**.  
It scrapes live race information, builds embeddings with **Pinecone**, and stores structured results in a local **SQLite** database for semantic querying and analysis.  
The project demonstrates how web-scraped motorsport data can be transformed into searchable, vectorized insights using lightweight infrastructure.

---

## ⚠️ Update
The official **Formula 1** website implemented stricter request blocking, preventing any external connections from the scraper.  
As a result, the web-scraping module is **non-functional**, and the project has been **discontinued since December 2024**.  
No further updates or maintenance are planned.

---

## 🔧 Core Components
- **`webscrape.py`** — Collected and parsed Formula 1 race data  
- **`pinecone_embed.py`** — Generated embeddings for vector search  
- **`query.py`** — Performed natural-language queries on stored data  
- **`server.py`** — Lightweight API server for front-end or CLI access  
- **`f1_race_data.db`** — Example SQLite database containing structured F1 data

---

## 💡 Overview
F1NAB was designed to showcase how **machine learning, vector databases, and automation** can work together for data-driven sports analytics.  
By embedding race data and enabling semantic search, it served as an early experiment in intelligent motorsport data systems.

---

## 🏁 Project Status
🟥 **Discontinued** — development ceased in **December 2024** following the Formula 1 site’s connection restrictions.  
This repository remains available for reference and educational purposes.

---

## 👥 Contributors
Developed by **Kenneth Maeda** and collaborators during **HackUMass**.
