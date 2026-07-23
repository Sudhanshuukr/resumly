export interface MockSummaryData {
  originalResume: string;
  professional: string;
  ats: string;
  executive: string;
}

export const mockSummaryData: MockSummaryData = {
  originalResume: `Sarah Jenkins
Senior Full Stack Engineer | Jenkins.codes

EXPERIENCE
• Senior Engineer at CloudTech (2022 - Present)
Led development of microservices scaling to 5M+ DAU. Managed team of 6 engineers. Replaced legacy systems, reducing hosting overhead by 32%. Established CI/CD pipelines.
• Software Engineer at DevCorp (2019 - 2022)
Maintained core client dashboards. Architected real-time messaging system in React/TypeScript. Collaborated with designers to build an internally shared design system.

TECHNICAL SKILLS
React, Node.js, Next.js, Go, AWS, Docker, Kubernetes, GraphQL, TypeScript, SQL`,

  professional: `Highly accomplished Senior Full Stack Engineer with over 6 years of experience architecting scalable distributed systems and interactive web applications. Proven track record leading cross-functional engineering teams, deploying containerized microservices, and reducing infrastructure expenses by 32%. Expert in React, Node.js, and cloud deployments, with a passion for designing high-performance systems and streamlining development workflows.`,

  ats: `Senior Full Stack Developer specializing in React, Node.js, TypeScript, Go, and Next.js. Expert in AWS cloud infrastructure, microservices architecture, Docker, and Kubernetes orchestrations. Experienced in database management (SQL, GraphQL), agile leadership, and establishing automated CI/CD deployment pipelines. Quantified success includes reducing hosting overhead costs by 32% while supporting 5 million+ daily active users (DAU).`,

  executive: `Strategic Technology Leader and Senior Full Stack Architect with a history of driving technical innovation and operational excellence. At CloudTech, directed a team of 6 engineers to scale infrastructure to 5M+ daily active users while capturing a 32% efficiency improvement in cloud hosting expenditures. Combines deep technical proficiency in modern web stacks (Go, Node, React) with strong business alignment to deliver high-impact enterprise solutions.`
};
