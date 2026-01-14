# DBMS Security and Integrity (NoSQL Prototype)

This repository provides reproducible code for a DBMS security & integrity study using MongoDB (NoSQL).

## Methods
- Method A (Integrity): MongoDB schema validation + SHA-256 checksums
- Method B (Confidentiality): AES-256 encryption at application layer (Node.js)
- Method C (Combined): encryption + checksum integrated workflow

## Prerequisites
- Node.js (LTS recommended)
- MongoDB Community Server
- mongosh

## Setup
1) Install dependencies:
   npm install

2) Start MongoDB locally:
   mongod

3) Create schema validation:
   mongosh
   use dbms_security
   load("mongodb/schema_validation.js")

## Run Method C demo
npm run run:methodc

## Run experiments
npm run exp:latency
npm run exp:throughput

Results are written into:
- results/latency_results.csv
- results/throughput_results.csv

## Environment variables (optional)
- MONGO_URI (default: mongodb://127.0.0.1:27017)
- DB_NAME (default: dbms_security)
