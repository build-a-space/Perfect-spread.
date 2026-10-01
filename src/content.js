'use strict';

/*
 * All business content lives here so the site can be updated without touching
 * templates. Facts below come from perfectspread.org, the Isle of Wight County
 * Economic Development directory and Virginia Living (July 2026).
 *
 * Package inclusions marked `confirm: true` were extrapolated from the Basic and
 * Cabana packages — have Ashlie confirm them before launch.
 */

const business = {
  name: 'Perfect Spread',
  legalName: 'Perfect Spread',
  tagline: 'Luxury picnics & styled experiences in Hampton Roads',
  shortPitch: 'You choose the occasion and the aesthetic. We plan, style, set up and clean up — you simply arrive.',
  founder: 'Ashlie Hampton',
  founderTitle: 'Founder & Picnic Curator',
  email: 'ashlie@perfectspread.org',
  phone: '+12028342976',
  phoneDisplay: '(202) 834-2976',
  city: 'Smithfield',
  region: 'VA',
  postalCode: '23314',
  country: 'US',
  geo: { lat: 36.9824, lng: -76.6311 },
  priceRange: '$200–$500+',
  social: {
    // Add real profile URLs here; they are rendered in the footer and in JSON-LD sameAs.
    instagram: '',
    facebook: '',
    tiktok: '',
  },
  credentials: [
    { label: 'As featured in', name: 'Virginia Living', detail: 'Picnic experiences around Virginia, July 2026' },
    { label: 'Listed by', name: 'Isle of Wight County', detail: 'Economic Development business directory' },
  ],
};

const policies = {
  duration: '2 hours',
  baseGuests: 2,
  extraGuest: 35,
  maxStandardGuests: 8,
  deposit: '50%',
  balanceDue: '5 days before your event',
  responseTime: '24 hours',
  dateHold: '48 hours',
};

const bookingSteps = [
  { title: 'Choose your experience', text: 'Browse packages or tell us the occasion — we’ll suggest the right fit.' },
  { title: 'Send an inquiry', text: `Share your date, guest count and vibe. We reply within ${policies.responseTime}.` },
  { title: 'Receive your quote', text: `We’ll send details and hold your date for ${policies.dateHold} while you decide.` },
  { title: 'Reserve with 50%', text: `A ${policies.deposit} deposit locks it in. The balance is due ${policies.balanceDue}.` },
  { title: 'Arrive & enjoy', text: 'Walk up to a finished setup. When you’re done, we handle every bit of cleanup.' },
];

// Shared inclusions (from the published Basic Picnic package).
const basicIncludes = [
  '2 hours of picnic time for two',
  'Picnic table & poufs',
  'Dishes, cups & flatware',
  'Rugs & styled décor',
  'LED candles',
  'Bluetooth speaker',
  'Seasonal fruit-infused water',
  'Custom chalkboard message',
  'Your choice of theme',
];

