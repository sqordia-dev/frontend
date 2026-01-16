import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Download, Eye, BookOpen, Sparkles, CheckCircle2, ArrowRight, FileText, TrendingUp, BarChart3, Users, Target } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import TemplateViewer from '../components/TemplateViewer';

interface TemplateSection {
  id: string;
  title: string;
  icon: any;
  subsections: {
    id: string;
    title: string;
    content: string | string[];
  }[];
}

interface TemplateData {
  id: string;
  title: string;
  description: string;
  category: string;
  color: string;
  gradient: string;
  pdfUrl: string;
  coverImage: string;
  stats: {
    pages: number;
    sections: number;
    readTime: string;
  };
  highlights: string[];
  sections: TemplateSection[];
}

const templates: Record<string, TemplateData> = {
  'tech-startup': {
    id: 'tech-startup',
    title: 'Tech Startup Business Plan',
    description: 'CloudSync - Cloud Collaboration Platform',
    category: 'Technology',
    color: 'blue',
    gradient: 'from-blue-600 via-cyan-600 to-blue-700',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    coverImage: 'https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?auto=compress&cs=tinysrgb&w=1600',
    stats: {
      pages: 42,
      sections: 7,
      readTime: '25 min'
    },
    highlights: [
      'Complete market analysis for SaaS platforms',
      'Detailed 5-year financial projections with metrics',
      'Ready-to-present investor pitch materials',
      'AI-powered growth strategy frameworks'
    ],
    sections: [
      {
        id: 'executive-summary',
        title: 'Executive Summary',
        icon: Sparkles,
        subsections: [
          {
            id: 'mission',
            title: 'Our Mission',
            content: 'CloudSync is a revolutionary cloud-based collaboration platform designed for remote teams. Our platform combines project management, real-time communication, and file sharing in one seamless interface. With the remote work market growing at 25% annually, we\'re positioned to capture a significant share of the $50B collaboration software market. Our mission is to eliminate tool fragmentation and empower teams to work more efficiently, regardless of location.'
          },
          {
            id: 'company',
            title: 'The Company & Management',
            content: 'Founded in 2024, CloudSync brings together a seasoned team with deep expertise in enterprise software. Our CEO Jane Smith has 15 years in SaaS leadership, having scaled two previous startups to successful exits totaling $200M. CTO John Doe previously architected systems at major tech companies serving millions of users. CMO Sarah Johnson has a proven track record of scaling customer acquisition at three high-growth startups, achieving 300% year-over-year growth.'
          },
          {
            id: 'highlights',
            title: 'Key Highlights',
            content: [
              'Target market of 50M+ remote workers globally with $50B TAM',
              'Proprietary AI-powered workflow automation reducing manual work by 40%',
              'Strategic partnerships with Microsoft, Salesforce, and Google',
              'Experienced founding team with 40+ years combined experience',
              'Projected $10M ARR by year 3 with path to profitability'
            ]
          }
        ]
      },
      {
        id: 'business',
        title: 'The Business',
        icon: Target,
        subsections: [
          {
            id: 'problem',
            title: 'Problem Statement',
            content: 'Remote teams struggle with tool fragmentation, using an average of 3-5 different platforms for collaboration. This creates inefficiencies, increases costs by 30%, and reduces productivity by 25%. Market research shows 78% of teams report frustration with context-switching between tools, 65% cite difficulty in maintaining visibility across projects, and 82% experience data silos preventing effective collaboration.'
          },
          {
            id: 'solution',
            title: 'Our Solution',
            content: 'CloudSync provides an integrated platform that combines project management, communication, and file sharing with AI-powered automation. Our platform learns team workflows and suggests optimizations, reducing manual work by up to 40%. We offer seamless integration between all features, eliminating the need for multiple subscriptions and reducing training time by 60%.'
          }
        ]
      },
      {
        id: 'services',
        title: 'Product & Services',
        icon: BookOpen,
        subsections: [
          {
            id: 'product',
            title: 'Product Offerings',
            content: 'CloudSync offers three core modules: Project Management with AI-powered task prioritization, Real-time Communication with video conferencing and instant messaging, and Secure File Storage with version control. All modules integrate seamlessly, providing a unified experience.'
          },
          {
            id: 'pricing',
            title: 'Pricing Strategy',
            content: [
              'Starter: $10/user/month - Essential features for small teams',
              'Professional: $25/user/month - Advanced features and integrations',
              'Enterprise: Custom pricing - Dedicated support and SLA guarantees'
            ]
          }
        ]
      },
      {
        id: 'market',
        title: 'Market Analysis',
        icon: TrendingUp,
        subsections: [
          {
            id: 'opportunity',
            title: 'Market Opportunity',
            content: 'The global collaboration software market is valued at $50B and growing at 25% annually. Our target market includes 50M+ remote workers at SMBs. Current market leaders focus on enterprises, leaving SMBs underserved with overpriced solutions.'
          },
          {
            id: 'competitive',
            title: 'Competitive Landscape',
            content: 'Main competitors include Slack, Microsoft Teams, Asana, and Monday.com. CloudSync differentiates through AI automation, unified platform approach, and SMB-focused pricing 30-40% below competition.'
          }
        ]
      },
      {
        id: 'strategy',
        title: 'Growth Strategy',
        icon: BarChart3,
        subsections: [
          {
            id: 'gtm',
            title: 'Go-to-Market Strategy',
            content: 'Multi-channel approach: Content Marketing through SEO-optimized articles and webinars, Strategic Partnerships with 100+ apps, Freemium Model with viral referral mechanics, and inside sales targeting 50-500 employee companies.'
          },
          {
            id: 'growth',
            title: 'Growth Projections',
            content: [
              'Year 1: 5,000 users, $500K revenue - Product-market fit',
              'Year 2: 25,000 users, $3M revenue - Scale acquisition',
              'Year 3: 75,000 users, $10M revenue - Market expansion'
            ]
          }
        ]
      },
      {
        id: 'operations',
        title: 'Operations',
        icon: Users,
        subsections: [
          {
            id: 'tech',
            title: 'Technology Infrastructure',
            content: 'Built on AWS with microservices architecture for 99.99% uptime. React frontend with Node.js backend. PostgreSQL, Redis, and S3. Real-time WebSockets. AI/ML on AWS SageMaker. SOC 2 Type II compliant with end-to-end encryption.'
          },
          {
            id: 'team',
            title: 'Team & Culture',
            content: 'Team of 12 growing to 50 by year 3. Remote-first culture with quarterly offsites. Competitive compensation with equity. Unlimited PTO and $5K learning budget.'
          }
        ]
      },
      {
        id: 'financials',
        title: 'Financial Projections',
        icon: BarChart3,
        subsections: [
          {
            id: 'investment',
            title: 'Investment Requirements',
            content: 'Seeking $2.5M seed funding for 18-month runway. Allocation: 50% engineering, 30% marketing, 15% operations, 5% contingency. Target Series A of $10M at $40M valuation.'
          },
          {
            id: 'projections',
            title: 'Financial Projections',
            content: [
              'Year 1: $500K revenue, $2M expenses',
              'Year 2: $3M revenue, $2.8M expenses - Positive unit economics',
              'Year 3: $10M revenue, $6M expenses - Profitability',
              'Year 5: $35M revenue, 35% net margins'
            ]
          },
          {
            id: 'metrics',
            title: 'Key Metrics',
            content: [
              'CAC: $200, declining to $150 by year 3',
              'LTV: $3,600 over 24 months',
              'LTV/CAC ratio: 18x',
              'Monthly churn: 1.2%',
              'Net revenue retention: 115%'
            ]
          }
        ]
      }
    ]
  },
  'restaurant': {
    id: 'restaurant',
    title: 'Restaurant Business Plan',
    description: 'Harvest Kitchen - Farm-to-Table Restaurant',
    category: 'Food & Beverage',
    color: 'orange',
    gradient: 'from-green-600 via-red-600 to-green-700',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    coverImage: 'https://images.pexels.com/photos/941869/pexels-photo-941869.jpeg?auto=compress&cs=tinysrgb&w=1600',
    stats: {
      pages: 38,
      sections: 6,
      readTime: '22 min'
    },
    highlights: [
      'Complete menu planning and cost analysis',
      'Location strategy and demographics research',
      'Detailed financial projections and ROI',
      'Supplier partnerships and operations plan'
    ],
    sections: [
      {
        id: 'executive-summary',
        title: 'Executive Summary',
        icon: Sparkles,
        subsections: [
          {
            id: 'concept',
            title: 'Restaurant Concept',
            content: 'Harvest Kitchen is a farm-to-table restaurant featuring locally sourced, seasonal ingredients in downtown Portland. Our executive chef brings 15 years of Michelin-starred experience.'
          }
        ]
      },
      {
        id: 'business',
        title: 'The Business',
        icon: Target,
        subsections: [
          {
            id: 'menu',
            title: 'Menu & Cuisine',
            content: 'Seasonal menu with 25 core items. Appetizers ($8-$14), entrees ($18-$32), desserts ($8-$12). Quarterly menu changes. Target food cost: 28%.'
          }
        ]
      },
      {
        id: 'market',
        title: 'Market Analysis',
        icon: TrendingUp,
        subsections: [
          {
            id: 'target',
            title: 'Target Market',
            content: 'Health-conscious professionals aged 30-55, income $75K+. 75K+ potential customers within 1-mile radius.'
          }
        ]
      },
      {
        id: 'strategy',
        title: 'Marketing',
        icon: BarChart3,
        subsections: [
          {
            id: 'launch',
            title: 'Launch Strategy',
            content: 'Social media campaign, influencer tastings, grand opening week-long celebration.'
          }
        ]
      },
      {
        id: 'operations',
        title: 'Operations',
        icon: Users,
        subsections: [
          {
            id: 'hours',
            title: 'Operating Hours',
            content: 'Tue-Thu: 11am-9pm, Fri-Sat: 11am-10pm, Sun brunch: 10am-3pm. 200 covers per night capacity.'
          }
        ]
      },
      {
        id: 'financials',
        title: 'Financials',
        icon: BarChart3,
        subsections: [
          {
            id: 'startup',
            title: 'Startup Costs',
            content: ['Build-out: $200K', 'Equipment: $180K', 'Total: $750K', 'Breakeven: Month 14']
          }
        ]
      }
    ]
  },
  'ecommerce': {
    id: 'ecommerce',
    title: 'E-commerce Store Plan',
    description: 'EcoHome - Sustainable Home Goods',
    category: 'Retail',
    color: 'green',
    gradient: 'from-green-600 via-emerald-600 to-green-700',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    coverImage: 'https://images.pexels.com/photos/230544/pexels-photo-230544.jpeg?auto=compress&cs=tinysrgb&w=1600',
    stats: { pages: 35, sections: 6, readTime: '20 min' },
    highlights: ['Digital marketing strategy', 'Fulfillment planning', 'Customer acquisition', 'Subscription model'],
    sections: [
      { id: 'executive-summary', title: 'Executive Summary', icon: Sparkles, subsections: [{ id: 'concept', title: 'Business Concept', content: 'Online marketplace for sustainable home goods targeting eco-conscious millennials.' }] },
      { id: 'business', title: 'The Business', icon: Target, subsections: [{ id: 'products', title: 'Categories', content: ['Kitchen & Dining', 'Cleaning', 'Personal Care'] }] },
      { id: 'market', title: 'Market', icon: TrendingUp, subsections: [{ id: 'opportunity', title: 'Opportunity', content: '$150B sustainable market growing 20% annually.' }] },
      { id: 'strategy', title: 'Strategy', icon: BarChart3, subsections: [{ id: 'acquisition', title: 'Acquisition', content: 'Content marketing, paid social, influencers. CAC: $35, LTV: $280.' }] },
      { id: 'operations', title: 'Operations', icon: Users, subsections: [{ id: 'fulfillment', title: 'Fulfillment', content: '3PL partnership, 2-day shipping to 95% of US.' }] },
      { id: 'financials', title: 'Financials', icon: BarChart3, subsections: [{ id: 'projections', title: 'Projections', content: ['Year 1: $1.2M', 'Year 3: $6M, 13% margin'] }] }
    ]
  },
  'nonprofit': {
    id: 'nonprofit',
    title: 'Nonprofit Strategic Plan',
    description: 'Youth Empowerment Foundation',
    category: 'Nonprofit',
    color: 'purple',
    gradient: 'from-purple-600 via-pink-600 to-purple-700',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    coverImage: 'https://images.pexels.com/photos/6646918/pexels-photo-6646918.jpeg?auto=compress&cs=tinysrgb&w=1600',
    stats: { pages: 40, sections: 4, readTime: '18 min' },
    highlights: ['Program frameworks', 'Grant strategy', 'Impact measurement', 'Partnerships'],
    sections: [
      { id: 'executive-summary', title: 'Executive Summary', icon: Sparkles, subsections: [{ id: 'mission', title: 'Mission', content: 'After-school programs and mentorship for 500 underserved youth annually.' }] },
      { id: 'programs', title: 'Programs', icon: Target, subsections: [{ id: 'offerings', title: 'Offerings', content: ['Tutoring: 200 students', 'College Prep: 150', 'STEM Camp: 100'] }] },
      { id: 'strategy', title: 'Goals', icon: BarChart3, subsections: [{ id: 'goals', title: '3-Year Goals', content: 'Expand to 5 communities, serve 1,000 students by 2027.' }] },
      { id: 'financials', title: 'Financials', icon: BarChart3, subsections: [{ id: 'budget', title: 'Budget', content: ['Current: $1.5M', 'Goal: $3M by 2027'] }] }
    ]
  },
  'consulting': {
    id: 'consulting',
    title: 'Consulting Firm Plan',
    description: 'Strategic Solutions Partners',
    category: 'Professional Services',
    color: 'slate',
    gradient: 'from-slate-600 via-gray-700 to-slate-800',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    coverImage: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1600',
    stats: { pages: 36, sections: 4, readTime: '19 min' },
    highlights: ['Service pricing models', 'Client acquisition', 'Team scaling', 'Proposal templates'],
    sections: [
      { id: 'executive-summary', title: 'Executive Summary', icon: Sparkles, subsections: [{ id: 'overview', title: 'Overview', content: 'Digital transformation consulting for mid-market companies.' }] },
      { id: 'services', title: 'Services', icon: Target, subsections: [{ id: 'offerings', title: 'Lines', content: ['Digital Strategy: $75K-$200K', 'Implementation: $100K-$500K'] }] },
      { id: 'market', title: 'Market', icon: TrendingUp, subsections: [{ id: 'target', title: 'Clients', content: 'Mid-market in manufacturing, distribution. 5,000+ TAM.' }] },
      { id: 'financials', title: 'Financials', icon: BarChart3, subsections: [{ id: 'projections', title: 'Projections', content: ['Year 1: $800K', 'Year 3: $3.5M, 34% margin'] }] }
    ]
  },
  'mobile-app': {
    id: 'mobile-app',
    title: 'Mobile App Startup',
    description: 'FitTogether - Social Fitness App',
    category: 'Technology',
    color: 'cyan',
    gradient: 'from-cyan-600 via-blue-600 to-cyan-700',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    coverImage: 'https://images.pexels.com/photos/607812/pexels-photo-607812.jpeg?auto=compress&cs=tinysrgb&w=1600',
    stats: { pages: 44, sections: 4, readTime: '23 min' },
    highlights: ['User acquisition', 'Freemium model', 'ASO strategy', 'Product roadmap'],
    sections: [
      { id: 'executive-summary', title: 'Executive Summary', icon: Sparkles, subsections: [{ id: 'overview', title: 'Overview', content: 'Social fitness app connecting workout partners for accountability.' }] },
      { id: 'product', title: 'Product', icon: Target, subsections: [{ id: 'features', title: 'Features', content: ['Matching algorithm', 'Scheduling', 'Progress tracking', 'Challenges'] }] },
      { id: 'market', title: 'Market', icon: TrendingUp, subsections: [{ id: 'opportunity', title: 'Opportunity', content: '$96B fitness app market, 21% growth annually.' }] },
      { id: 'financials', title: 'Financials', icon: BarChart3, subsections: [{ id: 'monetization', title: 'Monetization', content: ['Premium: $9.99/month', 'Year 3: 1.5M users, $9M revenue'] }] }
    ]
  },
  'strategic-plan': {
    id: 'strategic-plan',
    title: 'Strategic Plan (Nonprofit)',
    description: 'Professional Strategic Plan for Quebec/Canada Organizations',
    category: 'Nonprofit',
    color: 'indigo',
    gradient: 'from-indigo-600 via-purple-600 to-indigo-700',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    coverImage: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=1600',
    stats: { pages: 52, sections: 9, readTime: '30 min' },
    highlights: [
      'Complete SWOT analysis framework',
      'Multi-year action plan with KPIs',
      'Governance and accountability structure',
      'Funding strategy and resource planning'
    ],
    sections: [
      {
        id: 'executive-summary',
        title: 'Executive Summary',
        icon: Sparkles,
        subsections: [
          {
            id: 'overview',
            title: 'Strategic Overview',
            content: 'This strategic plan provides a comprehensive roadmap for organizational development over the next 3-5 years. It outlines the context, mission, global objectives, and strategic directions. The plan covers the period from 2025-2028 and establishes clear priorities for community impact, financial sustainability, and organizational capacity building. It includes measurable results and accountability mechanisms to ensure effective implementation and continuous improvement.'
          },
          {
            id: 'period',
            title: 'Planning Period & Goals',
            content: [
              'Planning period: 2025-2028 (3-year strategic cycle)',
              'Focus on strengthening community impact and organizational capacity',
              'Ensure financial sustainability and diversified funding sources',
              'Develop strategic partnerships and collaborative networks',
              'Implement robust monitoring and evaluation systems'
            ]
          }
        ]
      },
      {
        id: 'organization',
        title: 'Organization Presentation',
        icon: BookOpen,
        subsections: [
          {
            id: 'history',
            title: 'History & Context',
            content: 'Founded to address critical community needs, our organization has evolved through several key stages of development. From initial grassroots efforts to becoming a recognized leader in our field, we have consistently adapted to meet changing community needs. Major milestones include expanding service delivery, building strategic partnerships, and achieving financial sustainability. Our track record demonstrates commitment to excellence and innovation in social impact.'
          },
          {
            id: 'mission-vision',
            title: 'Mission, Vision & Values',
            content: [
              'Mission: To empower communities through accessible services and sustainable programs',
              'Vision: A thriving community where all individuals have opportunities to reach their full potential',
              'Values: Integrity, collaboration, innovation, inclusivity, and accountability',
              'Commitment to social justice and equitable access to resources'
            ]
          },
          {
            id: 'legal-structure',
            title: 'Legal Status & Governance',
            content: 'Incorporated as a nonprofit organization under Quebec/Canadian legislation. Our governance structure includes a dedicated Board of Directors providing strategic oversight, an Executive Director responsible for operations, and specialized committees focused on finance, programs, and governance. We maintain strong accountability through transparent reporting and stakeholder engagement. Our service territory spans multiple communities with diverse needs.'
          }
        ]
      },
      {
        id: 'environmental-analysis',
        title: 'Environmental Analysis & Strategic Diagnosis',
        icon: TrendingUp,
        subsections: [
          {
            id: 'external',
            title: 'External Environment (PESTEL)',
            content: [
              'Political: Government policy changes affecting funding and regulations',
              'Economic: Economic downturn impacts community needs and donor capacity',
              'Social: Demographic shifts, increasing diversity, changing social needs',
              'Technological: Digital transformation creating opportunities and challenges',
              'Environmental: Climate concerns affecting program delivery',
              'Legal: Evolving compliance requirements and reporting standards'
            ]
          },
          {
            id: 'internal',
            title: 'Internal Environment',
            content: 'Our internal capacity includes a dedicated team of skilled professionals and committed volunteers. We possess strong community relationships, proven program models, and operational infrastructure. However, we face challenges with limited financial reserves, technology gaps, and capacity constraints. Recent successes include program expansion and partnership development. Key lessons learned emphasize the importance of adaptability, stakeholder engagement, and data-driven decision making.'
          },
          {
            id: 'swot',
            title: 'SWOT Analysis',
            content: [
              'Strengths: Strong community reputation, experienced leadership, proven programs, dedicated volunteers',
              'Weaknesses: Limited financial reserves, technology gaps, capacity constraints, staff retention challenges',
              'Opportunities: Growing community needs, new funding sources, partnership potential, digital innovation',
              'Threats: Funding uncertainty, increased competition, changing regulations, economic volatility'
            ]
          }
        ]
      },
      {
        id: 'target-impact',
        title: 'Target Audience, Needs & Social Impact',
        icon: Users,
        subsections: [
          {
            id: 'beneficiaries',
            title: 'Beneficiaries & Communities',
            content: 'Our primary beneficiaries include vulnerable populations facing multiple barriers to well-being. Demographics show a diverse community with varying ages, backgrounds, and needs. Key challenges include socioeconomic barriers, limited access to services, and systemic inequities. We serve both direct beneficiaries through programs and the broader community through advocacy and capacity building.'
          },
          {
            id: 'needs',
            title: 'Identified Needs',
            content: [
              'Consultation findings: 78% of community members report unmet basic needs',
              'Priority needs: Access to essential services, skill development, social connection',
              'Barriers identified: Financial constraints, transportation, language, awareness',
              'Service gaps: Evening programs, culturally adapted services, family support'
            ]
          },
          {
            id: 'impact',
            title: 'Intended Social Impact',
            content: 'Short-term outcomes include increased service access and participant satisfaction. Medium-term results focus on skill development, improved well-being, and community engagement. Long-term impact targets systemic change, reduced inequities, and sustainable community development. Impact indicators include service utilization rates, participant outcomes, community health metrics, and policy influence. We employ mixed-methods evaluation combining quantitative data and qualitative feedback.'
          }
        ]
      },
      {
        id: 'strategic-directions',
        title: 'Strategic Directions',
        icon: Target,
        subsections: [
          {
            id: 'priorities',
            title: 'Strategic Priorities',
            content: [
              'Priority 1: Scale impact by expanding proven programs to reach more beneficiaries',
              'Priority 2: Achieve financial sustainability through diversified revenue streams',
              'Priority 3: Build organizational capacity and infrastructure',
              'Priority 4: Strengthen partnerships and collaborative networks',
              'Priority 5: Advance innovation in service delivery and technology adoption'
            ]
          },
          {
            id: 'axes',
            title: 'Strategic Axes',
            content: [
              'Axis 1: Community Impact - Deepen reach and effectiveness of programs',
              'Axis 2: Financial Sustainability - Diversify funding and build reserves',
              'Axis 3: Innovation & Partnerships - Develop new approaches and collaborations',
              'Axis 4: Governance & Capacity - Strengthen internal operations and governance'
            ]
          }
        ]
      },
      {
        id: 'objectives',
        title: 'Strategic Objectives & Expected Results',
        icon: CheckCircle2,
        subsections: [
          {
            id: 'objectives-by-axis',
            title: 'Objectives by Strategic Axis',
            content: [
              'Community Impact: Increase beneficiaries by 40%, improve outcome measures by 25%',
              'Financial Sustainability: Grow budget by 30%, establish 6-month reserve, reduce funding concentration',
              'Innovation: Launch 3 new programs, implement digital tools, establish 5 strategic partnerships',
              'Capacity Building: Reduce staff turnover by 30%, implement succession planning, upgrade technology'
            ]
          },
          {
            id: 'expected-results',
            title: 'Expected Results',
            content: 'Social impact results include improved beneficiary well-being, increased community engagement, and systemic change. Organizational changes encompass enhanced capacity, improved efficiency, and stronger governance. Internal development focuses on staff competencies, technology adoption, and knowledge management. Success will be measured through comprehensive performance indicators tracked quarterly with annual strategic reviews.'
          }
        ]
      },
      {
        id: 'action-plan',
        title: 'Three-Year Action Plan',
        icon: BarChart3,
        subsections: [
          {
            id: 'actions',
            title: 'Key Actions & Projects',
            content: [
              'Year 1: Conduct needs assessment, develop new programs, launch fundraising campaign, upgrade technology',
              'Year 2: Scale successful programs, implement CRM system, establish partnerships, enhance evaluation',
              'Year 3: Achieve sustainability targets, launch innovation initiatives, strengthen governance, expand reach',
              'Responsibilities assigned to specific roles with partner engagement and resource allocation'
            ]
          },
          {
            id: 'indicators',
            title: 'Monitoring Indicators',
            content: [
              'Quantitative: Beneficiaries served, activities delivered, revenue raised, staff trained',
              'Qualitative: Satisfaction surveys, testimonials, case studies, outcome stories',
              'Impact: Community health metrics, policy changes, partnership strength, organizational capacity'
            ]
          },
          {
            id: 'accountability',
            title: 'Accountability Mechanisms',
            content: 'Quarterly progress reports track KPIs and milestones. Annual evaluations assess strategic progress and community impact. Board oversight includes strategic review sessions and performance monitoring. Stakeholder engagement includes community consultations and partner feedback. Financial audits and compliance reporting ensure transparency. Adaptive management allows course corrections based on evidence.'
          }
        ]
      },
      {
        id: 'resources',
        title: 'Resources & Funding Strategy',
        icon: BarChart3,
        subsections: [
          {
            id: 'human-resources',
            title: 'Human Resources',
            content: 'Current team includes 12 staff (8 FTE) and 50 active volunteers. Growth plan targets 18 staff by year 3. Key recruitment needs include program coordinators, development officer, and communications specialist. Volunteer engagement strategy focuses on recruitment, training, retention, and recognition. Professional development plan allocates $30K annually for staff training and certifications.'
          },
          {
            id: 'material-resources',
            title: 'Material & Technology Resources',
            content: [
              'Current facilities: 2,500 sq ft office and program space',
              'Technology: Upgrade to cloud-based systems, CRM implementation, website redesign',
              'Equipment needs: Program supplies, office equipment, accessibility tools',
              'Infrastructure investment: $75K over 3 years for technology and space improvements'
            ]
          },
          {
            id: 'funding-strategy',
            title: 'Funding Strategy',
            content: [
              'Public grants: 45% - Municipal, provincial, and federal programs',
              'Private foundations: 25% - Strategic grant proposals to aligned funders',
              'Individual donors: 20% - Annual campaign, major gifts, monthly donors',
              'Earned revenue: 10% - Fee-for-service, social enterprise, training',
              'Target: Grow budget from $850K to $1.1M by year 3'
            ]
          }
        ]
      },
      {
        id: 'governance',
        title: 'Governance & Organizational Development',
        icon: Users,
        subsections: [
          {
            id: 'decision-structure',
            title: 'Decision-Making Structure',
            content: 'Board of Directors provides strategic governance with quarterly meetings and annual planning retreat. Executive Director leads operations with delegated authority. Three standing committees (Finance, Programs, Governance) support Board work. Management team includes program managers and administrative leads. Decision-making follows clear policies with appropriate delegation and accountability. Stakeholder engagement includes advisory committees and community consultations.'
          },
          {
            id: 'organizational-development',
            title: 'Organizational Development',
            content: [
              'Governance improvements: Board recruitment strategy, policy updates, orientation program',
              'Capacity building: Leadership development, team training, knowledge management',
              'Change management: Communication plan, staff engagement, phased implementation',
              'Culture development: Values integration, recognition systems, collaborative practices',
              'Risk management: Policy review, insurance coverage, emergency preparedness'
            ]
          }
        ]
      }
    ]
  }
};

