// Site-wide settings for the blog build. Edit here, not in the templates.

export const SITE = {
  name: 'Edebo',
  url: 'https://edebo.in', // no trailing slash
  blogTitle: 'Edebo Blog',
  blogTagline: '3D imaging, measurement and practice growth for aesthetic clinics.',
  blogDescription:
    'Guides on 3D facial and body imaging, before-and-after measurement, patient consent and clinic growth for dermatologists, plastic surgeons and aesthetic clinics in India.',
  locale: 'en_IN',
  lang: 'en-IN',
  defaultAuthor: 'Edebo Team',
  ogImage: '/og-image.jpg',
  waitlistUrl: '/#waitlist',
  email: 'support@edebo.in',
  disclaimer: 'Edebo is a measurement and visualisation tool, not a diagnostic device.',
  appStore: 'https://apps.apple.com/in/app/edebo/id6775137253',
  playStore: 'https://play.google.com/store/apps/details?id=com.edebo.app&hl=en_IN',
  instagram: 'https://www.instagram.com/edebo.in',
  linkedin: 'https://www.linkedin.com/company/edeboin',
};

// Allowed categories. A post's `category` must be one of these keys.
// The key becomes the URL: /blog/category/<key>/
export const CATEGORIES = {
  '3d-imaging': {
    name: '3D Imaging',
    description: 'How 3D facial and body imaging works, how accurate it is and how to choose a system.',
  },
  'before-and-after': {
    name: 'Before and After',
    description: 'Standardised clinical photography, follow-up tracking and measuring results in millimetres.',
  },
  treatments: {
    name: 'Treatments',
    description: 'Using 3D measurement for fillers, hair restoration, body contouring, skin and surgical planning.',
  },
  'clinic-growth': {
    name: 'Clinic Growth',
    description: 'Consultation conversion, retention, packages and operations for aesthetic practices.',
  },
  'privacy-and-compliance': {
    name: 'Privacy and Compliance',
    description: 'Patient consent, the DPDP Act and safe handling of clinical images in India.',
  },
  industry: {
    name: 'Industry',
    description: 'For aesthetic pharma companies, device makers and clinic software platforms.',
  },
};

// Non-blog pages that must stay in sitemap.xml (the build rewrites the file).
// Update lastmod when you change one of these pages.
export const STATIC_PAGES = [
  { loc: '/', lastmod: '2026-10-30', changefreq: 'weekly', priority: '1.0' },
  { loc: '/privacy.html', lastmod: '2026-10-30', changefreq: 'yearly', priority: '0.3' },
  { loc: '/terms.html', lastmod: '2026-10-30', changefreq: 'yearly', priority: '0.3' },
];

export const WORDS_PER_MINUTE = 220;