const packages = [
  {
    slug: 'basic-picnic',
    name: 'Basic Picnic',
    price: 200,
    mood: 'picnic',
    art: 'picnic',
    blurb: 'Our signature low-table spread — everything you need for a beautiful two-hour escape.',
    includes: basicIncludes.map((i) => (i === 'Your choice of theme' ? 'Choice of theme (excluding Christmas)' : i)),
  },
  {
    slug: 'teepee-picnic',
    name: 'Teepee Picnic',
    price: 300,
    mood: 'celebrate',
    art: 'teepee',
    blurb: 'A draped canvas teepee frames the table for a dreamy, photo-ready hideaway.',
    includes: ['Styled canvas teepee', ...basicIncludes, 'Small charcuterie box or desserts'],
    confirm: true,
  },
  {
    slug: 'cabana-picnic',
    name: 'Cabana Picnic',
    price: 300,
    mood: 'celebrate',
    art: 'cabana',
    blurb: 'Flowing cabana curtains, layered rugs and soft light — a resort moment anywhere.',
    includes: [
      'Cabana with draped curtains',
      'Table & seating',
      'Dishes & rugs',
      'Styled décor',
      'LED candles & lighting',
      'Bluetooth speaker',
      'Fruit-infused water',
      'Small charcuterie box or desserts',
      'Custom chalkboard message',
      'Your choice of theme',
    ],
  },
  {
    slug: 'egg-chair-experience',
    name: 'Egg Chair Experience',
    price: 300,
    mood: 'picnic',
    art: 'eggchair',
    blurb: 'Hanging egg chairs turn your spread into a lounge — made for slow sips and photos.',
    includes: ['Hanging egg chair seating', ...basicIncludes],
    confirm: true,
  },
  {
    slug: 'igloo-picnic',
    name: 'Igloo Picnic',
    price: 350,
    mood: 'romance',
    art: 'igloo',
    blurb: 'A clear dome glowing with string lights — cozy in any season, magical after dark.',
    includes: ['Clear igloo dome with string lights', ...basicIncludes, 'Plush throws & pillows'],
    confirm: true,
  },
  {
    slug: 'haunted-picnic',
    name: 'Haunted Picnic',
    price: 300,
    mood: 'romance',
    art: 'haunted',
    blurb: 'Candlelit, moody and a little spooky — our seasonal favorite for October nights.',
    includes: ['Haunted / Halloween styling', ...basicIncludes.filter((i) => i !== 'Your choice of theme'), 'Seasonal treats'],
    seasonal: 'Fall season',
    confirm: true,
  },
  {
    slug: 'senior-photo-package',
    name: 'Senior Photo Package',
    price: 400,
    mood: 'celebrate',
    art: 'photo',
    blurb: 'A fully styled set designed for senior portraits — bring the grad, we bring the backdrop.',
    includes: ['Styled photo set in your school colors', 'Signage & personalized details', 'Florals & décor', 'Setup and breakdown'],
    confirm: true,
  },
  {
    slug: 'proposal-picnic',
    name: 'Proposal Picnic',
    price: 500,
    mood: 'romance',
    art: 'proposal',
    blurb: 'The setting for your question. Candles, florals, signage and photography coordination.',
    includes: [
      'Romantic proposal styling',
      'Candle & floral details',
      'Marry Me signage',
      'Photography coordination',
      'Discreet setup & timing plan',
      ...basicIncludes.slice(1, 7),
    ],
    confirm: true,
  },
];

const addOns = [
  { name: 'Gourmet picnic catering', icon: 'food' },
  { name: 'Charcuterie & dessert boards', icon: 'board' },
  { name: 'Beverage service', icon: 'glass' },
  { name: 'Live music', icon: 'music' },
  { name: 'Photography', icon: 'camera' },
  { name: 'Custom themes & florals', icon: 'flower' },
];

const occasions = [
  'Anniversaries', 'First dates', 'Engagements', 'Birthdays', 'Bridal showers', 'Baby showers',
  'Bachelorette parties', 'Graduations', 'Corporate events', 'Brunches', 'Paint & sip', 'Movie nights',
  'Yoga & meditation', 'Holiday events', 'Promposals', 'Gender reveals', 'Dog dates', 'Divorce parties',
];

// Occasion choices shown in the inquiry forms.
const inquiryOccasions = ['Romantic picnic', 'Proposal', 'Anniversary', 'Date night', 'Birthday', 'Bridal shower', 'Baby shower', 'Bachelorette', 'Graduation / senior photos', 'Engagement party', 'Family gathering', 'Corporate event', 'Wedding / event planning', 'Other'];

const themes = ['Romantic blush', 'Boho neutral', 'Garden party', 'Modern minimal', 'Candlelit evening', 'Seasonal & holiday'];

/*
 * The three homepage "moods". Scrolling the homepage morphs the whole site
 * between them. Each service page renders in its mood.
 */
const moods = {
  picnic: {
    key: 'picnic',
    eyebrow: 'Luxury picnic experiences',
    title: ['Extraordinary', 'moments outdoors'],
    script: 'Extraordinary',
    lede: 'Waterfront sunsets, low tables and plush cushions — beautifully styled picnics for life’s most special occasions.',
    cta: { label: 'Plan your picnic', href: '/contact?experience=Luxury%20picnic' },
    link: '/services/luxury-picnics',
    label: 'Picnics',
  },
  celebrate: {
    key: 'celebrate',
    eyebrow: 'Weddings, showers & celebrations',
    title: ['Celebrate', 'every chapter'],
    script: 'Celebrate',
    lede: 'Wedding events, bridal showers, birthdays and gatherings — airy, elegant tablescapes under a floral arch for the people you love most.',
    cta: { label: 'Plan your celebration', href: '/contact?experience=Celebration' },
    link: '/services/bridal-shower-picnics',
    label: 'Celebrations',
  },
  romance: {
    key: 'romance',
    eyebrow: 'Romantic evenings & proposals',
    title: ['Create', 'unforgettable nights'],
    script: 'Candlelit',
    lede: 'String lights, a hundred candles and the person who matters most. Date nights, anniversaries and the question.',
    cta: { label: 'Plan your evening', href: '/contact?experience=Romantic%20evening' },
    link: '/services/proposal-picnics',
    label: 'Romance',
  },
};

