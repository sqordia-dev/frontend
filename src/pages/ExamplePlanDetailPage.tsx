import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, FileText, Eye, BookOpen, TrendingUp, BarChart3, Users, Target, DollarSign, Settings, FileBarChart } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import TemplateViewer from '../components/TemplateViewer';

interface PlanSection {
  id: string;
  title: string;
  icon: any;
  subsections: {
    id: string;
    title: string;
    content: string | string[];
  }[];
}

interface ExamplePlanDetail {
  id: string;
  title: string;
  description: string;
  fullDescription: string;
  category: string;
  industry: string;
  pages: number;
  image: string;
  color: string;
  gradient: string;
  pdfUrl?: string;
  sections: PlanSection[];
}

const examplePlanDetails: Record<string, ExamplePlanDetail> = {
  'tech-startup': {
    id: 'tech-startup',
    title: 'Tech Startup Business Plan',
    description: 'Complete SaaS business plan with market analysis, financial projections, and growth strategy.',
    fullDescription: 'This comprehensive business plan template is designed for technology startups seeking investment. It includes detailed market analysis, competitive positioning, financial projections, and growth strategies.',
    category: 'Business Plan',
    industry: 'Technology',
    pages: 42,
    image: 'https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?auto=compress&cs=tinysrgb&w=1600',
    color: 'from-blue-500 to-cyan-500',
    gradient: 'from-blue-600 via-cyan-600 to-blue-700',
    pdfUrl: '#',
    sections: [
      {
        id: 'executive-summary',
        title: 'Executive Summary',
        icon: FileText,
        subsections: [
          {
            id: 'mission',
            title: 'Our Mission',
            content: 'CloudSync is a revolutionary cloud-based collaboration platform designed for remote teams. Our platform combines project management, real-time communication, and file sharing in one seamless interface. With the remote work market growing at 25% annually, we\'re positioned to capture a significant share of the $50B collaboration software market.'
          },
          {
            id: 'company',
            title: 'The Company & Management',
            content: 'Founded in 2024, CloudSync brings together a seasoned team with deep expertise in enterprise software. Our CEO Jane Smith has 15 years in SaaS leadership, having scaled two previous startups to successful exits totaling $200M. CTO John Doe previously architected systems at major tech companies serving millions of users.'
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
            content: 'Remote teams struggle with tool fragmentation, using an average of 3-5 different platforms for collaboration. This creates inefficiencies, increases costs by 30%, and reduces productivity by 25%.'
          },
          {
            id: 'solution',
            title: 'Our Solution',
            content: 'CloudSync provides an integrated platform that combines project management, communication, and file sharing with AI-powered automation. Our platform learns team workflows and suggests optimizations, reducing manual work by up to 40%.'
          }
        ]
      },
      {
        id: 'services',
        title: 'Services',
        icon: Settings,
        subsections: [
          {
            id: 'product',
            title: 'Product Offerings',
            content: 'CloudSync offers three core modules: Project Management with AI-powered task prioritization, Real-time Communication with video conferencing and instant messaging, and Secure File Storage with version control.'
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
            content: 'The global collaboration software market is valued at $50B and growing at 25% annually. Our target market includes 50M+ remote workers at SMBs. Current market leaders focus on enterprises, leaving SMBs underserved.'
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
        title: 'Strategy',
        icon: BarChart3,
        subsections: [
          {
            id: 'gtm',
            title: 'Go-to-Market Strategy',
            content: 'Multi-channel approach: Content Marketing through SEO-optimized articles and webinars, Strategic Partnerships with 100+ apps, Freemium Model with viral referral mechanics, and inside sales targeting 50-500 employee companies.'
          },
          {
            id: 'growth',
            title: 'Growth Plan',
            content: 'Year 1: Launch MVP, acquire 1,000 paying customers, achieve $1M ARR. Year 2: Expand features, reach 10,000 customers, $10M ARR. Year 3: Enterprise focus, 50,000 customers, $50M ARR with profitability.'
          }
        ]
      },
      {
        id: 'operations',
        title: 'Operations',
        icon: Settings,
        subsections: [
          {
            id: 'team',
            title: 'Team Structure',
            content: 'Current team: 12 employees (Engineering: 6, Sales: 2, Marketing: 2, Operations: 2). Plan to scale to 50 employees by end of Year 2, with focus on engineering and customer success.'
          },
          {
            id: 'infrastructure',
            title: 'Infrastructure',
            content: 'Cloud infrastructure hosted on AWS with 99.9% uptime SLA. Multi-region deployment for global performance. SOC 2 Type II certified for enterprise security requirements.'
          }
        ]
      },
      {
        id: 'financials',
        title: 'Financials',
        icon: DollarSign,
        subsections: [
          {
            id: 'revenue',
            title: 'Revenue Projections',
            content: 'Year 1: $1M ARR (1,000 customers @ $10/month average). Year 2: $10M ARR (10,000 customers). Year 3: $50M ARR (50,000 customers) with 20% net margin.'
          },
          {
            id: 'funding',
            title: 'Funding Requirements',
            content: 'Seeking $5M Series A to accelerate growth. Use of funds: 60% sales & marketing, 25% product development, 10% operations, 5% working capital. Projected 18-month runway to Series B.'
          }
        ]
      },
      {
        id: 'appendix',
        title: 'Appendix',
        icon: FileBarChart,
        subsections: [
          {
            id: 'financial-statements',
            title: 'Financial Statements',
            content: 'Detailed 3-year financial projections including income statements, balance sheets, cash flow statements, and key financial ratios. Break-even analysis and sensitivity analysis included.'
          },
          {
            id: 'market-research',
            title: 'Market Research',
            content: 'Comprehensive market research data including TAM/SAM/SOM analysis, customer survey results, competitive analysis matrix, and industry trend reports.'
          }
        ]
      }
    ]
  },
  'restaurant': {
    id: 'restaurant',
    title: 'Restaurant Business Plan',
    description: 'Detailed plan for opening a new restaurant with menu planning, cost analysis, and marketing strategy.',
    fullDescription: 'This comprehensive restaurant business plan template covers everything you need to open and operate a successful restaurant.',
    category: 'Business Plan',
    industry: 'Food & Beverage',
    pages: 38,
    image: 'https://images.pexels.com/photos/941869/pexels-photo-941869.jpeg?auto=compress&cs=tinysrgb&w=1600',
    color: 'from-green-500 to-red-500',
    gradient: 'from-green-600 via-red-600 to-green-700',
    pdfUrl: '#',
    sections: [
      {
        id: 'executive-summary',
        title: 'Executive Summary',
        icon: FileText,
        subsections: [
          {
            id: 'mission',
            title: 'Our Mission',
            content: 'To create an exceptional dining experience that combines innovative cuisine with warm hospitality, becoming the premier destination for food enthusiasts in our community.'
          },
          {
            id: 'company',
            title: 'The Company & Management',
            content: 'Founded by experienced restaurateurs with over 20 years combined experience in the food service industry. Our executive chef has worked at Michelin-starred restaurants and brings world-class culinary expertise.'
          }
        ]
      },
      {
        id: 'business',
        title: 'The Business',
        icon: Target,
        subsections: [
          {
            id: 'concept',
            title: 'Restaurant Concept',
            content: 'Modern bistro featuring farm-to-table cuisine with a focus on local ingredients and seasonal menus. Casual fine dining atmosphere with 80-seat capacity.'
          },
          {
            id: 'location',
            title: 'Location',
            content: 'Prime downtown location with high foot traffic, parking availability, and visibility. 3,500 sq ft space with full kitchen, bar, and dining area.'
          }
        ]
      },
      {
        id: 'services',
        title: 'Services',
        icon: Settings,
        subsections: [
          {
            id: 'menu',
            title: 'Menu Offerings',
            content: 'Dinner service Tuesday-Sunday, weekend brunch, private event catering, and takeout/delivery options. Seasonal menu changes quarterly.'
          },
          {
            id: 'pricing',
            title: 'Pricing Strategy',
            content: 'Average check: $45 per person. Entrees range from $18-$32. Wine and cocktail program with average beverage sales of $15 per person.'
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
            content: 'Local dining market valued at $25M annually. Growing demand for farm-to-table and locally sourced cuisine. Target demographic: 25-55 years old, middle to upper-middle income.'
          },
          {
            id: 'competitive',
            title: 'Competitive Landscape',
            content: '5 direct competitors in 2-mile radius. Differentiation through unique menu, superior service, and local ingredient focus. Competitive pricing with higher quality.'
          }
        ]
      },
      {
        id: 'strategy',
        title: 'Strategy',
        icon: BarChart3,
        subsections: [
          {
            id: 'marketing',
            title: 'Marketing Strategy',
            content: 'Grand opening event, social media marketing, local partnerships, loyalty program, and seasonal promotions. Target 200 covers per week in first year.'
          },
          {
            id: 'growth',
            title: 'Growth Plan',
            content: 'Year 1: Establish brand and customer base. Year 2: Expand catering services. Year 3: Consider second location or food truck concept.'
          }
        ]
      },
      {
        id: 'operations',
        title: 'Operations',
        icon: Settings,
        subsections: [
          {
            id: 'staffing',
            title: 'Staffing Plan',
            content: 'Team of 15: Executive chef, sous chef, 4 line cooks, 2 bartenders, 4 servers, 2 hosts, 1 manager. Training program and competitive compensation package.'
          },
          {
            id: 'suppliers',
            title: 'Suppliers & Inventory',
            content: 'Primary suppliers for local produce, meat, seafood, and specialty ingredients. Inventory management system with 7-day turnover target.'
          }
        ]
      },
      {
        id: 'financials',
        title: 'Financials',
        icon: DollarSign,
        subsections: [
          {
            id: 'revenue',
            title: 'Revenue Projections',
            content: 'Year 1: $800K revenue (200 covers/week @ $45 average). Year 2: $1.2M with expanded services. Year 3: $1.5M with potential second location.'
          },
          {
            id: 'costs',
            title: 'Cost Structure',
            content: 'Food costs: 30%, Labor: 35%, Rent: 8%, Other operating expenses: 15%. Target net margin: 12% by end of Year 1.'
          }
        ]
      },
      {
        id: 'appendix',
        title: 'Appendix',
        icon: FileBarChart,
        subsections: [
          {
            id: 'financial-statements',
            title: 'Financial Statements',
            content: '3-year financial projections, break-even analysis, cash flow projections, and detailed startup cost breakdown.'
          },
          {
            id: 'menu',
            title: 'Sample Menu',
            content: 'Complete menu with pricing, ingredient sourcing information, and dietary accommodation options.'
          }
        ]
      }
    ]
  },
  'nonprofit': {
    id: 'nonprofit',
    title: 'Nonprofit Strategic Plan',
    description: 'Strategic plan for nonprofit organizations with funding strategies and impact measurement.',
    fullDescription: 'This strategic plan template is specifically designed for nonprofit organizations and OBNL.',
    category: 'Strategic Plan',
    industry: 'Nonprofit',
    pages: 40,
    image: 'https://images.pexels.com/photos/6646918/pexels-photo-6646918.jpeg?auto=compress&cs=tinysrgb&w=1600',
    color: 'from-purple-500 to-pink-500',
    gradient: 'from-purple-600 via-pink-600 to-purple-700',
    pdfUrl: '#',
    sections: [
      {
        id: 'executive-summary',
        title: 'Executive Summary',
        icon: FileText,
        subsections: [
          {
            id: 'mission',
            title: 'Our Mission',
            content: 'To empower underserved communities through education, mentorship, and resource access, creating lasting positive change.'
          },
          {
            id: 'company',
            title: 'The Organization & Leadership',
            content: 'Established in 2020, our organization is led by a diverse board of directors with expertise in education, community development, and nonprofit management.'
          }
        ]
      },
      {
        id: 'business',
        title: 'The Business',
        icon: Target,
        subsections: [
          {
            id: 'programs',
            title: 'Programs & Services',
            content: 'Three core programs: After-school tutoring, mentorship matching, and community resource center. Serving 500+ individuals annually.'
          },
          {
            id: 'impact',
            title: 'Impact Goals',
            content: 'Increase high school graduation rates by 25%, provide mentorship to 200 youth annually, and connect 300+ families with essential resources.'
          }
        ]
      },
      {
        id: 'services',
        title: 'Services',
        icon: Settings,
        subsections: [
          {
            id: 'program-delivery',
            title: 'Program Delivery',
            content: 'After-school programs Monday-Friday, weekend workshops, summer camps, and year-round mentorship support. Volunteer-driven with professional oversight.'
          },
          {
            id: 'partnerships',
            title: 'Community Partnerships',
            content: 'Strategic partnerships with local schools, businesses, government agencies, and other nonprofits to maximize impact and resource efficiency.'
          }
        ]
      },
      {
        id: 'market',
        title: 'Market Analysis',
        icon: TrendingUp,
        subsections: [
          {
            id: 'need',
            title: 'Community Need',
            content: 'Target community has 40% poverty rate, 30% high school dropout rate, and limited access to educational resources. Clear need for intervention and support.'
          },
          {
            id: 'stakeholders',
            title: 'Stakeholder Analysis',
            content: 'Primary stakeholders: Students, parents, schools, donors, volunteers, and community leaders. Each group has distinct needs and engagement strategies.'
          }
        ]
      },
      {
        id: 'strategy',
        title: 'Strategy',
        icon: BarChart3,
        subsections: [
          {
            id: 'fundraising',
            title: 'Fundraising Strategy',
            content: 'Diversified funding: 40% grants, 30% individual donations, 20% corporate sponsorships, 10% events. Annual fundraising goal: $500K.'
          },
          {
            id: 'growth',
            title: 'Growth Plan',
            content: 'Year 1: Strengthen existing programs. Year 2: Expand to second location. Year 3: Launch new program addressing food insecurity.'
          }
        ]
      },
      {
        id: 'operations',
        title: 'Operations',
        icon: Settings,
        subsections: [
          {
            id: 'staffing',
            title: 'Staffing & Volunteers',
            content: 'Team of 8 staff members plus 50+ active volunteers. Volunteer recruitment and retention program with training and recognition.'
          },
          {
            id: 'governance',
            title: 'Governance',
            content: 'Board of 12 directors with quarterly meetings. Committees for finance, programs, and development. Transparent reporting and accountability.'
          }
        ]
      },
      {
        id: 'financials',
        title: 'Financials',
        icon: DollarSign,
        subsections: [
          {
            id: 'budget',
            title: 'Budget & Funding',
            content: 'Annual budget: $500K. Program expenses: 70%, Administration: 20%, Fundraising: 10%. Maintain 6-month operating reserve.'
          },
          {
            id: 'sustainability',
            title: 'Financial Sustainability',
            content: 'Multi-year funding commitments, endowment building, earned revenue opportunities, and cost-sharing partnerships to ensure long-term sustainability.'
          }
        ]
      },
      {
        id: 'appendix',
        title: 'Appendix',
        icon: FileBarChart,
        subsections: [
          {
            id: 'financial-statements',
            title: 'Financial Statements',
            content: '3-year budget projections, funding sources breakdown, program cost analysis, and impact measurement framework.'
          },
          {
            id: 'evaluation',
            title: 'Evaluation Framework',
            content: 'Logic model, outcome indicators, data collection methods, and reporting templates for funders and stakeholders.'
          }
        ]
      }
    ]
  },
  'ecommerce': {
    id: 'ecommerce',
    title: 'E-commerce Store Plan',
    description: 'Comprehensive plan for launching an online retail business with logistics and marketing strategies.',
    fullDescription: 'This e-commerce business plan template is designed for online retailers and digital entrepreneurs.',
    category: 'Business Plan',
    industry: 'Retail',
    pages: 35,
    image: 'https://images.pexels.com/photos/230544/pexels-photo-230544.jpeg?auto=compress&cs=tinysrgb&w=1600',
    color: 'from-green-500 to-emerald-500',
    gradient: 'from-green-600 via-emerald-600 to-green-700',
    pdfUrl: '#',
    sections: [
      {
        id: 'executive-summary',
        title: 'Executive Summary',
        icon: FileText,
        subsections: [
          {
            id: 'mission',
            title: 'Our Mission',
            content: 'To provide customers with high-quality products through an exceptional online shopping experience, combining convenience, competitive pricing, and outstanding customer service.'
          },
          {
            id: 'company',
            title: 'The Company & Management',
            content: 'Founded in 2024, our e-commerce platform brings together experienced e-commerce professionals with expertise in digital marketing, logistics, and customer experience.'
          }
        ]
      },
      {
        id: 'business',
        title: 'The Business',
        icon: Target,
        subsections: [
          {
            id: 'concept',
            title: 'Business Model',
            content: 'Online retail platform specializing in curated product selection across multiple categories. Direct-to-consumer model with dropshipping and inventory management capabilities.'
          },
          {
            id: 'target',
            title: 'Target Market',
            content: 'Primary target: 25-45 year old consumers seeking quality products with convenient online shopping. Secondary: Small businesses purchasing in bulk.'
          }
        ]
      },
      {
        id: 'services',
        title: 'Services',
        icon: Settings,
        subsections: [
          {
            id: 'products',
            title: 'Product Offerings',
            content: 'Curated selection of products across home goods, electronics, fashion, and lifestyle categories. Focus on quality, value, and trending items.'
          },
          {
            id: 'pricing',
            title: 'Pricing Strategy',
            content: 'Competitive pricing with regular promotions. Membership program offering 10% discount and free shipping. Volume discounts for bulk purchases.'
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
            content: 'E-commerce market valued at $5T globally, growing at 10% annually. Shift to online shopping accelerated by convenience and competitive pricing.'
          },
          {
            id: 'competitive',
            title: 'Competitive Landscape',
            content: 'Competing with Amazon, eBay, and specialty retailers. Differentiation through curated selection, personalized service, and fast shipping.'
          }
        ]
      },
      {
        id: 'strategy',
        title: 'Strategy',
        icon: BarChart3,
        subsections: [
          {
            id: 'marketing',
            title: 'Marketing Strategy',
            content: 'Multi-channel approach: SEO, social media advertising, email marketing, influencer partnerships, and content marketing. Target $2M revenue in Year 1.'
          },
          {
            id: 'growth',
            title: 'Growth Plan',
            content: 'Year 1: Launch platform, acquire 5,000 customers. Year 2: Expand product lines, reach 20,000 customers. Year 3: International expansion.'
          }
        ]
      },
      {
        id: 'operations',
        title: 'Operations',
        icon: Settings,
        subsections: [
          {
            id: 'fulfillment',
            title: 'Fulfillment & Logistics',
            content: 'Partnership with fulfillment centers for storage and shipping. Average delivery time: 3-5 business days. Return policy with 30-day window.'
          },
          {
            id: 'technology',
            title: 'Technology Platform',
            content: 'E-commerce platform built on Shopify Plus. Integrated payment processing, inventory management, and customer relationship management systems.'
          }
        ]
      },
      {
        id: 'financials',
        title: 'Financials',
        icon: DollarSign,
        subsections: [
          {
            id: 'revenue',
            title: 'Revenue Projections',
            content: 'Year 1: $2M revenue (5,000 customers @ $400 average order value). Year 2: $8M with expanded product lines. Year 3: $20M with international sales.'
          },
          {
            id: 'costs',
            title: 'Cost Structure',
            content: 'Product costs: 60%, Marketing: 15%, Operations: 10%, Technology: 5%, Other: 10%. Target net margin: 15% by Year 2.'
          }
        ]
      },
      {
        id: 'appendix',
        title: 'Appendix',
        icon: FileBarChart,
        subsections: [
          {
            id: 'financial-statements',
            title: 'Financial Statements',
            content: '3-year financial projections, cash flow analysis, break-even calculations, and sensitivity analysis for key variables.'
          },
          {
            id: 'market-research',
            title: 'Market Research',
            content: 'Customer survey results, competitor analysis, industry trends, and supplier agreements.'
          }
        ]
      }
    ]
  },
  'consulting': {
    id: 'consulting',
    title: 'Consulting Firm Plan',
    description: 'Professional services business plan with client acquisition and service delivery strategies.',
    fullDescription: 'This business plan template is designed for consulting firms and professional service providers.',
    category: 'Business Plan',
    industry: 'Professional Services',
    pages: 36,
    image: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1600',
    color: 'from-slate-500 to-gray-600',
    gradient: 'from-slate-600 via-gray-600 to-slate-700',
    pdfUrl: '#',
    sections: [
      {
        id: 'executive-summary',
        title: 'Executive Summary',
        icon: FileText,
        subsections: [
          {
            id: 'mission',
            title: 'Our Mission',
            content: 'To help businesses achieve their strategic goals through expert consulting services, delivering measurable results and sustainable growth.'
          },
          {
            id: 'company',
            title: 'The Company & Management',
            content: 'Founded by experienced consultants with 30+ years combined experience. Team includes former executives from Fortune 500 companies and industry experts.'
          }
        ]
      },
      {
        id: 'business',
        title: 'The Business',
        icon: Target,
        subsections: [
          {
            id: 'services',
            title: 'Service Focus',
            content: 'Strategic planning, operational improvement, digital transformation, and change management consulting for mid-market and enterprise clients.'
          },
          {
            id: 'target',
            title: 'Target Clients',
            content: 'Mid-market companies ($10M-$500M revenue) seeking strategic guidance and operational improvements. Industries: Technology, Manufacturing, Healthcare.'
          }
        ]
      },
      {
        id: 'services',
        title: 'Services',
        icon: Settings,
        subsections: [
          {
            id: 'offerings',
            title: 'Service Offerings',
            content: 'Strategic planning workshops, process optimization, technology implementation, organizational development, and interim executive services.'
          },
          {
            id: 'pricing',
            title: 'Pricing Model',
            content: 'Project-based fees: $50K-$500K per engagement. Retainer agreements: $10K-$50K monthly. Hourly rates: $200-$500 depending on consultant level.'
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
            content: 'Management consulting market valued at $250B globally. Growing demand for digital transformation and strategic planning services.'
          },
          {
            id: 'competitive',
            title: 'Competitive Landscape',
            content: 'Competing with Big 4 firms and boutique consultancies. Differentiation through industry expertise, personalized service, and cost-effective solutions.'
          }
        ]
      },
      {
        id: 'strategy',
        title: 'Strategy',
        icon: BarChart3,
        subsections: [
          {
            id: 'sales',
            title: 'Sales & Business Development',
            content: 'Referral network, thought leadership content, speaking engagements, and direct outreach to target companies. Target 20 new clients annually.'
          },
          {
            id: 'growth',
            title: 'Growth Plan',
            content: 'Year 1: Establish brand, acquire 10 clients. Year 2: Expand team, 25 clients. Year 3: Open second office, 50 clients.'
          }
        ]
      },
      {
        id: 'operations',
        title: 'Operations',
        icon: Settings,
        subsections: [
          {
            id: 'team',
            title: 'Team Structure',
            content: 'Team of 8 consultants: 2 partners, 4 senior consultants, 2 associates. Plan to grow to 20 consultants by Year 3.'
          },
          {
            id: 'delivery',
            title: 'Service Delivery',
            content: 'Hybrid delivery model: On-site client work and remote collaboration. Project management methodology ensuring quality and timely delivery.'
          }
        ]
      },
      {
        id: 'financials',
        title: 'Financials',
        icon: DollarSign,
        subsections: [
          {
            id: 'revenue',
            title: 'Revenue Projections',
            content: 'Year 1: $2M revenue (10 clients @ $200K average). Year 2: $5M (25 clients). Year 3: $12M (50 clients) with expanded services.'
          },
          {
            id: 'costs',
            title: 'Cost Structure',
            content: 'Personnel: 60%, Marketing: 15%, Operations: 15%, Other: 10%. Target net margin: 25% by Year 2.'
          }
        ]
      },
      {
        id: 'appendix',
        title: 'Appendix',
        icon: FileBarChart,
        subsections: [
          {
            id: 'financial-statements',
            title: 'Financial Statements',
            content: '3-year financial projections, utilization rates, revenue per consultant analysis, and cash flow forecasts.'
          },
          {
            id: 'case-studies',
            title: 'Case Studies',
            content: 'Detailed case studies showcasing successful client engagements, methodologies, and measurable results achieved.'
          }
        ]
      }
    ]
  },
  'mobile-app': {
    id: 'mobile-app',
    title: 'Mobile App Startup',
    description: 'Complete business plan for mobile application with user acquisition and monetization strategies.',
    fullDescription: 'This business plan template is specifically designed for mobile app startups and developers.',
    category: 'Business Plan',
    industry: 'Technology',
    pages: 44,
    image: 'https://images.pexels.com/photos/607812/pexels-photo-607812.jpeg?auto=compress&cs=tinysrgb&w=1600',
    color: 'from-cyan-500 to-blue-500',
    gradient: 'from-cyan-600 via-blue-600 to-cyan-700',
    pdfUrl: '#',
    sections: [
      {
        id: 'executive-summary',
        title: 'Executive Summary',
        icon: FileText,
        subsections: [
          {
            id: 'mission',
            title: 'Our Mission',
            content: 'To create innovative mobile applications that solve real-world problems and enhance users\' daily lives through intuitive design and cutting-edge technology.'
          },
          {
            id: 'company',
            title: 'The Company & Management',
            content: 'Founded by experienced mobile developers and product managers with successful app launches. Team includes iOS, Android, and backend engineers.'
          }
        ]
      },
      {
        id: 'business',
        title: 'The Business',
        icon: Target,
        subsections: [
          {
            id: 'app-concept',
            title: 'App Concept',
            content: 'Fitness tracking app with AI-powered personalization, social features, and gamification. Combines workout planning, nutrition tracking, and community engagement.'
          },
          {
            id: 'target',
            title: 'Target Users',
            content: 'Primary: 18-35 year old fitness enthusiasts seeking personalized workout plans. Secondary: Health-conscious individuals starting their fitness journey.'
          }
        ]
      },
      {
        id: 'services',
        title: 'Services',
        icon: Settings,
        subsections: [
          {
            id: 'features',
            title: 'App Features',
            content: 'AI-powered workout recommendations, progress tracking, social sharing, nutrition logging, premium coaching content, and wearable device integration.'
          },
          {
            id: 'monetization',
            title: 'Monetization Strategy',
            content: 'Freemium model: Free basic features, Premium subscription at $9.99/month. In-app purchases for specialized programs. Affiliate partnerships with fitness brands.'
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
            content: 'Fitness app market valued at $4.6B, growing at 13% annually. 500M+ fitness app users globally with increasing demand for personalized solutions.'
          },
          {
            id: 'competitive',
            title: 'Competitive Landscape',
            content: 'Competing with MyFitnessPal, Strava, and Nike Training Club. Differentiation through AI personalization, social features, and affordable pricing.'
          }
        ]
      },
      {
        id: 'strategy',
        title: 'Strategy',
        icon: BarChart3,
        subsections: [
          {
            id: 'acquisition',
            title: 'User Acquisition',
            content: 'App Store Optimization, social media marketing, influencer partnerships, content marketing, and referral program. Target 100K downloads in Year 1.'
          },
          {
            id: 'growth',
            title: 'Growth Plan',
            content: 'Year 1: Launch MVP, acquire 100K users, 10% conversion to premium. Year 2: Add advanced features, 500K users. Year 3: International expansion, 2M users.'
          }
        ]
      },
      {
        id: 'operations',
        title: 'Operations',
        icon: Settings,
        subsections: [
          {
            id: 'development',
            title: 'Development & Technology',
            content: 'Native iOS and Android apps. Backend infrastructure on AWS. Agile development methodology with 2-week sprint cycles. Continuous integration and deployment.'
          },
          {
            id: 'team',
            title: 'Team Structure',
            content: 'Team of 10: 4 developers, 2 designers, 2 product managers, 1 marketing, 1 operations. Plan to scale to 25 by Year 2.'
          }
        ]
      },
      {
        id: 'financials',
        title: 'Financials',
        icon: DollarSign,
        subsections: [
          {
            id: 'revenue',
            title: 'Revenue Projections',
            content: 'Year 1: $1.2M revenue (10K premium subscribers @ $10/month). Year 2: $6M (50K subscribers). Year 3: $24M (200K subscribers) with additional revenue streams.'
          },
          {
            id: 'funding',
            title: 'Funding Requirements',
            content: 'Seeking $2M seed round for development, marketing, and team expansion. Use of funds: 50% development, 30% marketing, 20% operations.'
          }
        ]
      },
      {
        id: 'appendix',
        title: 'Appendix',
        icon: FileBarChart,
        subsections: [
          {
            id: 'financial-statements',
            title: 'Financial Statements',
            content: '3-year financial projections, user acquisition cost analysis, lifetime value calculations, and funding requirements breakdown.'
          },
          {
            id: 'technical',
            title: 'Technical Specifications',
            content: 'Architecture diagrams, API documentation, security measures, scalability plans, and technology stack details.'
          }
        ]
      }
    ]
  },
  'healthcare': {
    id: 'healthcare',
    title: 'Healthcare Clinic Plan',
    description: 'Comprehensive business plan for healthcare facilities with regulatory compliance, staffing, and financial projections.',
    fullDescription: 'This business plan template is designed for healthcare facilities including clinics, medical practices, and healthcare service providers.',
    category: 'Business Plan',
    industry: 'Healthcare',
    pages: 48,
    image: 'https://images.pexels.com/photos/40568/medical-appointment-doctor-healthcare-40568.jpeg?auto=compress&cs=tinysrgb&w=1600',
    color: 'from-teal-500 to-green-500',
    gradient: 'from-teal-600 via-green-600 to-teal-700',
    pdfUrl: '#',
    sections: [
      {
        id: 'executive-summary',
        title: 'Executive Summary',
        icon: FileText,
        subsections: [
          {
            id: 'mission',
            title: 'Our Mission',
            content: 'To provide accessible, high-quality healthcare services to our community, combining compassionate care with modern medical practices and technology.'
          },
          {
            id: 'company',
            title: 'The Organization & Leadership',
            content: 'Established by board-certified physicians with 25+ years combined clinical experience. Leadership team includes healthcare administrators and business professionals.'
          }
        ]
      },
      {
        id: 'business',
        title: 'The Business',
        icon: Target,
        subsections: [
          {
            id: 'practice',
            title: 'Practice Overview',
            content: 'Multi-specialty clinic offering primary care, preventive medicine, and specialized services. Focus on patient-centered care with extended hours and same-day appointments.'
          },
          {
            id: 'services',
            title: 'Services Offered',
            content: 'Primary care, preventive screenings, chronic disease management, minor procedures, lab services, and health education programs.'
          }
        ]
      },
      {
        id: 'services',
        title: 'Services',
        icon: Settings,
        subsections: [
          {
            id: 'clinical',
            title: 'Clinical Services',
            content: 'Comprehensive primary care, preventive health services, chronic disease management, women\'s health, pediatric care, and geriatric services.'
          },
          {
            id: 'pricing',
            title: 'Pricing & Reimbursement',
            content: 'Accept major insurance plans, Medicare, and Medicaid. Self-pay options with transparent pricing. Sliding fee scale for uninsured patients.'
          }
        ]
      },
      {
        id: 'market',
        title: 'Market Analysis',
        icon: TrendingUp,
        subsections: [
          {
            id: 'need',
            title: 'Community Need',
            content: 'Growing population with aging demographics and increasing demand for accessible healthcare. Current provider shortage in target area.'
          },
          {
            id: 'competitive',
            title: 'Competitive Landscape',
            content: '3 competing clinics in 5-mile radius. Differentiation through extended hours, same-day appointments, and patient-centered approach.'
          }
        ]
      },
      {
        id: 'strategy',
        title: 'Strategy',
        icon: BarChart3,
        subsections: [
          {
            id: 'marketing',
            title: 'Marketing & Patient Acquisition',
            content: 'Community outreach, physician referrals, insurance network participation, online presence, and patient satisfaction focus. Target 5,000 active patients in Year 1.'
          },
          {
            id: 'growth',
            title: 'Growth Plan',
            content: 'Year 1: Establish practice, build patient base. Year 2: Add specialty services. Year 3: Consider second location or expansion.'
          }
        ]
      },
      {
        id: 'operations',
        title: 'Operations',
        icon: Settings,
        subsections: [
          {
            id: 'staffing',
            title: 'Staffing & Credentialing',
            content: 'Team of 12: 3 physicians, 2 nurse practitioners, 2 nurses, 2 medical assistants, 2 front office, 1 administrator. All providers board-certified and credentialed.'
          },
          {
            id: 'facilities',
            title: 'Facilities & Equipment',
            content: '5,000 sq ft facility with 8 exam rooms, lab, procedure room, and administrative space. State-of-the-art medical equipment and EMR system.'
          }
        ]
      },
      {
        id: 'financials',
        title: 'Financials',
        icon: DollarSign,
        subsections: [
          {
            id: 'revenue',
            title: 'Revenue Projections',
            content: 'Year 1: $2.5M revenue (5,000 patients @ $500 average annual revenue). Year 2: $4M (8,000 patients). Year 3: $6M (12,000 patients) with expanded services.'
          },
          {
            id: 'costs',
            title: 'Cost Structure',
            content: 'Personnel: 50%, Supplies: 10%, Rent: 8%, Equipment: 5%, Other: 27%. Target net margin: 15% by Year 2.'
          }
        ]
      },
      {
        id: 'appendix',
        title: 'Appendix',
        icon: FileBarChart,
        subsections: [
          {
            id: 'financial-statements',
            title: 'Financial Statements',
            content: '3-year financial projections, reimbursement analysis, patient volume forecasts, and break-even analysis.'
          },
          {
            id: 'regulatory',
            title: 'Regulatory Compliance',
            content: 'Licensing requirements, accreditation plans, HIPAA compliance measures, and quality assurance protocols.'
          }
        ]
      }
    ]
  },
  'fitness': {
    id: 'fitness',
    title: 'Fitness Center Plan',
    description: 'Business plan for fitness centers and gyms with membership models, equipment planning, and marketing strategies.',
    fullDescription: 'This business plan template is designed for fitness centers, gyms, and wellness facilities.',
    category: 'Business Plan',
    industry: 'Fitness & Wellness',
    pages: 32,
    image: 'https://images.pexels.com/photos/416475/pexels-photo-416475.jpeg?auto=compress&cs=tinysrgb&w=1600',
    color: 'from-red-500 to-pink-500',
    gradient: 'from-red-600 via-pink-600 to-red-700',
    pdfUrl: '#',
    sections: [
      {
        id: 'executive-summary',
        title: 'Executive Summary',
        icon: FileText,
        subsections: [
          {
            id: 'mission',
            title: 'Our Mission',
            content: 'To inspire and empower individuals to achieve their fitness goals through state-of-the-art facilities, expert guidance, and a supportive community environment.'
          },
          {
            id: 'company',
            title: 'The Company & Management',
            content: 'Founded by fitness industry professionals with 15+ years experience. Management team includes certified trainers, business professionals, and operations experts.'
          }
        ]
      },
      {
        id: 'business',
        title: 'The Business',
        icon: Target,
        subsections: [
          {
            id: 'concept',
            title: 'Fitness Center Concept',
            content: 'Full-service fitness center with cardio equipment, strength training, group fitness classes, personal training, and wellness amenities.'
          },
          {
            id: 'target',
            title: 'Target Market',
            content: 'Primary: 25-55 year old fitness enthusiasts and beginners. Secondary: Corporate wellness programs and athletic teams.'
          }
        ]
      },
      {
        id: 'services',
        title: 'Services',
        icon: Settings,
        subsections: [
          {
            id: 'offerings',
            title: 'Service Offerings',
            content: '24/7 access, group fitness classes (yoga, spin, HIIT), personal training, nutrition counseling, locker rooms, and smoothie bar.'
          },
          {
            id: 'pricing',
            title: 'Membership Pricing',
            content: 'Basic: $29/month (gym access). Premium: $49/month (classes included). VIP: $99/month (personal training sessions). Corporate rates available.'
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
            content: 'Fitness industry valued at $96B globally. Growing health consciousness and demand for convenient, affordable fitness options.'
          },
          {
            id: 'competitive',
            title: 'Competitive Landscape',
            content: '2 competing gyms in area. Differentiation through modern equipment, group classes, personal training, and community atmosphere.'
          }
        ]
      },
      {
        id: 'strategy',
        title: 'Strategy',
        icon: BarChart3,
        subsections: [
          {
            id: 'marketing',
            title: 'Marketing Strategy',
            content: 'Grand opening event, social media marketing, referral program, corporate partnerships, and community engagement. Target 1,000 members in Year 1.'
          },
          {
            id: 'growth',
            title: 'Growth Plan',
            content: 'Year 1: Build membership base. Year 2: Add specialty programs. Year 3: Consider expansion or additional services.'
          }
        ]
      },
      {
        id: 'operations',
        title: 'Operations',
        icon: Settings,
        subsections: [
          {
            id: 'staffing',
            title: 'Staffing Plan',
            content: 'Team of 12: General manager, 4 trainers, 2 front desk, 2 class instructors, 2 maintenance, 1 nutritionist. 24/7 security and cleaning services.'
          },
          {
            id: 'equipment',
            title: 'Equipment & Facilities',
            content: '10,000 sq ft facility with cardio zone, strength training area, group fitness studio, personal training space, and amenities.'
          }
        ]
      },
      {
        id: 'financials',
        title: 'Financials',
        icon: DollarSign,
        subsections: [
          {
            id: 'revenue',
            title: 'Revenue Projections',
            content: 'Year 1: $600K revenue (1,000 members @ $50/month average). Year 2: $900K (1,500 members). Year 3: $1.2M (2,000 members) with additional services.'
          },
          {
            id: 'costs',
            title: 'Cost Structure',
            content: 'Personnel: 35%, Rent: 15%, Equipment: 10%, Marketing: 10%, Other: 30%. Target net margin: 20% by Year 2.'
          }
        ]
      },
      {
        id: 'appendix',
        title: 'Appendix',
        icon: FileBarChart,
        subsections: [
          {
            id: 'financial-statements',
            title: 'Financial Statements',
            content: '3-year financial projections, membership growth forecasts, break-even analysis, and equipment depreciation schedules.'
          },
          {
            id: 'equipment',
            title: 'Equipment List',
            content: 'Detailed equipment inventory, maintenance schedules, replacement plans, and vendor agreements.'
          }
        ]
      }
    ]
  },
  'education': {
    id: 'education',
    title: 'Educational Institution Plan',
    description: 'Strategic plan for educational institutions with curriculum development, enrollment strategies, and financial sustainability.',
    fullDescription: 'This strategic plan template is designed for educational institutions including schools, training centers, and educational programs.',
    category: 'Strategic Plan',
    industry: 'Education',
    pages: 46,
    image: 'https://images.pexels.com/photos/159775/library-la-trobe-study-students-159775.jpeg?auto=compress&cs=tinysrgb&w=1600',
    color: 'from-indigo-500 to-purple-500',
    gradient: 'from-indigo-600 via-purple-600 to-indigo-700',
    pdfUrl: '#',
    sections: [
      {
        id: 'executive-summary',
        title: 'Executive Summary',
        icon: FileText,
        subsections: [
          {
            id: 'mission',
            title: 'Our Mission',
            content: 'To provide exceptional educational experiences that prepare students for success in their chosen fields, fostering critical thinking, creativity, and lifelong learning.'
          },
          {
            id: 'company',
            title: 'The Institution & Leadership',
            content: 'Established educational institution with experienced faculty and administrators. Leadership team includes educators, curriculum specialists, and business professionals.'
          }
        ]
      },
      {
        id: 'business',
        title: 'The Business',
        icon: Target,
        subsections: [
          {
            id: 'programs',
            title: 'Educational Programs',
            content: 'Comprehensive curriculum offering certificate programs, diploma courses, and continuing education. Focus on practical skills and industry-relevant training.'
          },
          {
            id: 'target',
            title: 'Target Students',
            content: 'Primary: Recent high school graduates and career changers. Secondary: Working professionals seeking skill enhancement and continuing education.'
          }
        ]
      },
      {
        id: 'services',
        title: 'Services',
        icon: Settings,
        subsections: [
          {
            id: 'offerings',
            title: 'Program Offerings',
            content: 'Certificate programs in technology, business, healthcare, and trades. Flexible scheduling: full-time, part-time, evening, and online options.'
          },
          {
            id: 'pricing',
            title: 'Tuition & Fees',
            content: 'Tuition: $5,000-$15,000 per program depending on length. Financial aid available. Payment plans and scholarship opportunities.'
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
            content: 'Growing demand for skilled workers and career-focused education. Increasing need for retraining and upskilling in changing job market.'
          },
          {
            id: 'competitive',
            title: 'Competitive Landscape',
            content: 'Competing with community colleges, trade schools, and online platforms. Differentiation through hands-on training, industry partnerships, and job placement support.'
          }
        ]
      },
      {
        id: 'strategy',
        title: 'Strategy',
        icon: BarChart3,
        subsections: [
          {
            id: 'enrollment',
            title: 'Enrollment Strategy',
            content: 'High school partnerships, career fairs, online marketing, referral program, and community outreach. Target 500 students in Year 1.'
          },
          {
            id: 'growth',
            title: 'Growth Plan',
            content: 'Year 1: Establish programs and build enrollment. Year 2: Add new program offerings. Year 3: Expand facilities or add second location.'
          }
        ]
      },
      {
        id: 'operations',
        title: 'Operations',
        icon: Settings,
        subsections: [
          {
            id: 'faculty',
            title: 'Faculty & Staffing',
            content: 'Team of 25: 15 instructors, 5 administrators, 3 support staff, 2 career services. All instructors industry-certified with teaching experience.'
          },
          {
            id: 'facilities',
            title: 'Facilities & Resources',
            content: '15,000 sq ft facility with classrooms, labs, library, student lounge, and administrative offices. Modern equipment and technology infrastructure.'
          }
        ]
      },
      {
        id: 'financials',
        title: 'Financials',
        icon: DollarSign,
        subsections: [
          {
            id: 'revenue',
            title: 'Revenue Projections',
            content: 'Year 1: $3M revenue (500 students @ $6K average tuition). Year 2: $5M (800 students). Year 3: $7.5M (1,200 students) with expanded programs.'
          },
          {
            id: 'costs',
            title: 'Cost Structure',
            content: 'Personnel: 50%, Facilities: 15%, Equipment: 10%, Marketing: 10%, Other: 15%. Target net margin: 20% by Year 2.'
          }
        ]
      },
      {
        id: 'appendix',
        title: 'Appendix',
        icon: FileBarChart,
        subsections: [
          {
            id: 'financial-statements',
            title: 'Financial Statements',
            content: '3-year financial projections, enrollment forecasts, tuition revenue analysis, and break-even calculations.'
          },
          {
            id: 'curriculum',
            title: 'Curriculum Details',
            content: 'Detailed course descriptions, learning objectives, accreditation information, and industry partnership agreements.'
          }
        ]
      }
    ]
  }
};

export default function ExamplePlanDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, theme } = useTheme();
  const [activeSection, setActiveSection] = useState('executive-summary');
  const [isPdfOpen, setIsPdfOpen] = useState(false);
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});

  const plan = id ? examplePlanDetails[id] : null;

  useEffect(() => {
    if (!plan) {
      navigate('/example-plans');
      return;
    }
    window.scrollTo(0, 0);
  }, [id, plan, navigate]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.3, rootMargin: '-100px 0px -60% 0px' }
    );

    Object.values(sectionRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [plan]);

  const scrollToSection = (sectionId: string) => {
    const element = sectionRefs.current[sectionId];
    if (element) {
      const offset = 120;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  if (!plan) {
    return null;
  }

  const navSections = [
    { id: 'cover', title: 'Cover', icon: FileText },
    { id: 'contents', title: 'Contents', icon: BookOpen },
    ...plan.sections.map(s => ({ id: s.id, title: s.title, icon: s.icon }))
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Header />
      <div className="pt-20 flex">
        {/* Sidebar Navigation */}
        <aside className="fixed left-0 top-20 bottom-0 w-64 bg-white dark:bg-gray-800 border-r-2 border-gray-300 dark:border-gray-700 overflow-y-auto z-30">
          <div className="p-6">
            <Link
              to="/example-plans"
              className="flex items-center gap-2 text-gray-900 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 mb-8 transition-colors pb-6 border-b-2 border-gray-200 dark:border-gray-700"
            >
              <ArrowLeft size={18} />
              <span className="text-sm font-semibold uppercase tracking-wide">{t('examplePlanDetail.back')}</span>
            </Link>

            <div className="space-y-2">
              {navSections.map((section, index) => {
                const isActive = activeSection === section.id || (section.id === 'cover' && !activeSection);
                return (
                  <button
                    key={section.id}
                    onClick={() => {
                      if (section.id === 'cover') {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      } else if (section.id === 'contents') {
                        scrollToSection(plan.sections[0].id);
                      } else {
                        scrollToSection(section.id);
                      }
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded transition-all text-left ${
                      isActive
                        ? 'bg-gray-900 dark:bg-gray-700 text-white border-l-4 border-green-600'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 border-l-4 border-transparent'
                    }`}
                    style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
                  >
                    <section.icon size={18} className="flex-shrink-0" />
                    <span className={`text-sm flex-1 ${isActive ? 'font-semibold' : 'font-medium'}`}>{section.title}</span>
                    {index > 1 && (
                      <span className={`text-xs font-mono ${isActive ? 'text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>{index - 1}</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* CTA Button */}
            <div className="mt-8 pt-8 border-t-2 border-gray-200 dark:border-gray-700">
              <Link
                to="/register"
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg"
              >
                <span>{t('examplePlanDetail.cta.startFree')}</span>
              </Link>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 ml-64">
          {/* Cover Section */}
          <section className="relative bg-gray-900 dark:bg-gray-950 border-b-8 border-green-600">
            <div className="relative py-24 px-8">
              <div className="max-w-5xl mx-auto">
                <div className="mb-6">
                  <span className="inline-block px-4 py-2 bg-green-600 text-white text-xs font-semibold uppercase tracking-wider rounded">
                    {plan.category}
                  </span>
                </div>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-white mb-6 leading-tight" style={{ fontFamily: 'Georgia, serif' }}>
                  {plan.title}
                </h1>
                <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-3xl leading-relaxed" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                  {plan.fullDescription}
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => setIsPdfOpen(true)}
                    className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg"
                  >
                    <Eye size={20} />
                    <span>{t('examplePlanDetail.viewPlan')}</span>
                  </button>
                  {plan.pdfUrl && (
                    <a
                      href={plan.pdfUrl}
                      download
                      className="px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white border-2 border-gray-700 font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
                    >
                      <Download size={20} />
                      <span>{t('examplePlanDetail.downloadPDF')}</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Content Sections */}
          <div className="bg-white dark:bg-gray-900">
            {plan.sections.map((section, sectionIndex) => (
              <section
                key={section.id}
                id={section.id}
                ref={(el) => (sectionRefs.current[section.id] = el)}
                className="py-20 px-8 max-w-4xl mx-auto border-b border-gray-200 dark:border-gray-800 last:border-b-0"
              >
                {/* Chapter Header */}
                <div className="mb-12 pb-8 border-b-2 border-gray-300 dark:border-gray-700">
                  <div className="flex items-start gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-gray-900 dark:bg-gray-800 rounded-lg flex items-center justify-center border-2 border-gray-300 dark:border-gray-600">
                        <span className="text-2xl font-serif text-white font-bold" style={{ fontFamily: 'Georgia, serif' }}>
                          {sectionIndex + 1}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 pt-2">
                      <div className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2 font-semibold">
                        Chapter {sectionIndex + 1}
                      </div>
                      <h2 className="text-3xl md:text-4xl font-serif text-gray-900 dark:text-white leading-tight" style={{ fontFamily: 'Georgia, serif' }}>
                        {section.title}
                      </h2>
                    </div>
                  </div>
                </div>

                {/* Subsections */}
                <div className="space-y-12">
                  {section.subsections.map((subsection, subIndex) => (
                    <div key={subsection.id} className="relative pl-8 border-l-2 border-gray-200 dark:border-gray-700">
                      <div className="absolute -left-2 top-0 w-4 h-4 bg-green-600 rounded-full border-2 border-white dark:border-gray-900"></div>
                      <div className="mb-4">
                        <span className="text-xs font-mono text-gray-400 dark:text-gray-500 font-semibold tracking-wider">
                          {sectionIndex + 1}.{subIndex + 1}
                        </span>
                      </div>
                      <h3 className="text-2xl md:text-3xl font-serif text-gray-900 dark:text-white mb-5 leading-tight" style={{ fontFamily: 'Georgia, serif' }}>
                        {subsection.title}
                      </h3>
                      {Array.isArray(subsection.content) ? (
                        <ul className="space-y-4">
                          {subsection.content.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-4 text-gray-700 dark:text-gray-300 leading-relaxed text-base" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                              <div className="flex-shrink-0 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center mt-0.5">
                                <span className="text-white text-xs font-bold">✓</span>
                              </div>
                              <span className="flex-1">{item}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                          {subsection.content}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            ))}

            {/* CTA Section */}
            <div className="mt-32 bg-gray-900 dark:bg-gray-950 border-t-8 border-green-600 mx-8 mb-16 rounded-lg overflow-hidden">
              <div className="p-12 text-center">
                <h3 className="text-3xl lg:text-4xl font-serif text-white mb-4" style={{ fontFamily: 'Georgia, serif' }}>
                  {t('examplePlanDetail.cta.title')}
                </h3>
                <p className="text-gray-300 text-lg mb-10 max-w-2xl mx-auto leading-relaxed" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                  {t('examplePlanDetail.cta.subtitle')}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    to="/register"
                    className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {t('examplePlanDetail.cta.startFree')}
                  </Link>
                  <Link
                    to="/example-plans"
                    className="px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white border-2 border-gray-700 font-semibold rounded-lg transition-all duration-300"
                  >
                    {t('examplePlanDetail.cta.viewMore')}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      <Footer />
      <TemplateViewer
        isOpen={isPdfOpen}
        onClose={() => setIsPdfOpen(false)}
        pdfUrl={plan.pdfUrl || '#'}
        title={plan.title}
      />
    </div>
  );
}
