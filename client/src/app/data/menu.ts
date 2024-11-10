export const tools = [
  {
    name: "Virtual Machine (VM)",
    info: `
A virtual machine (VM) is a software-based emulation of a physical computer. It runs an operating system and applications just like a physical machine, but it is hosted on a physical server.

For example, you can use a VM to:
- Run multiple operating systems on a single server
- Test software in a controlled environment
- Host applications in the cloud
    `,
    children: {
      "aws": [
        {
          name: "EC2",
          info: `
Elastic Compute Cloud (EC2) provides virtual servers in the cloud. It is used for scalable computing capacity, making it ideal for running applications that require a lot of computing power.

For example, you can use EC2 to:
- Host a website
- Run a batch processing job
- Deploy a machine learning model
          `,
          args: [
            {
              name: "Include Docker setup?",
              type: "boolean",
              key: "--docker",
            },
            {
              name: "Include security group configurations?",
              type: "boolean",
              key: "--security",
            },
            {
              name: "Include VPC and networking configurations?",
              type: "boolean",
              key: "--vpc",
            },
            {
              name: "Include Load Balancer configuration?",
              type: "boolean",
              key: "--load-balancer",
            },
          ],
        },
      ],
      "azure": [
        {
          name: "Virtual Machines",
          info: `
Virtual Servers in the Cloud (Virtual Machines) are used for running applications and workloads in a virtualized environment. They are ideal for development, testing, and production workloads.

For example, you can use Virtual Machines to:
- Host a web server
- Run a database
- Deploy a custom application
          `,
        },
      ],
      "gcp": [
        {
          name: "Compute Engine",
          info: `
Virtual Servers in the Cloud (Compute Engine) are used for running large-scale workloads on virtual machines. They are ideal for applications that require high performance and scalability.

For example, you can use Compute Engine to:
- Host a high-traffic website
- Run a large-scale data processing job
- Deploy a machine learning model
          `,
        },
      ],
    },
  },
  {
    name: "Database",
    info: `
A database is an organized collection of data, typically stored and accessed electronically from a computer system. It is used to store, manage, and retrieve data efficiently. There are different types of databases, such as relational, NoSQL, and in-memory databases. Each type has its own strengths and use cases. For example, you can use a database to:
- Store customer information
- Manage inventory
- Analyze business data
    `,
    children: {
      "aws": [
        {
          name: "S3",
          info: `
Simple Storage Service (S3) offers scalable object storage, allowing you to store and retrieve any amount of data at any time. It is ideal for backup, archiving, and big data analytics.

For example, you can use S3 to:
  - Store website assets
  - Create data lakes for analytics
  - Archive important documents
        `,
        type: "string",
        args: [
          {
            name: "Bucket name",
            type: "string",
            key: "--bucket-name",
          },
          {
            name: "Enable versioning?",
            type: "boolean",
            key: "--versioning",
          },
          {
            name: "Set ACL",
            type: "string",
            key: "--acl",
          },
          {
            name: "Include lifecycle policy?",
            type: "boolean",
            key: "--lifecycle",
          },
        ],
      },
      {
        name: "DynamoDB",
        info: `
  Managed NoSQL Database Service (DynamoDB) provides fast and predictable performance with seamless scalability. It is ideal for applications that require consistent, single-digit millisecond latency at any scale.

  For instance, you can use DynamoDB to:
  - Build a high-traffic web application
  - Manage user profiles
  - Store session data
        `,
        args: [
          {
            name: "Table name",
            type: "string",
            key: "--table-name",
          },
          {
            name: "Hash key attribute name",
            type: "string",
            key: "--hash-key",
          },
          {
            name: "Hash key type (S, N, B)",
            type: "string",
            key: "--hash-key-type",
          },
          {
            name: "Range key attribute name",
            type: "string",
            key: "--range-key",
          },
          {
            name: "Range key type (S, N, B)",
            type: "string",
            key: "--range-key-type",
          },
          {
            name: "Billing mode",
            type: "string",
            key: "--billing-mode",
          },
          {
            name: "Enable DynamoDB streams?",
            type: "boolean",
            key: "--stream-enabled",
          },
          {
            name: "Stream view type",
            type: "string",
            key: "--stream-view-type",
          },
          {
            name: "Prevent table destruction?",
            type: "boolean",
            key: "--lifecycle-prevent-destroy",
          },
        ],
      },
      {
        name: "RDS",
        info: `
  Relational Database Service (RDS) makes it easy to set up, operate, and scale a relational database in the cloud. It provides cost-efficient and resizable capacity while automating time-consuming administration tasks.

  For example, you can use RDS to:
  - Host a MySQL database
  - Run a PostgreSQL database
  - Manage an Oracle database
        `,
      },
      {
        name: "CloudFront",
        info: `
  Content Delivery Network (CloudFront) is used to deliver your content with low latency and high transfer speeds. It is ideal for distributing static and dynamic web content.

  For example, you can use CloudFront to:
  - Deliver your website
  - Stream video content
  - Serve static files
        `,
      },
      {
        name: "Lambda",
        info: `
  Serverless Compute Service (Lambda) lets you run code without provisioning or managing servers. It is ideal for building event-driven applications.

  For example, you can use Lambda to:
  - Run code in response to HTTP requests
  - Process files uploaded to S3
  - Respond to changes in a DynamoDB table
        `,
      },
      {
        name: "Route 53",
        info: `
  Scalable Domain Name System (Route 53) is used to route end users to Internet applications. It is ideal for managing DNS records and routing traffic globally.

  For example, you can use Route 53 to:
  - Manage DNS records for your domain
  - Route traffic to your web application
  - Implement failover routing
        `,
      },
      ],
      "azure": [
      {
        name: "Blob Storage",
        info: `
  Scalable Object Storage (Blob Storage) is used for storing large amounts of unstructured data, such as text or binary data. It is ideal for serving images or documents directly to a browser.

  For example, you can use Blob Storage to:
  - Store backups
  - Serve media files
  - Archive data
        `,
      },
      {
        name: "CosmosDB",
        info: `
  Managed NoSQL Database Service (CosmosDB) provides a globally distributed, multi-model database service. It is ideal for building highly responsive and highly available applications.

  For instance, you can use CosmosDB to:
  - Create a globally distributed application
  - Manage user data
  - Store IoT data
        `,
      },
      ],
      "gcp": [
      {
        name: "Cloud Storage",
        info: `
  Scalable Object Storage (Cloud Storage) is used for storing and accessing data on Google's infrastructure. It is ideal for serving website content, storing data for archival and disaster recovery, or distributing large data objects to users.

  For example, you can use Cloud Storage to:
  - Store backups
  - Serve media files
  - Archive data
        `,
      },
      {
        name: "Firestore",
        info: `
  Managed NoSQL Database Service (Firestore) provides a flexible, scalable database for mobile, web, and server development. It is ideal for building real-time applications with offline support.

  For instance, you can use Firestore to:
  - Create a chat application
  - Manage user data
  - Store IoT data
        `,
      },
      ],
    },
    },
    {
    name: "Security",
    info: `
  Security services are used to protect your applications and data from threats. They include tools for identity management, access control, and data encryption. For example, you can use security services to:
  - Manage user access
  - Encrypt sensitive data
  - Monitor for security threats
    `,
    children: {
      "aws": [
      {
        name: "Security Groups",
        info: `
  Virtual Firewall for Your Instances (Security Groups) is used to control inbound and outbound traffic to your instances. It is ideal for securing your instances and applications.

  For example, you can define rules to:
  - Allow or deny traffic based on IP addresses
  - Control access based on ports and protocols
        `,
      },
      ],
      "azure": [
      {
        name: "Azure AD",
        info: `
  Identity and Access Management (Azure AD) is used to manage user identities and access to resources. It is ideal for securing access to applications and protecting user identities.

  For example, you can use Azure AD to:
  - Manage employee access to company resources
  - Secure access to cloud applications
  - Implement single sign-on (SSO)
        `,
      },
      {
        name: "Key Vault",
        info: `
  Key Management Service (Key Vault) is used to safeguard cryptographic keys and secrets. It is ideal for enhancing data protection and compliance requirements.

  For instance, you can use Key Vault to:
  - Store API keys
  - Manage encryption keys
  - Secure passwords
        `,
      },
      ],
      "gcp": [
      {
        name: "Identity Platform",
        info: `
  Identity and Access Management (Identity Platform) is used to add identity management and authentication to your applications. It is ideal for securing user access and managing user identities.

  For example, you can use Identity Platform to:
  - Implement user authentication
  - Manage user roles
  - Secure access to applications
        `,
      },
      {
        name: "Cloud KMS",
        info: `
  Key Management Service (Cloud KMS) is used to manage cryptographic keys for your cloud services. It is ideal for enhancing data security and compliance requirements.

  For instance, you can use Cloud KMS to:
  - Store API keys
  - Manage encryption keys
  - Secure passwords
        `,
      },
      ],
    },
    },
  ];