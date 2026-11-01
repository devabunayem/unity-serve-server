require('dotenv').config();
const { connectDB, getCollections } = require('../config/db');

const initialEvents = [
  {
    title: 'Winter Clothes Distribution – Mirpur 10, Dhaka',
    description: 'Join our annual winter warmth drive to distribute warm jackets, sweaters, and woolen caps to underprivileged families, rickshaw pullers, and pavement dwellers around Mirpur-10 roundabout.',
    eventType: 'Winter Aid',
    thumbnail: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80',
    location: 'Mirpur 10 Roundabout, Dhaka, Bangladesh',
    eventDate: '2026-11-20',
    creatorEmail: 'organizer@unityserve.org',
    creatorName: 'Mirpur Youth Volunteer Forum',
    creatorPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    createdAt: new Date('2026-10-15'),
    updatedAt: new Date('2026-10-15'),
  },
  {
    title: 'Blanket Distribution for the Needy – Mohammadpur, Dhaka',
    description: 'Providing premium heavy fleece blankets to homeless elderlies and roadside families shivering during cold winter nights across Mohammadpur and Town Hall areas.',
    eventType: 'Winter Aid',
    thumbnail: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=80',
    location: 'Mohammadpur Town Hall Ground, Dhaka, Bangladesh',
    eventDate: '2026-11-28',
    creatorEmail: 'organizer@unityserve.org',
    creatorName: 'Dhaka Care Initiative',
    creatorPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    createdAt: new Date('2026-10-18'),
    updatedAt: new Date('2026-10-18'),
  },
  {
    title: 'Buriganga Riverfront Cleanliness & Plastic Cleanup Drive',
    description: 'A community-led environmental intervention to recover single-use plastic waste, polythene, and debris from the Buriganga riverside embankment to preserve aquatic life and urban hygiene.',
    eventType: 'Cleanup',
    thumbnail: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=1200&q=80',
    location: 'Sadarghat Launch Terminal Embankment, Dhaka, Bangladesh',
    eventDate: '2026-12-05',
    creatorEmail: 'greenplanet@unityserve.org',
    creatorName: 'Clean Earth Action Network',
    creatorPhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    createdAt: new Date('2026-10-20'),
    updatedAt: new Date('2026-10-20'),
  },
  {
    title: 'Urban Tree Plantation & Free Fruit Sapling Distribution',
    description: 'Promoting urban biodiversity and combatting air pollution by planting 500 indigenous fruit and shade saplings across public parks, school grounds, and roadside verges.',
    eventType: 'Plantation',
    thumbnail: 'https://images.unsplash.com/photo-1576085898323-218337e3e43c?auto=format&fit=crop&w=1200&q=80',
    location: 'Ramna Park North Gate, Dhaka, Bangladesh',
    eventDate: '2026-12-12',
    creatorEmail: 'greenplanet@unityserve.org',
    creatorName: 'Green Dhaka Foundation',
    creatorPhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    createdAt: new Date('2026-10-22'),
    updatedAt: new Date('2026-10-22'),
  },
  {
    title: 'Emergency Blood Grouping & Voluntary Blood Donation Camp',
    description: 'Collaborative voluntary blood camp in partnership with local transfusion clinics to collect safe red blood units for thalassemia patients and accident emergency victims.',
    eventType: 'Blood Donation',
    thumbnail: 'https://images.unsplash.com/photo-1615461066841-6116e61058f4?auto=format&fit=crop&w=1200&q=80',
    location: 'Dhanmondi Lake Amphitheater Area, Road 27, Dhaka, Bangladesh',
    eventDate: '2026-12-19',
    creatorEmail: 'health@unityserve.org',
    creatorName: 'Red Cross Volunteer Wing',
    creatorPhoto: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80',
    createdAt: new Date('2026-10-25'),
    updatedAt: new Date('2026-10-25'),
  },
  {
    title: 'Slum Children Literacy & Educational Stationery Drive',
    description: 'Empowering 300+ children living in Korail informal settlements with high-quality school bags, notebooks, geometry boxes, and storybooks to encourage sustained school attendance.',
    eventType: 'Education & Literacy',
    thumbnail: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1200&q=80',
    location: 'Korail Community Learning Center, Mohakhali, Dhaka, Bangladesh',
    eventDate: '2027-01-08',
    creatorEmail: 'education@unityserve.org',
    creatorName: 'Light of Knowledge NGO',
    creatorPhoto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    createdAt: new Date('2026-10-26'),
    updatedAt: new Date('2026-10-26'),
  },
  {
    title: 'Nutritious Hot Meal & Ration Basket Distribution',
    description: 'Providing packed wholesome nutritious meals and dry staples (rice, lentils, cooking oil, salt) to daily wage earners facing food insecurity in high-density transit zones.',
    eventType: 'Food Drive',
    thumbnail: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=1200&q=80',
    location: 'Farmgate Overbridge & Ananda Cinema Square, Dhaka, Bangladesh',
    eventDate: '2027-01-16',
    creatorEmail: 'relief@unityserve.org',
    creatorName: 'Feed The Soul Movement',
    creatorPhoto: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
    createdAt: new Date('2026-10-28'),
    updatedAt: new Date('2026-10-28'),
  },
  {
    title: 'Free Vision Screening & Eye Care Camp for Senior Citizens',
    description: 'Expert ophthalmologists and volunteer optometrists providing free refraction exams, eye drops, prescription reading spectacles, and cataract surgery referrals for seniors in need.',
    eventType: 'Healthcare & Medical',
    thumbnail: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=80',
    location: 'Uttara Sector 7 Community Center, Dhaka, Bangladesh',
    eventDate: '2027-01-24',
    creatorEmail: 'health@unityserve.org',
    creatorName: 'Sight For Tomorrow Clinic',
    creatorPhoto: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    createdAt: new Date('2026-10-29'),
    updatedAt: new Date('2026-10-29'),
  }
];

async function seedDatabase() {
  try {
    await connectDB();
    const { eventsCollection } = getCollections();

    const existingCount = await eventsCollection.countDocuments();
    if (existingCount > 0) {
      console.log(`[Seed Notice] Database already has ${existingCount} events. Dropping old events for fresh seed...`);
      await eventsCollection.deleteMany({});
    }

    const result = await eventsCollection.insertMany(initialEvents);
    console.log(`[Seed Success] Successfully inserted ${result.insertedCount} realistic community events!`);
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
}

seedDatabase();

