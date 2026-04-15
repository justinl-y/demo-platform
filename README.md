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
    Client["🌐 Frontend<br/>demo-stage.discovered-check.ca"]

    subgraph AWS["☁️ AWS"]
        CF["⚙️ CloudFront<br/>SSL | WAF<br/>:443 → :80"]
        subgraph VPC["🔒 VPC"]
            subgraph EB["🚀 Elastic Beanstalk"]
                ELB["⚖️ Elastic Load Balancer<br/>:80 → :6661"]
                subgraph DC["📦 EC2 / 🐳 Docker Compose"]
                    Nginx["🔀 nginx-proxy<br/>:6661 → :80"]
                    Nginx -->|proxy_pass :80 → :8000| API
                    API["⚡ Fastify API<br/>:8000"]
                end
            end
            RDS[("🗄️ RDS PostgreSQL<br/>stage / prod")]
        end
        SM["🔑 Secrets Manager<br/> stage / prod"]
        CW["📋 CloudWatch Logs<br/> stage / prod"]
        SSO["🔐 AWS SSO<br/>local (stage)"]
    end

    Sentry["👁️ Sentry<br/>Errors | Traces<br/>local / stage / prod"]

    Client -->|"HTTPS"| CF
    CF -->|"HTTP"| ELB
    ELB -->| | Nginx
    API -->|"observation"| CW
    API -->|"(startup only)"| SM
    API -->|"SSL + pool"| RDS
    API -->|"instrumentation"| Sentry
    SSO -.->|"dev credentials"| DC

    classDef aws fill:#FF9900,stroke:#c47600,color:#000
    classDef app fill:#4A90D9,stroke:#2c6fad,color:#fff
    classDef external fill:#6C4FBB,stroke:#4a3485,color:#fff
    classDef client fill:#2ECC71,stroke:#1fa355,color:#000
    classDef db fill:#E74C3C,stroke:#b03a2e,color:#fff

    class Client client
    class Nginx,API app
    class RDS db
    class SM,CW,SSO,ELB,CF aws
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

- 🔧 Configurable API environments (local -> remote and test)
- ✅ Integration testing with **Vitest**
- 👁️ Observability: Sentry errors + tracing
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
- 🎨 UI/UX polish and sample data
- 🏗️ Infrastructure as Code (Terraform/CDK)  
- 🚢 Migrate to ECS/EKS

---

## 🏗️ Monorepo Structure (Planned)

```text
/app-demo # Frontend application
/api-demo # Backend API service
/shared   # Shared libraries & utilities