export default function TemplateDetailPage() {
  const { templateId } = useParams<{ templateId: string }>();
  const [isPdfOpen, setIsPdfOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});

  const template = templateId ? templates[templateId] : null;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 100);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { threshold: 0.3, rootMargin: '-100px 0px -60% 0px' }
    );

    Object.values(sectionRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [template]);

  const scrollToSection = (sectionId: string) => {
    const element = sectionRefs.current[sectionId];
    if (element) {
      const offset = 120;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  if (!template) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Template not found</h1>
          <Link to="/" className="text-blue-600 hover:text-blue-700">Return to home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Top Nav */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-lg' : 'bg-transparent'
      }`}>
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="group flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 transition-all">
            <div className="p-2 rounded-lg group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors">
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            </div>
            <span className="font-semibold">Back</span>
          </Link>
          <div className="flex gap-3">
            <button onClick={() => setIsPdfOpen(true)} className="flex items-center gap-2 px-5 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all">
              <Eye size={18} />
              <span className="hidden sm:inline">Preview</span>
            </button>
            <button className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:shadow-xl hover:scale-105 transition-all">
              <Download size={18} />
              <span className="hidden sm:inline">Download</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="flex pt-20">
        {/* Sidebar */}
        <aside className="hidden lg:block fixed left-0 top-20 bottom-0 w-80 xl:w-96 bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
          <div className="p-8">
            <div className="mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-full mb-4">
                <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${template.gradient} animate-pulse`}></div>
                <span className={`text-sm font-semibold bg-gradient-to-r ${template.gradient} bg-clip-text text-transparent`}>
                  {template.category}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 leading-tight">{template.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{template.description}</p>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 dark:text-gray-500">
                  <FileText size={16} />
                  <span>{template.stats.pages} pages</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 dark:text-gray-500">
                  <BookOpen size={16} />
                  <span>{template.stats.readTime}</span>
                </div>
              </div>
            </div>

            <nav className="space-y-2">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Contents</div>
              {template.sections.map((section, index) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={`group w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      isActive
                        ? `bg-gradient-to-r ${template.gradient} text-white shadow-lg scale-105`
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${isActive ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-700'}`}>
                      <Icon size={18} />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-semibold text-sm">{section.title}</div>
                      <div className={`text-xs ${isActive ? 'text-white/80' : 'text-gray-500'}`}>Chapter {index + 1}</div>
                    </div>
                    {isActive && <div className="w-1.5 h-8 bg-white rounded-full"></div>}
                  </button>
                );
              })}
            </nav>

            <button onClick={() => setIsPdfOpen(true)} className={`w-full mt-8 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r ${template.gradient} text-white font-semibold rounded-xl hover:shadow-2xl hover:scale-105 transition-all`}>
              <Sparkles size={20} />
              Use Template
              <ArrowRight size={20} />
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 lg:ml-80 xl:ml-96">
          <div className="max-w-5xl mx-auto px-6 lg:px-12 py-12">
            {/* Hero */}
            <div className="mb-20">
              <div className="relative rounded-3xl overflow-hidden mb-8 group">
                <img src={template.coverImage} alt={template.title} className="w-full h-96 object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <div className={`inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r ${template.gradient} rounded-full mb-4`}>
                    <Sparkles size={16} className="text-white" />
                    <span className="text-white font-semibold text-sm">{template.category}</span>
                  </div>
                  <h1 className="text-5xl lg:text-6xl font-bold text-white mb-3 leading-tight">{template.title}</h1>
                  <p className="text-2xl text-white/90 font-light">{template.description}</p>
                </div>
              </div>

              {/* Highlights */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl p-8 border border-blue-100 dark:border-blue-800">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <Sparkles className="text-blue-600 dark:text-blue-400" size={24} />
                  What's Included
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {template.highlights.map((h, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="mt-1 p-1 bg-blue-600 rounded-full">
                        <CheckCircle2 className="text-white" size={16} />
                      </div>
                      <span className="text-gray-700 dark:text-gray-300">{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sections */}
            {template.sections.map((section, sectionIndex) => {
              const Icon = section.icon;
              return (
                <section key={section.id} id={section.id} ref={(el) => (sectionRefs.current[section.id] = el)} className="mb-24 scroll-mt-32">
                  <div className="relative mb-12">
                    <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${template.gradient} rounded-full`}></div>
                    <div className="pl-8">
                      <div className="flex items-center gap-4 mb-4">
                        <div className={`p-3 bg-gradient-to-br ${template.gradient} rounded-2xl shadow-lg`}>
                          <Icon className="text-white" size={28} />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-500 uppercase">Chapter {sectionIndex + 1}</div>
                          <h2 className="text-4xl font-bold text-gray-900 dark:text-white">{section.title}</h2>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-10 pl-0 lg:pl-12">
                    {section.subsections.map((sub, subIndex) => (
                      <div key={sub.id}>
                        <div className="flex items-baseline gap-4 mb-6">
                          <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex-1">{sub.title}</h3>
                          <span className={`px-3 py-1 bg-gradient-to-r ${template.gradient} text-white text-sm font-bold rounded-full`}>
                            {sectionIndex + 1}.{subIndex + 1}
                          </span>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all">
                          {Array.isArray(sub.content) ? (
                            <ul className="space-y-4">
                              {sub.content.map((item, idx) => (
                                <li key={idx} className="flex items-start gap-4">
                                  <div className={`mt-1.5 p-1.5 bg-gradient-to-br ${template.gradient} rounded-lg`}>
                                    <CheckCircle2 className="text-white" size={14} />
                                  </div>
                                  <span className="text-gray-700 dark:text-gray-300 text-lg">{item}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">{sub.content}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}

            {/* CTA */}
            <div className="mt-32 relative">
              <div className={`absolute inset-0 bg-gradient-to-r ${template.gradient} rounded-3xl blur-2xl opacity-20`}></div>
              <div className={`relative bg-gradient-to-br ${template.gradient} rounded-3xl p-12 overflow-hidden`}>
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="relative z-10 text-center text-white">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-6">
                    <Sparkles size={18} />
                    <span className="font-semibold">Ready to get started?</span>
                  </div>
                  <h3 className="text-4xl lg:text-5xl font-bold mb-4">Create your business plan</h3>
                  <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">Use this template or let AI create a custom plan for you</p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link to="/register" className="px-10 py-5 bg-white text-gray-900 font-bold rounded-xl hover:scale-105 transition-all inline-flex items-center justify-center gap-2">
                      Get Started Free
                      <ArrowRight size={20} />
                    </Link>
                    <button onClick={() => setIsPdfOpen(true)} className="px-10 py-5 bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 font-bold rounded-xl hover:bg-white/20 transition-all">
                      <Eye size={20} className="inline mr-2" />
                      View PDF
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <TemplateViewer isOpen={isPdfOpen} onClose={() => setIsPdfOpen(false)} pdfUrl={template.pdfUrl} title={template.title} />
    </div>
  );
}