/*
 * Services. Each becomes /services/:slug and is combined with every area for
 * /services/:slug/:area landing pages.
 */
const services = [
  {
    slug: 'luxury-picnics', name: 'Luxury Picnics', mood: 'picnic',
    tagline: 'The original Perfect Spread experience.',
    intro: 'A luxury picnic is a fully styled outdoor dining experience — low table, plush cushions, layered rugs, real dishware, candles and music — set up before you arrive and cleared away after you leave. No hauling, no folding, no cleanup.',
    highlights: ['Fully set up before you arrive', 'Real tableware, rugs & décor', 'Themes styled to your vibe', 'Cleanup included'],
    packages: ['basic-picnic', 'cabana-picnic', 'teepee-picnic'],
    faq: [['What is a luxury picnic?', 'It’s a done-for-you outdoor dining experience. We bring and style everything — table, seating, dishes, décor, candles and music — then pack it all up when you’re finished.']],
  },
  {
    slug: 'romantic-picnics', name: 'Romantic Picnics', mood: 'romance',
    tagline: 'Slow down, look up, stay a while.',
    intro: 'Candlelight, soft music and a table set just for two. Our romantic picnics are designed for reconnecting — whether it’s a Tuesday night surprise or a celebration years in the making.',
    highlights: ['Intimate two-person setups', 'Candles, florals & rose details', 'Golden-hour or after-dark timing', 'Custom chalkboard message'],
    packages: ['basic-picnic', 'igloo-picnic', 'proposal-picnic'],
    faq: [['What time is best for a romantic picnic?', 'Golden hour — the hour before sunset — gives the most beautiful light. After dark, our candlelit and igloo setups really glow.']],
  },
  {
    slug: 'proposal-picnics', name: 'Proposal Picnics', mood: 'romance',
    tagline: 'The setting for your question.',
    intro: 'You bring the ring; we create the moment. Proposal picnics include romantic styling, signage, candles and florals, with photography coordinated so the yes is captured forever. We plan timing and logistics so the surprise stays a surprise.',
    highlights: ['Discreet setup & timing plan', 'Marry Me signage & florals', 'Photography coordination', 'Stay-on-site options for celebrations after'],
    packages: ['proposal-picnic', 'igloo-picnic', 'cabana-picnic'],
    faq: [['How do you keep the proposal a surprise?', 'We coordinate the setup window and arrival time with you privately, and can text you the moment everything is ready so you can walk up together.']],
  },
  {
    slug: 'anniversary-picnics', name: 'Anniversary Picnics', mood: 'romance',
    tagline: 'Another year, beautifully marked.',
    intro: 'Celebrate the years together somewhere new — a waterfront table at sunset, your wedding colors, a chalkboard with your date. Anniversary picnics are personal by design.',
    highlights: ['Styled in your wedding colors', 'Personal chalkboard message', 'Dessert & charcuterie options', 'Photographer add-on'],
    packages: ['basic-picnic', 'cabana-picnic', 'igloo-picnic'],
    faq: [['Can you recreate our wedding colors or theme?', 'Yes — share photos or a palette in your inquiry and we’ll style the table around them.']],
  },
  {
    slug: 'date-night-picnics', name: 'Date Night Picnics', mood: 'romance',
    tagline: 'Upgrade dinner-and-a-movie.',
    intro: 'From first dates to fiftieth, a styled picnic is the date night people actually remember. Add a movie-night setup, music or a gourmet dinner and make an evening of it.',
    highlights: ['Perfect for first dates', 'Movie-night setups available', 'Gourmet catering add-on', 'Lighting for after-dark dates'],
    packages: ['basic-picnic', 'egg-chair-experience', 'igloo-picnic'],
    faq: [['Can we do a movie-night picnic?', 'Movie nights are one of our favorite themes. Tell us in your inquiry and we’ll quote the setup.']],
  },
  {
    slug: 'birthday-picnics', name: 'Birthday Picnics', mood: 'celebrate',
    tagline: 'A birthday that feels like an event.',
    intro: 'Milestone or just-because, a styled birthday picnic gives your people a gorgeous place to gather — balloons, signage, cake table and all. For groups larger than eight we build a custom quote.',
    highlights: ['Groups up to 8 at $35 per extra guest', 'Larger parties custom-quoted', 'Signage & balloon details', 'Cake & dessert styling'],
    packages: ['basic-picnic', 'teepee-picnic', 'cabana-picnic'],
    faq: [['How many guests can a birthday picnic hold?', `Packages are priced for two; add guests at $${policies.extraGuest} each up to ${policies.maxStandardGuests}. Above that we create custom pricing.`]],
  },
  {
    slug: 'bridal-shower-picnics', name: 'Bridal Shower Picnics', mood: 'celebrate',
    tagline: 'Showers worth showing off.',
    intro: 'An outdoor bridal shower with a long, styled table, florals in the bride’s palette and a beautiful backdrop for photos. We handle the setup so the hosts can actually enjoy the day.',
    highlights: ['Long-table layouts for groups', 'Florals in the bride’s palette', 'Gift & dessert tables', 'Photo-ready backdrops'],
    packages: ['cabana-picnic', 'teepee-picnic', 'basic-picnic'],
    faq: [['Do you do larger bridal showers?', 'Yes. Showers over eight guests receive custom pricing based on table length, décor and food.']],
  },
  {
    slug: 'baby-shower-picnics', name: 'Baby Shower Picnics', mood: 'celebrate',
    tagline: 'Soft, sweet and stress-free.',
    intro: 'Gentle palettes, comfortable seating and a styled spread for the parents-to-be. Gender reveals welcome — we’ll keep the secret.',
    highlights: ['Comfortable seating for mom', 'Gender reveal moments', 'Dessert & charcuterie styling', 'Custom signage'],
    packages: ['teepee-picnic', 'cabana-picnic', 'basic-picnic'],
    faq: [['Can you host a gender reveal?', 'Absolutely. Tell us who holds the secret and we’ll coordinate the reveal detail with them.']],
  },
  {
    slug: 'bachelorette-picnics', name: 'Bachelorette Picnics', mood: 'celebrate',
    tagline: 'The weekend’s most photographed hour.',
    intro: 'Kick off the bachelorette weekend with a styled picnic for the whole crew — perfect for brunch, golden-hour photos or a paint-and-sip before the night begins.',
    highlights: ['Group layouts & custom quotes', 'Brunch or paint-and-sip themes', 'Signage for the bride-to-be', 'Beverage service add-on'],
    packages: ['cabana-picnic', 'teepee-picnic', 'basic-picnic'],
    faq: [['Can we bring our own drinks?', 'Please ask about your specific location — many parks restrict alcohol. We can offer beverage service where permitted.']],
  },
  {
    slug: 'graduation-picnics', name: 'Graduation & Senior Photos', mood: 'celebrate',
    tagline: 'For the class that did it.',
    intro: 'Celebrate the grad with a styled picnic in school colors, or book our Senior Photo Package — a full styled set built for portraits and announcement photos.',
    highlights: ['School-color styling', 'Senior photo sets', 'Signage with name & year', 'Family gathering layouts'],
    packages: ['senior-photo-package', 'basic-picnic', 'teepee-picnic'],
    faq: [['Is a photographer included in the Senior Photo Package?', 'The package is a styled photo set. Bring your own photographer or ask us to coordinate one.']],
  },
  {
    slug: 'corporate-picnics', name: 'Corporate Picnics & Team Events', mood: 'celebrate',
    tagline: 'Team time that doesn’t feel like a meeting.',
    intro: 'Client appreciation, team lunches, wellness days and offsites — beautifully styled, fully catered on request and set up without pulling your staff off the job.',
    highlights: ['Team lunches & offsites', 'Client appreciation events', 'Yoga & wellness setups', 'Catering & beverage coordination'],
    packages: ['cabana-picnic', 'basic-picnic', 'teepee-picnic'],
    faq: [['Do you invoice companies?', 'Yes — mention that it’s a corporate booking in your inquiry and we’ll send a formal quote.']],
  },
  {
    slug: 'event-planning', name: 'Event Planning & Styling', mood: 'celebrate',
    tagline: 'Beyond the picnic.',
    intro: 'Full event planning for weddings, corporate functions, milestone celebrations and nonprofit fundraisers: concept and design, venue selection, vendor coordination, logistics and timelines, and on-site coordination so every detail is flawless.',
    highlights: ['Concept development & design', 'Venue selection & management', 'Vendor coordination', 'On-site coordination'],
    packages: [],
    faq: [['What size events do you plan?', 'Everything from intimate gatherings to large-scale celebrations. Every event planning project is custom-quoted.']],
  },
  {
    slug: 'picnic-photography', name: 'Picnic Photography', mood: 'picnic',
    tagline: 'The setup is half the memory.',
    intro: 'Add photography to any experience and leave with images worthy of the moment — proposals, anniversaries, family gatherings and content shoots.',
    highlights: ['Add to any package', 'Proposal & surprise coverage', 'Content creator sets', 'Family portraits'],
    packages: ['proposal-picnic', 'senior-photo-package', 'cabana-picnic'],
    faq: [['Can I book a setup just for a photoshoot?', 'Yes — styled sets for creators, brands and portraits are a great fit. Ask about our Senior Photo Package as a starting point.']],
  },
  {
    slug: 'igloo-experiences', name: 'Igloo Experiences', mood: 'romance',
    tagline: 'A glowing dome, any season.',
    intro: 'Our clear igloo dome wraps your table in string lights and soft throws. Cozy in cooler months, unforgettable after dark — a favorite for date nights and winter celebrations.',
    highlights: ['Clear dome with string lights', 'Cozy throws & pillows', 'Great in cooler weather', 'Stunning at night'],
    packages: ['igloo-picnic'],
    faq: [['Is the igloo good in cold weather?', 'It’s our cool-weather favorite — the dome blocks wind and we layer extra throws.']],
  },
  {
    slug: 'cabana-experiences', name: 'Cabana Experiences', mood: 'picnic',
    tagline: 'Resort energy, wherever you are.',
    intro: 'Flowing curtains, layered rugs and a full styled table — the cabana gives your picnic shade, structure and a gorgeous frame for photos.',
    highlights: ['Draped cabana structure', 'Charcuterie box or desserts', 'Shade for sunny afternoons', 'LED candles & lighting'],
    packages: ['cabana-picnic'],
    faq: [['What comes with the Cabana Picnic?', 'Cabana, table and seating, dishes, rugs, décor, LED candles and lighting, a Bluetooth speaker, fruit-infused water, a small charcuterie box or desserts, a chalkboard message and your theme.']],
  },
  {
    slug: 'teepee-experiences', name: 'Teepee Experiences', mood: 'celebrate',
    tagline: 'Whimsical, cozy and made for photos.',
    intro: 'A draped canvas teepee over a styled low table — playful for birthdays and showers, dreamy for date nights.',
    highlights: ['Canvas teepee with draping', 'Great for kids & showers', 'Boho or romantic styling', 'Photo-ready from every angle'],
    packages: ['teepee-picnic'],
    faq: [['Is the teepee good for kids’ parties?', 'Yes — it’s a favorite for little ones’ birthdays and sleepover-style picnics.']],
  },
];

