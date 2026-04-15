# 🚀 Demo Platform

Demo Platform is a **concept project** showcasing a distributed, full stack web application using type-safe JavaScript and built within a platform **monorepo**.

The goal of this project is to demonstrate modern **full-stack web development practices**, from frontend and backend to cloud infrastructure and developer experience.  

---

## 🖥️ Frontend Application

*Coming soon!*  
This section will include a modern frontend application (e.g., **React/Next.js**) integrated with the backend API.  

---

## ⚙️ Backend API

```mermaid
flowchart TD
    Client["🌐 Frontend\ndemo-stage.discovered-check.ca"]

    subgraph AWS["☁️ AWS — VPC"]
        subgraph EB["🚀 Elastic Beanstalk / EC2"]
            subgraph DC["🐳 Docker Compose"]
                Nginx["🔀 nginx-proxy\n:6661 → :80"]
                Nginx -->|proxy_pass :80 → :8000| API
                API["⚡ Fastify API\n:8000"]
            end
        end

        CW["📋 CloudWatch Logs\n · stage / prod"]
        RDS[("🗄️ RDS PostgreSQL\nSSL\n · stage / prod")]
        SM["🔑 Secrets Manager\n · stage / prod"]
        SSO["🔐 AWS SSO\ndev local access\n · stage"]
    end

    Sentry["🪲 Sentry\ntraces \nerrors"]

    Client -->|"⚙️ CloudFront HTTPS → HTTP"| Nginx
    DC -->|"awslogs driver"| CW
    API -->|"BatchGetSecretValue\n(startup only)"| SM
    API -->|"SSL + pool"| RDS
    API -->|"errors + traces"| Sentry
    SSO -.->|"credentials"| EB

    classDef aws fill:#FF9900,stroke:#c47600,color:#000
    classDef app fill:#4A90D9,stroke:#2c6fad,color:#fff
    classDef external fill:#6C4FBB,stroke:#4a3485,color:#fff
    classDef client fill:#2ECC71,stroke:#1fa355,color:#000
    classDef db fill:#E74C3C,stroke:#b03a2e,color:#fff

    class Client client
    class Nginx,API app
    class RDS db
    class SM,CW,SSO aws
    class Sentry external
```

### 🏛️ Core Features

- 🐳 Docker containerization
- 🔗 RESTful API design  
- 🟢 Node.js + TypeScript  
- ⚡ Fastify framework  
- 📄 OpenAPI (JSON schema + docs)  
- 🗄️ PostgreSQL database

### 🧪 Developer Experience

- 🔧 Configurable API environments (local and remote)
- ✅ Integration testing with **Vitest**
- 📊 Observability: Sentry errors + tracing
- 🤖 GitHub action CI/CD

### ☁️ Cloud Infrastructure (AWS)

- 🗄️ RDS (PostgreSQL)
- ⚙️ CloudFront
- 🚀 Elastic Beanstalk / EC2 for deployment
- 🔑 Secrets Manager
- 📋 Cloudwatch for logging
- 🔐 AWS SSO for authentication

[Read more here ...](/api-demo/README.md)

---

## 📌 Future Improvements

- 🖥️ Frontend implementation  
- 🏗️ Infrastructure as Code (Terraform/CDK)  
- 🎨 UI/UX polish and sample data  

---

## 🏗️ Monorepo Structure (Planned)

```text
/app-demo # Frontend application
/api-demo # Backend API service
/shared   # Shared libraries & utilities
