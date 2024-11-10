export const services: Record<string, any> = {
  aws: [
    {
      category: "Tools",
      items: [
        {
          name: "EC2",
          info: `
Elastic Compute Cloud (EC2) provides virtual servers in the cloud. It is used for scalable computing capacity, making it ideal for running applications that require a lot of computing power.

For example, you can use EC2 to:
- Host a website
- Run a batch processing job
- Deploy a machine learning model
          `,
        },
        {
          name: "Lambda",
          info: `
Serverless Compute Service (Lambda) allows you to run code without provisioning or managing servers. It is ideal for building event-driven applications.

For example, you can use Lambda to:
- Automatically resize uploaded images
- Process log files
- Run backend services for mobile applications

Lambda can run code in response to events like changes to data in an S3 bucket or updates to a DynamoDB table.
          `,
        },
      ],
    },
    {
      category: "Database",
      items: [
        {
          name: "S3",
          info: `
Simple Storage Service (S3) offers scalable object storage, allowing you to store and retrieve any amount of data at any time. It is ideal for backup, archiving, and big data analytics.

For example, you can use S3 to:
- Store website assets
- Create data lakes for analytics
- Archive important documents
          `,
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
        },
      ],
    },
    {
      category: "Security",
      items: [
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
    },
  ],
  azure: [
    {
      category: "Compute",
      items: [
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
        {
          name: "App Service",
          info: `
Platform-as-a-Service for Web Apps (App Service) is used to build and host web apps, mobile backends, and RESTful APIs. It is ideal for developers who want to focus on building apps without managing infrastructure.

For instance, you can use App Service to:
- Deploy a web application
- Create a RESTful API
- Host a mobile backend
          `,
        },
      ],
    },
    {
      category: "Database",
      items: [
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
    },
    {
      category: "Security",
      items: [
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
    },
  ],
  gcp: [
    {
      category: "Compute",
      items: [
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
        {
          name: "App Engine",
          info: `
Platform-as-a-Service for Web Apps (App Engine) is used to build and deploy scalable web applications and mobile backends. It is ideal for developers who want to focus on writing code without managing infrastructure.

For instance, you can use App Engine to:
- Deploy a web application
- Create a RESTful API
- Host a mobile backend
          `,
        },
      ],
    },
    {
      category: "Database",
      items: [
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
    {
      category: "Security",
      items: [
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
  ],
};

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
];