/*
 * Areas served. `settings` are well-known public spots worth considering; every
 * public venue has its own permit / vendor rules, which we confirm per booking.
 */
const areas = [
  {
    slug: 'smithfield-va', name: 'Smithfield', county: 'Isle of Wight County',
    intro: 'Smithfield is home base for Perfect Spread — a historic riverside town with charming streets, waterfront views and plenty of quiet green space.',
    settings: ['Windsor Castle Park', 'Fort Boykin Historic Park', 'The Pagan River waterfront', 'Your backyard or private venue'],
  },
  {
    slug: 'suffolk-va', name: 'Suffolk', county: 'City of Suffolk',
    intro: 'Suffolk’s lakes, riverfront parks and wide-open farmland make for peaceful, uncrowded picnic settings just minutes from Smithfield.',
    settings: ['Lone Star Lakes Park', 'Sleepy Hole Park', 'Bennett’s Creek Park', 'Private farms & homes'],
  },
  {
    slug: 'williamsburg-va', name: 'Williamsburg', county: 'Williamsburg & James City County',
    intro: 'Historic charm, wooded trails and riverfront beaches make Williamsburg a favorite for proposals, anniversaries and showers.',
    settings: ['Jamestown Beach Event Park', 'Waller Mill Park', 'Freedom Park', 'Wineries & private estates'],
  },
  {
    slug: 'newport-news-va', name: 'Newport News', county: 'City of Newport News',
    intro: 'From the James River shoreline to wooded lakeside trails, Newport News offers some of the Peninsula’s prettiest backdrops.',
    settings: ['Huntington Park & Beach', 'Newport News Park', 'The Noland Trail at Mariners’ Lake', 'Private homes & venues'],
  },
  {
    slug: 'hampton-va', name: 'Hampton', county: 'City of Hampton',
    intro: 'Bay breezes, sandy beaches and historic waterfront views — Hampton is made for golden-hour picnics.',
    settings: ['Buckroe Beach', 'Fort Monroe waterfront', 'Sandy Bottom Nature Park', 'Private homes & venues'],
  },
  {
    slug: 'norfolk-va', name: 'Norfolk', county: 'City of Norfolk',
    intro: 'Urban waterfront meets leafy neighborhoods. Norfolk is perfect for a stylish date night or a downtown corporate gathering.',
    settings: ['Ocean View Beach Park', 'Town Point Park', 'Ghent neighborhood parks', 'Rooftops & private venues'],
  },
  {
    slug: 'chesapeake-va', name: 'Chesapeake', county: 'City of Chesapeake',
    intro: 'Lakes, nature trails and spacious parks give Chesapeake plenty of room for family gatherings and birthday celebrations.',
    settings: ['Chesapeake City Park', 'Oak Grove Lake Park', 'Northwest River Park', 'Backyards & private venues'],
  },
  {
    slug: 'virginia-beach-va', name: 'Virginia Beach', county: 'City of Virginia Beach',
    intro: 'Sunrise over the ocean, sunset over the bay — Virginia Beach is one of our most requested destinations for proposals and bachelorette picnics.',
    settings: ['First Landing State Park', 'Mount Trashmore Park', 'Red Wing Park', 'Beach houses & rentals'],
  },
];

