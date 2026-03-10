require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const News = require('../models/News');

const seedData = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  // Clear existing data
  await Admin.deleteMany({});
  await News.deleteMany({});

  // Create super admin
  const admin = await Admin.create({
    username: 'admin',
    password: 'Ashoka@2024',
    name: 'Super Admin',
    role: 'super_admin'
  });
  console.log('✅ Admin created:', admin.username);

  // Create sample news
  const sampleNews = [
    {
      title: 'Ashoka Women\'s College Celebrates Annual Day 2024',
      shortDescription: 'The college celebrated its annual day with great pomp and enthusiasm featuring cultural performances and prize distribution.',
      content: 'The annual day celebration was held at the college auditorium with the presence of distinguished guests...',
      category: 'Events',
      published: true,
      publishedAt: new Date(),
      views: 245,
      featured: true
    },
    {
      title: 'Students Excel in State-Level Science Exhibition',
      shortDescription: 'Our students won first prize at the State Science Exhibition held at Hyderabad.',
      content: 'A team of final year students from the Science department represented our college...',
      category: 'Achievements',
      published: true,
      publishedAt: new Date(Date.now() - 86400000),
      views: 189,
      featured: true
    },
    {
      title: 'Important: Exam Schedule for Semester Exams',
      shortDescription: 'The schedule for upcoming semester examinations has been released. Students are advised to check the notice board.',
      content: 'The examination department has released the schedule for the upcoming semester examinations...',
      category: 'Circulars',
      published: true,
      publishedAt: new Date(Date.now() - 172800000),
      views: 567
    },
    {
      title: 'Campus Placement Drive - Top Companies Visiting',
      shortDescription: 'Leading companies including Infosys, TCS, and Wipro will be visiting the campus for placement interviews.',
      content: 'The placement cell is pleased to announce that multiple top-tier companies will be visiting...',
      category: 'Placements',
      published: true,
      publishedAt: new Date(Date.now() - 259200000),
      views: 892,
      featured: true
    },
    {
      title: 'New Library Resources Added for Academic Year 2024-25',
      shortDescription: 'The college library has added over 500 new books and subscribed to 20 new digital journals.',
      content: 'The library department announces the addition of extensive new resources...',
      category: 'Announcements',
      published: true,
      publishedAt: new Date(Date.now() - 345600000),
      views: 134
    }
  ];

  await News.insertMany(sampleNews);
  console.log('✅ Sample news created');

  console.log('\n📋 Login Credentials:');
  console.log('Username: admin');
  console.log('Password: Ashoka@2024');

  mongoose.connection.close();
};

seedData().catch(err => {
  console.error(err);
  process.exit(1);
});
