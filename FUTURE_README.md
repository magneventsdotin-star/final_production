# 🚀 Magnevents — Data Architecture & Future AWS Migration Guide

This document provides a comprehensive analysis of the **current data architecture** of the Magnevents platform, followed by a detailed **AWS Cloud Migration Strategy** specifying server selections, service mapping, cost estimations, and step-by-step deployment instructions for migrating to Amazon Web Services (AWS).

---

## 📋 Table of Contents

1. [📌 Executive Overview](#-executive-overview)
2. [🏛️ Current System Data & Architecture Deep-Dive](#-current-system-data--architecture-deep-dive)
   - [Workspace Structure](#workspace-structure)
   - [Complete Database Schema Data Dictionary](#complete-database-schema-data-dictionary)
   - [Media & Storage Architecture](#media--storage-architecture)
   - [Environment Variables Matrix](#environment-variables-matrix)
3. [☁️ Future AWS Architecture & Service Selection](#%EF%B8%8F-future-aws-architecture--service-selection)
   - [AWS Infrastructure Architecture Diagram](#aws-infrastructure-architecture-diagram)
   - [Server & Compute Selection](#server--compute-selection)
   - [Database Selection](#database-selection)
   - [Media Storage & CDN Selection](#media-storage--cdn-selection)
   - [DNS, SSL & Security Selection](#dns-ssl--security-selection)
   - [Serverless Jobs & Email Selection](#serverless-jobs--email-selection)
4. [🛠️ Step-by-Step AWS Migration & Deployment Guide](#%EF%B8%8F-step-by-step-aws-migration--deployment-guide)
   - [Phase 1: Database Migration (Supabase → AWS RDS PostgreSQL)](#phase-1-database-migration-supabase--aws-rds-postgresql)
   - [Phase 2: Storage Migration (Cloudflare R2 → AWS S3)](#phase-2-storage-migration-cloudflare-r2--aws-s3)
   - [Phase 3: Application Containerization (Docker)](#phase-3-application-containerization-docker)
   - [Phase 4: AWS Infrastructure Provisioning (ECS, VPC, ALB)](#phase-4-aws-infrastructure-provisioning-ecs-vpc-alb)
   - [Phase 5: Automated CI/CD Pipeline (GitHub Actions)](#phase-5-automated-cicd-pipeline-github-actions)
   - [Phase 6: Cutover & DNS Switch](#phase-6-cutover--dns-switch)
5. [💰 Estimated AWS Monthly Cost Breakdown](#-estimated-aws-monthly-cost-breakdown)
6. [🔒 Security & Disaster Recovery Best Practices](#-security--disaster-recovery-best-practices)

---

## 📌 Executive Overview

**Magnevents** is a high-performance live artist booking platform built for securing acoustic singers, Sufi rock bands, anchors, and luxury live musical talent. 

The current system relies on a dual-frontend Next.js architecture connected to a **Supabase PostgreSQL** database and **Cloudflare R2 / S3-compatible** media storage. 

As the platform scales to support high traffic volume across multiple Indian cities, migrating to **Amazon Web Services (AWS)** will provide:
- High availability with Multi-AZ redundancy.
- Infinite scalability for artist high-resolution video reels and photos.
- Automated CI/CD pipelines with zero-downtime rolling updates.
- Enhanced security, Web Application Firewall (WAF) protection, and enterprise compliance.

---

## 🏛️ Current System Data & Architecture Deep-Dive

### Workspace Structure

The project is structured into two independent Next.js applications sharing a unified database model and helper utilities:

| Component | Path | Framework / Tech Stack | Primary Function | Local Port |
| :--- | :--- | :--- | :--- | :--- |
| **Booking Platform** | [`booking-platform/`](file:///c:/Users/avani/Desktop/magnivents/booking-platform) | Next.js 14 (App Router, JS), Vanilla CSS (Glassmorphism), Lucide React, Framer Motion | Public client-facing portal, artist discovery, booking checkout, city landing pages, blogs | `3000` |
| **Admin Portal** | [`admin-portal/`](file:///c:/Users/avani/Desktop/magnivents/admin-portal) | Next.js 15 (App Router, TS), TailwindCSS, shadcn/ui, Radix UI, Recharts | CMS for managing artists, video reels, booking requests, SEO city generator, pricing | `9002` |
| **Central Database** | [`database/`](file:///c:/Users/avani/Desktop/magnivents/database) | Supabase JS/TS SDK, PostgreSQL SQL Migrations | Centralized connection singletons (`supabase-admin.ts`), schema definitions | N/A |
| **Helpers** | [`helpers/`](file:///c:/Users/avani/Desktop/magnivents/helpers) | Node.js utilities & scripts | Data uploaders, retry scripts, asset processors | N/A |

---

### Complete Database Schema Data Dictionary

The platform uses PostgreSQL (via Supabase). Below are the core tables, structures, and data relationships:

#### 1. `public.artists`
Stores detailed artist profiles, performance genres, pricing metrics, and media links.
- `id` (UUID, Primary Key): Unique artist identifier.
- `name` (TEXT): Stage name or artist name.
- `slug` (VARCHAR 255, Unique): URL-friendly slug (e.g., `/artist/sufi-rock-band-delhi`).
- `category` (TEXT): Primary performance category (Acoustic, Sufi Rock, Band, Anchor).
- `price` / `price_range` (TEXT/NUMERIC): Base booking fee.
- `rating` (NUMERIC): Average user rating (e.g., `4.9`).
- `reviews_count` (INTEGER): Number of completed performance reviews.
- `location` / `city` (TEXT): Home city/region.
- `image_url` / `featured_image` (TEXT): High-resolution cover photo URL (stored on S3/R2).
- `bio` / `description` (TEXT): Detailed artist bio and performance history.
- `status` (TEXT): `active`, `pending`, `archived`.
- `created_at`, `updated_at` (TIMESTAMPTZ): Audit timestamps.

#### 2. `public.categories`
Musical and performance event categories.
- `id` (UUID, Primary Key): Category ID.
- `name` (TEXT): Category display title (e.g., "Acoustic Soloists").
- `slug` (TEXT, Unique): URL path representation.
- `icon` / `banner_url` (TEXT): Icon name or header image URL.

#### 3. `public.booking_requests` / `requests`
Client booking inquiries and lead submissions.
- `id` (UUID, Primary Key): Booking reference code.
- `client_name` (TEXT): Client full name.
- `client_email` (TEXT): Contact email.
- `client_phone` (TEXT): Phone number for WhatsApp/Call follow-up.
- `event_date` (DATE): Requested event date.
- `event_location` (TEXT): Venue city & full address.
- `artist_id` (UUID, Foreign Key → `artists.id`): Selected artist (optional for general inquiry).
- `budget` (NUMERIC): Client budget range.
- `status` (TEXT): `new`, `contacted`, `confirmed`, `cancelled`.
- `created_at` (TIMESTAMPTZ): Submission time.

#### 4. `public.service_videos` / `reels`
Video gallery playlists and high-definition performance media.
- `id` (UUID, Primary Key): Video entry ID.
- `title` (TEXT): Performance title.
- `video_url` (TEXT): Stream URL (Cloudflare R2 / AWS S3 / YouTube embed).
- `thumbnail_url` (TEXT): Video poster image.
- `category` (TEXT): Matching category tag.
- `is_featured` (BOOLEAN): Highlighted on homepage reels section.

#### 5. `public.seo_regions`, `seo_cities`, `seo_blogs`
Programmatic SEO Engine for location-based landing pages across India.
- **`seo_regions`**: `id`, `name`, `slug` (e.g., "North India").
- **`seo_cities`**: `id`, `region_id` (FK), `name`, `slug`, `seo_title`, `meta_description`, `h1`, `content`, `is_active`.
- **`seo_blogs`**: `id`, `city_id` (FK), `title`, `slug`, `seo_title`, `meta_description`, `content`, `featured_image_url`, `status` (`draft`/`published`), `seo_score`, `published_at`.

#### 6. `public.analytics`
Visitor behavior & traffic metrics.
- `id` (UUID, Primary Key): Event ID.
- `path` (TEXT): Page route visited (e.g., `/city/delhi/blog/top-acoustic-singers`).
- `type` (TEXT): Event type (`pageview`, `click`, `booking_submit`).
- `user_agent` (TEXT): Browser user agent string.
- `ip_hash` (TEXT): Anonymized IP hash for privacy compliance.
- `session_id` (TEXT): Client session token.
- `details` (JSONB): Dynamic event payload.

#### 7. `public.testimonials` & `public.pricing`
- **`testimonials`**: Client reviews, event photos, star ratings.
- **`pricing`**: Predefined packages (e.g., "House Party Package", "Wedding Grandeur").

---

### Media & Storage Architecture

- **Current Implementation:** Media objects (artist profile pictures, video reels, gallery photos) are managed via S3-compatible Cloudflare R2 object storage using `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner`.
- **Presigned Upload Flow:** The Admin Portal requests a presigned PUT URL from `/api/upload-url`, uploads the asset directly from the browser to storage, and saves the asset's public URL into Supabase PostgreSQL.

---

### Environment Variables Matrix

Both frontend portals rely on the following environment variable structure:

```env
# Database Credentials
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-id>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...

# Super Admin Access
NEXT_PUBLIC_SUPER_ADMIN_EMAIL=admin@magnevents.in
NEXT_PUBLIC_SUPER_ADMIN_PASSWORD=<secure-password>
NEXT_PUBLIC_SUPER_ADMIN_ID=<uuid>

# S3 / Object Storage Credentials (Cloudflare R2 or AWS S3)
R2_ACCESS_KEY_ID=<access-key-id>
R2_SECRET_ACCESS_KEY=<secret-access-key>
R2_S3_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
R2_BUCKET_NAME=magnevents-media
NEXT_PUBLIC_R2_PUBLIC_URL=https://cdn.magnevents.in

# Email SMTP Delivery
EMAIL_USER=notifications@magnevents.in
EMAIL_PASS=<smtp-password>

# Analytics & Integrations
EXIMS_API_KEY=<exims-key>
```

---

## ☁️ Future AWS Architecture & Service Selection

When transitioning to AWS, we will replace Supabase and Cloudflare R2 with native, fully managed AWS services designed for 99.99% uptime, auto-scaling, and lower latency.

### AWS Infrastructure Architecture Diagram

```mermaid
flowchart TD
    subgraph Users ["🌐 Clients & Admin Web Browsers"]
        ClientUser["Client Visitor (Desktop / Mobile)"]
        AdminUser["Administrator (CMS Portal)"]
    end

    subgraph Edge ["⚡ Edge & Security Layer"]
        Route53["AWS Route 53 (DNS)"]
        WAF["AWS WAF (Web App Firewall)"]
        CloudFront["AWS CloudFront (CDN Network)"]
        ACM["AWS Certificate Manager (SSL/TLS)"]
    end

    subgraph Network ["🛡️ AWS VPC (Virtual Private Cloud)"]
        subgraph PublicSubnet ["Public Subnet (Multi-AZ)"]
            ALB["AWS Application Load Balancer (ALB)"]
        end

        subgraph PrivateSubnet ["Private Subnet (App Layer - ECS Fargate)"]
            ECS_Booking["ECS Task: booking-platform (Port 3000)"]
            ECS_Admin["ECS Task: admin-portal (Port 9002)"]
        end

        subgraph DataSubnet ["Isolated Data Subnet (Database Layer)"]
            RDS_Master["AWS RDS PostgreSQL (Primary)"]
            RDS_Replica["AWS RDS PostgreSQL (Read Replica)"]
        end
    end

    subgraph Storage ["📦 Asset & Storage Layer"]
        S3_Bucket["AWS S3 Bucket (magnevents-media-prod)"]
    end

    subgraph Services ["✉️ Serverless & Notification Services"]
        Lambda["AWS Lambda (Cron & Background Tasks)"]
        EventBridge["Amazon EventBridge (Scheduler)"]
        SES["AWS SES (Simple Email Service)"]
        SecretsManager["AWS Secrets Manager"]
        CloudWatch["AWS CloudWatch (Logs & Metrics)"]
    end

    %% Flow Connections
    ClientUser -->|DNS Lookup| Route53
    AdminUser -->|DNS Lookup| Route53
    Route53 --> WAF
    WAF --> CloudFront
    CloudFront -->|Dynamic Requests| ALB
    CloudFront -->|Static Media & Assets| S3_Bucket

    ALB -->|/ -> Client App| ECS_Booking
    ALB -->|/dashboard -> Admin CMS| ECS_Admin

    ECS_Booking -->|Read / Write Queries| RDS_Master
    ECS_Booking -->|Read Heavy Queries| RDS_Replica
    ECS_Admin -->|Read / Write Queries| RDS_Master
    ECS_Admin -->|Upload Media| S3_Bucket
    ECS_Admin -->|Fetch Secrets| SecretsManager

    EventBridge -->|Trigger Daily Cron| Lambda
    Lambda -->|Execute Analytics Cron| ECS_Booking
    ECS_Booking -->|Transactional Emails| SES

    ECS_Booking -.->|Logs & Metrics| CloudWatch
    ECS_Admin -.->|Logs & Metrics| CloudWatch
```

---

### Server & Compute Selection

To run both Next.js applications (`booking-platform` and `admin-portal`), we compare the top 3 AWS options:

| AWS Service | Description | Why Recommended / Verdict |
| :--- | :--- | :--- |
| **AWS ECS (Elastic Container Service) on Fargate** *(RECOMMENDED)* | Serverless container execution for Dockerized Next.js apps. Automatically scales tasks based on CPU/RAM without managing EC2 instances. | **BEST CHOICE for Production.** Provides isolation, zero OS patch management, effortless zero-downtime rolling updates, and scales up instantly during high-traffic booking events. |
| **AWS EC2 (Elastic Compute Cloud) with Nginx + PM2** | Virtual Machines (e.g. `t4g.medium` ARM64 instances) running Ubuntu with PM2 and Nginx reverse proxy. | **Cost-effective for low traffic stage**, but requires manual OS updates, security patching, and complex manual autoscaling setup. |
| **AWS App Runner** | Managed web app service for containerized code directly connected to GitHub. | Great for quick setups, but lacks advanced routing customization across dual apps behind a single custom domain. |

#### 🎯 Recommended Compute Setup:
- **Service:** **AWS ECS with AWS Fargate**
- **Instance Architecture:** ARM64 (AWS Graviton2/Graviton3) for **20% lower cost and higher performance** with Node.js.
- **Sizing:**
  - `booking-platform`: 0.5 vCPU, 1 GB RAM (Scale: 2 to 10 Tasks)
  - `admin-portal`: 0.25 vCPU, 0.5 GB RAM (Scale: 1 to 3 Tasks)

---

### Database Selection

Replacing Supabase PostgreSQL with native AWS Managed Database:

| AWS Service | Configuration | Key Benefits |
| :--- | :--- | :--- |
| **AWS RDS for PostgreSQL** *(RECOMMENDED)* | PostgreSQL 16 (Multi-AZ Deployment) | Fully compatible with standard Supabase SQL migrations. Automatic failover across 2 Availability Zones, daily automated snapshots, point-in-time recovery. |
| **AWS Aurora PostgreSQL Serverless v2** | Serverless Auto-scaling Postgres | Scales database compute (ACUs) up and down automatically. Ideal if traffic is highly unpredictable. |

#### 🎯 Recommended Database Setup:
- **Engine:** **AWS RDS for PostgreSQL 16**
- **Instance Class:** `db.t4g.medium` (2 vCPU, 4 GB RAM) for Primary + optional Read Replica for public search traffic.
- **Storage:** 50 GB gp3 SSD with auto-scaling up to 500 GB.

---

### Media Storage & CDN Selection

Replacing Cloudflare R2 with AWS native storage:

- **Object Storage:** **AWS S3 (Simple Storage Service)**
  - Bucket name: `magnevents-media-prod`
  - Block Public Access: Enabled (Bucket stays private).
  - Access Protocol: Origin Access Control (OAC) to strictly allow read traffic via CloudFront.
- **Content Delivery Network (CDN):** **AWS CloudFront**
  - Caching edge locations across India (Mumbai, Delhi, Bengaluru, Chennai, Hyderabad, Kolkata).
  - SSL Termination using **AWS Certificate Manager (ACM)**.
  - Next.js Image Optimization caching support.

---

### DNS, SSL & Security Selection

- **DNS Management:** **AWS Route 53** (Manages `magnevents.in` domain records).
- **SSL/TLS Certificates:** **AWS Certificate Manager (ACM)** (Free SSL certificates auto-renewed annually).
- **Security & Firewall:** **AWS WAF (Web Application Firewall)**:
  - Protects Next.js API routes against SQL injection, cross-site scripting (XSS), rate limits bot scraping, and DDoS attempts.
- **Secrets Management:** **AWS Secrets Manager**:
  - Securely stores DB passwords, API tokens, and JWT secrets.

---

### Serverless Jobs & Email Selection

- **Scheduled Crons:** **Amazon EventBridge** + **AWS Lambda**:
  - Replaces `/api/cron/daily-report` endpoint invocation to generate daily lead summaries automatically.
- **Email Delivery:** **AWS SES (Simple Email Service)**:
  - Replaces generic SMTP with high-deliverability transactional email service for client booking receipts and admin alerts.

---

## 🛠️ Step-by-Step AWS Migration & Deployment Guide

Follow this sequential execution plan to migrate Magnevents to AWS with zero downtime.

---

### Phase 1: Database Migration (Supabase → AWS RDS PostgreSQL)

#### Step 1.1: Provision AWS RDS PostgreSQL Instance
1. Open **AWS Console** → **RDS** → **Create Database**.
2. Select **PostgreSQL 16.x**, Standard Create.
3. Templates: **Production**.
4. Availability & durability: **Multi-AZ DB instance** (High Availability).
5. DB instance identifier: `magnevents-db-prod`.
6. Master username: `magnevents_admin`.
7. Master password: Generate secure password (save to Secrets Manager).
8. DB instance class: `db.t4g.medium`.
9. Storage type: `gp3`, Allocated storage: `50 GB`.
10. VPC: Select your production VPC, **Private DB Subnet Group**.
11. Public access: **No** (Database should NEVER be publicly exposed).

#### Step 1.2: Export Schema and Data from Supabase
Using `pg_dump` on your local terminal:

```bash
# 1. Dump database schema and data from Supabase
pg_dump --dbname="postgresql://postgres:[YOUR-SUPABASE-PASSWORD]@db.[YOUR-SUPABASE-PROJECT].supabase.co:5432/postgres" \
  --clean --if-exists --quote-all-identifiers \
  --file="magnevents_supabase_backup.sql"
```

#### Step 1.3: Import Data into AWS RDS PostgreSQL
Set up a temporary Bastion host or AWS VPN connection inside the VPC to access RDS, then run:

```bash
# 2. Restore complete database schema and records to AWS RDS
psql -h magnevents-db-prod.c123456789.ap-south-1.rds.amazonaws.com \
  -U magnevents_admin \
  -d postgres \
  -f magnevents_supabase_backup.sql
```

#### Step 1.4: Execute Supplementary SQL Migrations
Ensure all table extensions and indexes are populated by executing the migration files located in [`database/migrations/`](file:///c:/Users/avani/Desktop/magnivents/database/migrations):
- `seo_engine_tables.sql`
- `analytics_setup.sql`
- `add_artist_slugs.sql`

---

### Phase 2: Storage Migration (Cloudflare R2 → AWS S3)

#### Step 2.1: Create AWS S3 Bucket
1. Go to **AWS S3 Console** → **Create bucket**.
2. Bucket name: `magnevents-media-prod`.
3. Region: `ap-south-1` (Mumbai).
4. Block *all* public access: **Checked** (ON).
5. Bucket Versioning: **Enable**.

#### Step 2.2: Sync Media Assets from R2 to S3
Use the AWS CLI or `rclone` to transfer all existing artist images and service video thumbnails:

```bash
# Sync files directly between R2 and AWS S3
aws s3 sync s3://magnevents-media s3://magnevents-media-prod \
  --endpoint-url https://<account-id>.r2.cloudflarestorage.com
```

#### Step 2.3: Update Application S3 Code
In `admin-portal` and `booking-platform`, update the S3 client configuration to target AWS native endpoints:

```typescript
// Updated AWS S3 Client Config
import { S3Client } from "@aws-sdk/client-s3";

export const s3Client = new S3Client({
  region: process.env.AWS_REGION || "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});
```

---

### Phase 3: Application Containerization (Docker)

To deploy both Next.js applications onto AWS ECS Fargate, create standard production Dockerfiles for each service:

#### 1. Dockerfile for Booking Platform (`booking-platform/Dockerfile`)

Create [`booking-platform/Dockerfile`](file:///c:/Users/avani/Desktop/magnivents/booking-platform/Dockerfile):

```dockerfile
# Step 1: Dependencies Stage
FROM node:18-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Step 2: Builder Stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Step 3: Production Runner Stage
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
```

#### 2. Dockerfile for Admin Portal (`admin-portal/Dockerfile`)

Create [`admin-portal/Dockerfile`](file:///c:/Users/avani/Desktop/magnivents/admin-portal/Dockerfile):

```dockerfile
# Step 1: Dependencies Stage
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Step 2: Builder Stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Step 3: Production Runner Stage
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
ENV PORT 9002
ENV HOSTNAME "0.0.0.0"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 9002

CMD ["node", "server.js"]
```

> **Note for Next.js Standalone Output:** Ensure `next.config.js` in both applications includes:
> ```js
> module.exports = {
>   output: 'standalone',
> };
> ```

---

### Phase 4: AWS Infrastructure Provisioning (ECS, VPC, ALB)

#### Step 4.1: Create Amazon ECR Repositories
1. Open **AWS ECR** → **Create repository**.
2. Create repository `magnevents-booking-platform`.
3. Create repository `magnevents-admin-portal`.

Push images:
```bash
# Authenticate Docker to AWS ECR
aws ecr get-login-password --region ap-south-1 | docker login --username AWS --password-stdin <aws-account-id>.dkr.ecr.ap-south-1.amazonaws.com

# Build and Push Booking Platform
docker build -t magnevents-booking-platform ./booking-platform
docker tag magnevents-booking-platform:latest <aws-account-id>.dkr.ecr.ap-south-1.amazonaws.com/magnevents-booking-platform:latest
docker push <aws-account-id>.dkr.ecr.ap-south-1.amazonaws.com/magnevents-booking-platform:latest

# Build and Push Admin Portal
docker build -t magnevents-admin-portal ./admin-portal
docker tag magnevents-admin-portal:latest <aws-account-id>.dkr.ecr.ap-south-1.amazonaws.com/magnevents-admin-portal:latest
docker push <aws-account-id>.dkr.ecr.ap-south-1.amazonaws.com/magnevents-admin-portal:latest
```

#### Step 4.2: Application Load Balancer (ALB) Setup
1. Create an **Application Load Balancer** `magnevents-alb` in Public Subnets across 2 Availability Zones.
2. Listener 443 (HTTPS) with SSL certificate from ACM.
3. Target Group 1: `tg-booking-platform` (Port 3000, Health check path `/api/admin/health` or `/`).
4. Target Group 2: `tg-admin-portal` (Port 9002, Health check path `/api/admin/health`).
5. Host/Path Routing Rules:
   - `magnevents.in/*` → Forward to `tg-booking-platform`
   - `admin.magnevents.in/*` → Forward to `tg-admin-portal`

#### Step 4.3: Create ECS Fargate Services
1. Go to **AWS ECS** → **Create Cluster**: Name: `magnevents-cluster` (Fargate).
2. Create Task Definition for `booking-platform`:
   - CPU: `0.5 vCPU`, Memory: `1 GB`.
   - Environment variables loaded securely from AWS Secrets Manager.
   - Container Port: `3000`.
3. Create Task Definition for `admin-portal`:
   - CPU: `0.25 vCPU`, Memory: `0.5 GB`.
   - Container Port: `9002`.
4. Launch ECS Services connected to ALB Target Groups with auto-scaling policy (Target CPU Utilization 70%).

---

### Phase 5: Automated CI/CD Pipeline (GitHub Actions)

Create `.github/workflows/deploy-aws.yml` in the root repository to automatically build and deploy changes when pushing to `main`:

```yaml
name: Deploy to AWS ECS

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v3

      - name: Configure AWS Credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ap-south-1

      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v1

      - name: Build, Tag, and Push Booking Platform Image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build -t $ECR_REGISTRY/magnevents-booking-platform:$IMAGE_TAG ./booking-platform
          docker push $ECR_REGISTRY/magnevents-booking-platform:$IMAGE_TAG
          docker tag $ECR_REGISTRY/magnevents-booking-platform:$IMAGE_TAG $ECR_REGISTRY/magnevents-booking-platform:latest
          docker push $ECR_REGISTRY/magnevents-booking-platform:latest

      - name: Build, Tag, and Push Admin Portal Image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build -t $ECR_REGISTRY/magnevents-admin-portal:$IMAGE_TAG ./admin-portal
          docker push $ECR_REGISTRY/magnevents-admin-portal:$IMAGE_TAG
          docker tag $ECR_REGISTRY/magnevents-admin-portal:$IMAGE_TAG $ECR_REGISTRY/magnevents-admin-portal:latest
          docker push $ECR_REGISTRY/magnevents-admin-portal:latest

      - name: Deploy Booking Platform to ECS
        run: |
          aws ecs update-service --cluster magnevents-cluster --service booking-platform-service --force-new-deployment

      - name: Deploy Admin Portal to ECS
        run: |
          aws ecs update-service --cluster magnevents-cluster --service admin-portal-service --force-new-deployment
```

---

### Phase 6: Cutover & DNS Switch

1. Lower DNS TTL in Route 53 to 60 seconds 24 hours prior to cutover.
2. Perform a final delta sync of Supabase Postgres to AWS RDS Postgres.
3. Update Route 53 A-Records:
   - `magnevents.in` → Alias to CloudFront Distribution / ALB.
   - `admin.magnevents.in` → Alias to ALB.
4. Verify HTTP to HTTPS redirection and SSL Certificate validity.
5. Perform end-to-end testing (Artist search, SEO city pages, photo uploads, booking inquiry submission).

---

## 💰 Estimated AWS Monthly Cost Breakdown

Here is an estimated monthly expenditure model based on **Mumbai (`ap-south-1`) region** pricing for starter to medium traffic:

| AWS Service | Configuration | Estimated Monthly Cost (USD) | Estimated Monthly Cost (INR) |
| :--- | :--- | :--- | :--- |
| **AWS ECS Fargate** | 2 Tasks Client (0.5 vCPU, 1GB RAM) + 1 Task Admin (0.25 vCPU, 0.5GB RAM) | \$32.00 | ₹2,650 |
| **AWS RDS PostgreSQL** | `db.t4g.medium` Multi-AZ, 50 GB Storage | \$68.00 | ₹5,640 |
| **AWS Application Load Balancer** | 1 ALB + LCU traffic metrics | \$22.00 | ₹1,825 |
| **AWS S3 Storage** | 100 GB Asset Storage + Data Transfer | \$3.50 | ₹290 |
| **AWS CloudFront CDN** | 500 GB Edge Data Transfer | \$12.00 | ₹995 |
| **AWS Route 53 & ACM** | Hosted Zone + SSL Certificates | \$0.50 | ₹42 |
| **AWS WAF** | Web Application Firewall Base Rule Set | \$10.00 | ₹830 |
| **AWS Secrets Manager & CloudWatch** | Logs, Metrics & Key Rotation | \$5.00 | ₹415 |
| **Total Estimated Monthly Cost** | **Fully Redundant AWS Production Environment** | **~\$153.00 / month** | **~₹12,687 / month** |

> 💡 **Cost Optimization Tip:** Enabling **AWS Compute Savings Plans** (1-year or 3-year commitment) reduces ECS Fargate compute costs by **up to 30-40%**.

---

## 🔒 Security & Disaster Recovery Best Practices

1. **VPC Isolation:** Keep RDS database instances strictly in Private Isolation Subnets. No public IP address must ever be assigned to the database.
2. **Secrets Encryption:** Store database hostnames, credentials, and API keys inside **AWS Secrets Manager**. Never commit `.env` files into Git.
3. **Automated RDS Backups:** Retain point-in-time automated database snapshots for **14 days** with Multi-AZ failover enabled.
4. **S3 Versioning & Object Lock:** Enable bucket versioning and MFA delete to prevent accidental deletion of critical artist media assets.
5. **DDoS & Scraping Protection:** Enable AWS WAF rate-limiting rules (e.g. limit requests per IP to 200 per 5 minutes) to protect Next.js API endpoints from malicious bot scraping.

---

*Document created for **Magnevents Architecture Engineering Team**. Maintained in project repository root [`FUTURE_README.md`](file:///c:/Users/avani/Desktop/magnivents/FUTURE_README.md).*
