# ⚡ Utility Bill Extraction System

A lightweight Node.js backend utility for extracting structured data from utility bill PDFs (e.g., TNB) using **PDF.js** and **coordinate-based text mapping**.  
This project converts raw bill PDFs into clean, JSON-ready outputs that can be integrated with automation tools such as **n8n**, **Supabase**, or internal APIs.

---

## 🧩 Overview

This project automates utility bill processing by:
1. Loading PDF files via **PDF.js**.
2. Mapping key data fields (like `Account No`, `Bill Date`, `Total Amount`) using **defined coordinate boxes**.
3. Extracting text directly from the visual layout.
4. Returning parsed JSON objects ready for storage or further automation.

---

## ⚙️ Tech Stack

| Component | Description |
|------------|--------------|
| **Node.js** | Backend runtime |
| **Express.js** | Middleware runtime |
| **pdfjs-dist** | PDF text extraction engine |
| **fs / path** | File system utilities for reading and writing PDFs |
| **n8n / Supabase** | Integration targets for workflow automation |
