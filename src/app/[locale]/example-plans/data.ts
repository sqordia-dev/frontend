export interface ExamplePlan {
  id: string;
  title: string;
  description: string;
  category: string;
  industry: string;
  pages: number;
  image: string;
  color: string;
  features: string[];
  pdfUrl?: string;
}

export const examplePlans: ExamplePlan[] = [
  {
    id: 'tech-startup',
    title: 'Tech Startup Business Plan',
    description:
      'Complete SaaS business plan with market analysis, financial projections, and growth strategy. Perfect for technology startups seeking investment.',
    category: 'Business Plan',
    industry: 'Technology',
    pages: 42,
    image:
      'https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?auto=compress&cs=tinysrgb&w=800',
    color: 'from-blue-500 to-cyan-500',
    features: ['Market Analysis', '5-Year Projections', 'Investor Ready', 'SWOT Analysis'],
    pdfUrl: '#',
  },
  {
    id: 'restaurant',
    title: 'Restaurant Business Plan',
    description:
      'Detailed plan for opening a new restaurant with menu planning, cost analysis, and marketing strategy. Includes location analysis and operational planning.',
    category: 'Business Plan',
    industry: 'Food & Beverage',
    pages: 38,
    image:
      'https://images.pexels.com/photos/941869/pexels-photo-941869.jpeg?auto=compress&cs=tinysrgb&w=800',
    color: 'from-orange-500 to-red-500',
    features: ['Menu Strategy', 'Location Analysis', 'Cost Breakdown', 'Marketing Plan'],
    pdfUrl: '#',
  },
  {
    id: 'ecommerce',
    title: 'E-commerce Store Plan',
    description:
      'Comprehensive plan for launching an online retail business with logistics and marketing strategies. Includes digital marketing and supply chain management.',
    category: 'Business Plan',
    industry: 'Retail',
    pages: 35,
    image:
      'https://images.pexels.com/photos/230544/pexels-photo-230544.jpeg?auto=compress&cs=tinysrgb&w=800',
    color: 'from-orange-500 to-amber-500',
    features: ['Digital Marketing', 'Supply Chain', 'Sales Forecast', 'Customer Acquisition'],
    pdfUrl: '#',
  },
  {
    id: 'nonprofit',
    title: 'Nonprofit Strategic Plan',
    description:
      'Strategic plan for nonprofit organizations with funding strategies and impact measurement. Designed for grant applications and donor engagement.',
    category: 'Strategic Plan',
    industry: 'Nonprofit',
    pages: 40,
    image:
      'https://images.pexels.com/photos/6646918/pexels-photo-6646918.jpeg?auto=compress&cs=tinysrgb&w=800',
    color: 'from-purple-500 to-pink-500',
    features: ['Grant Strategy', 'Impact Goals', 'Budget Planning', 'Mission Alignment'],
    pdfUrl: '#',
  },
  {
    id: 'consulting',
    title: 'Consulting Firm Plan',
    description:
      'Professional services business plan with client acquisition and service delivery strategies. Includes pricing models and growth projections.',
    category: 'Business Plan',
    industry: 'Professional Services',
    pages: 36,
    image:
      'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800',
    color: 'from-slate-500 to-gray-600',
    features: ['Service Model', 'Pricing Strategy', 'Client Pipeline', 'Revenue Projections'],
    pdfUrl: '#',
  },
  {
    id: 'mobile-app',
    title: 'Mobile App Startup',
    description:
      'Complete business plan for mobile application with user acquisition and monetization strategies. Includes tech stack and development roadmap.',
    category: 'Business Plan',
    industry: 'Technology',
    pages: 44,
    image:
      'https://images.pexels.com/photos/607812/pexels-photo-607812.jpeg?auto=compress&cs=tinysrgb&w=800',
    color: 'from-cyan-500 to-blue-500',
    features: ['User Growth', 'Monetization', 'Tech Stack', 'Market Entry'],
    pdfUrl: '#',
  },
  {
    id: 'healthcare',
    title: 'Healthcare Clinic Plan',
    description:
      'Comprehensive business plan for healthcare facilities with regulatory compliance, staffing, and financial projections.',
    category: 'Business Plan',
    industry: 'Healthcare',
    pages: 48,
    image:
      'https://images.pexels.com/photos/40568/medical-appointment-doctor-healthcare-40568.jpeg?auto=compress&cs=tinysrgb&w=800',
    color: 'from-teal-500 to-orange-500',
    features: ['Regulatory Compliance', 'Staffing Plan', 'Financial Projections', 'Patient Acquisition'],
    pdfUrl: '#',
  },
  {
    id: 'fitness',
    title: 'Fitness Center Plan',
    description:
      'Business plan for fitness centers and gyms with membership models, equipment planning, and marketing strategies.',
    category: 'Business Plan',
    industry: 'Fitness & Wellness',
    pages: 32,
    image:
      'https://images.pexels.com/photos/416475/pexels-photo-416475.jpeg?auto=compress&cs=tinysrgb&w=800',
    color: 'from-red-500 to-pink-500',
    features: ['Membership Model', 'Equipment Planning', 'Marketing Strategy', 'Revenue Streams'],
    pdfUrl: '#',
  },
  {
    id: 'education',
    title: 'Educational Institution Plan',
    description:
      'Strategic plan for educational institutions with curriculum development, enrollment strategies, and financial sustainability.',
    category: 'Strategic Plan',
    industry: 'Education',
    pages: 46,
    image:
      'https://images.pexels.com/photos/159775/library-la-trobe-study-students-159775.jpeg?auto=compress&cs=tinysrgb&w=800',
    color: 'from-indigo-500 to-purple-500',
    features: ['Curriculum Development', 'Enrollment Strategy', 'Financial Sustainability', 'Growth Plan'],
    pdfUrl: '#',
  },
];

export const categories = ['All', 'Business Plan', 'Strategic Plan'];
export const industries = [
  'All',
  'Technology',
  'Food & Beverage',
  'Retail',
  'Nonprofit',
  'Professional Services',
  'Healthcare',
  'Fitness & Wellness',
  'Education',
];

export function getExamplePlanById(id: string): ExamplePlan | undefined {
  return examplePlans.find((plan) => plan.id === id);
}

export function getAllExamplePlanIds(): string[] {
  return examplePlans.map((plan) => plan.id);
}
