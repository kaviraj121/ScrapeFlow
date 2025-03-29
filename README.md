# ScrapFlow: Visual Web Scraper Builder
  ## Overview
  ScrapFlow is a full-stack SaaS application that allows users to build web scrapers visually using an intuitive workflow builder powered by AI. The application includes 
  features such as a credential management system, workflow scheduling, and detailed execution logs.

  ## Features

  * Visual Workflow Builder: Users can create, modify, and delete workflows using a drag-and-drop interface.
  * AI-Powered Task Identification: Automatically identifies input fields and buttons on web pages for seamless data extraction.
  * Execution Monitoring: View execution status, logs, and details for each workflow run.
  * Credential Management: Securely store sensitive information with encryption.
  * Billing System: Purchase credits, view consumption statistics, and download invoices.
  * User Authentication: Integrated with Clerk for user management and authentication.
  * Responsive Design: Optimized for both desktop and mobile devices.

  ## Live Site
  
  You can try out ScrapFlow live at: [Live Site](https://scrapeflows.netlify.app/)
  
  ## Tech Stack
  
  * Frontend: Next.js, TypeScript, Tailwind CSS, React Query
  * Backend: Prisma ORM with SQLite
  * Authentication: Clerk
  * Deployment: Vercel (or your preferred hosting service)

  ## Getting Started
  
  ### Prerequisites
  * Node.js (version 14 or higher)
  * npm or yarn

  ## Installation
  
  1. Clone the repository:
         
         1. git clone https://github.com/yourusername/scrapflow.git
         2. cd scrapflow
  2. Install dependencies:

         npm install

  3. Set up environment variables:

     Create a .env.local file in the root directory and add your Clerk API keys and other necessary configurations.

  4. Initialize the database:

         npx prisma migrate dev --name init
  
  5. Start the development server:

         npm run dev
  
  6. Open your browser and navigate to http://localhost:3000.


  ## Usage
  
  * Creating a Workflow: Navigate to the workflows page and click on "Create Workflow". Use the visual builder to add tasks and configure them.
  * Running a Workflow: After creating a workflow, you can execute it and monitor its progress on the execution detail page.
  * Managing Credentials: Use the credentials page to securely store and manage sensitive information.
  * Billing: Purchase credits and view your transaction history on the billing page.