const faqs = [
  ['How long is a picnic?', `Standard packages include ${policies.duration} of picnic time. Extra time can be added when you inquire.`],
  ['How many guests are included?', `Packages are priced for two. Additional guests are $${policies.extraGuest} each up to ${policies.maxStandardGuests} guests; larger groups receive custom pricing.`],
  ['How do I reserve my date?', `Send an inquiry and we’ll reply within ${policies.responseTime}. We can hold your date for ${policies.dateHold}; a ${policies.deposit} deposit reserves it and the balance is due ${policies.balanceDue}.`],
  ['Do you accept last-minute bookings?', 'We’ll always try to accommodate last-minute requests — reach out and we’ll check availability right away.'],
  ['Where can you set up?', 'Parks, beaches, waterfronts, backyards, rental homes and private venues across Smithfield, Hampton Roads and Williamsburg. Public spaces have their own rules, and we’ll help you choose a spot that works.'],
  ['What happens if it rains?', 'Weather is part of outdoor life in Virginia. We’ll work with you on a backup plan — moving indoors, adjusting the time or rescheduling — and confirm the details in your quote.'],
  ['Is food included?', 'Every package includes fruit-infused water; Cabana and premium packages add a small charcuterie box or desserts. Gourmet catering and beverage service are available as add-ons.'],
];

// Real client reviews only. Leave empty until Perfect Spread supplies them —
// the testimonial section and AggregateRating schema only render when filled.
// Shape: { quote: '', name: '', occasion: '' }
const testimonials = [];

module.exports = {
  business, policies, bookingSteps, packages, addOns, occasions, inquiryOccasions, themes, moods, services, areas, faqs, testimonials,
};
