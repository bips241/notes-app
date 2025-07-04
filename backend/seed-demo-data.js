const mongoose = require('mongoose');
require('dotenv').config();

const Note = require('./src/models/notes.model');
const User = require('./src/models/user.model');

// Demo users data
const demoUsers = [
  {
    username: 'admin',
    email: 'admin@notesapp.com',
    password: 'admin123',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    isActive: true
  },
  {
    username: 'johndoe',
    email: 'john.doe@example.com',
    password: 'john123',
    firstName: 'John',
    lastName: 'Doe',
    role: 'user',
    isActive: true
  },
  {
    username: 'janesmith',
    email: 'jane.smith@example.com',
    password: 'jane123',
    firstName: 'Jane',
    lastName: 'Smith',
    role: 'user',
    isActive: true
  },
  {
    username: 'mikebrown',
    email: 'mike.brown@example.com',
    password: 'mike123',
    firstName: 'Mike',
    lastName: 'Brown',
    role: 'user',
    isActive: true
  },
  {
    username: 'emilywilson',
    email: 'emily.wilson@example.com',
    password: 'emily123',
    firstName: 'Emily',
    lastName: 'Wilson',
    role: 'user',
    isActive: true
  },
  {
    username: 'davidlee',
    email: 'david.lee@example.com',
    password: 'david123',
    firstName: 'David',
    lastName: 'Lee',
    role: 'user',
    isActive: false // Inactive user for testing
  }
];

// Sample notes data for different users
const sampleNotes = [
  // John Doe's notes
  {
    title: 'Project Alpha - Initial Planning',
    content: 'Project Alpha is a new initiative to develop a customer management system.\n\nKey objectives:\n- Streamline customer onboarding\n- Improve data analytics\n- Enhance user experience\n\nTimeline: 6 months\nBudget: $250,000\nTeam: 5 developers, 2 designers, 1 PM',
    tags: ['work', 'project', 'planning', 'alpha'],
    isArchived: false,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
  },
  {
    title: 'Meeting Notes - Team Standup',
    content: 'Daily standup meeting notes:\n\n✅ Completed:\n- User authentication module\n- Database schema design\n- API endpoint documentation\n\n🔄 In Progress:\n- Frontend components\n- Unit tests\n- Integration tests\n\n❌ Blockers:\n- Waiting for design approval\n- Server deployment issues',
    tags: ['work', 'meeting', 'standup', 'team'],
    isArchived: false,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
  },
  {
    title: 'Learning JavaScript ES6+',
    content: 'Modern JavaScript features to master:\n\n1. Arrow Functions\n2. Destructuring\n3. Template Literals\n4. Promises and Async/Await\n5. Modules (import/export)\n6. Classes\n7. Spread/Rest operators\n8. Map, Set, WeakMap, WeakSet\n\nResources:\n- MDN Web Docs\n- JavaScript.info\n- You Don\'t Know JS book series',
    tags: ['programming', 'javascript', 'learning', 'es6'],
    isArchived: false,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  },
  // Jane Smith's notes
  {
    title: 'Recipe Collection - Favorites',
    content: 'My favorite recipes to cook:\n\n🍝 Pasta Carbonara\nIngredients: pasta, eggs, bacon, parmesan, black pepper\nTime: 20 minutes\n\n🍗 Chicken Tikka Masala\nIngredients: chicken, yogurt, tomatoes, spices\nTime: 45 minutes\n\n🥗 Caesar Salad\nIngredients: romaine, croutons, parmesan, caesar dressing\nTime: 15 minutes\n\n🍰 Chocolate Cake\nIngredients: flour, cocoa, sugar, eggs, butter\nTime: 1 hour',
    tags: ['cooking', 'recipes', 'food', 'personal'],
    isArchived: false,
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
  },
  {
    title: 'Book Reading List 2024',
    content: 'Books to read this year:\n\n📚 Fiction:\n- The Seven Husbands of Evelyn Hugo\n- Project Hail Mary\n- The Midnight Library\n- Klara and the Sun\n\n📖 Non-Fiction:\n- Atomic Habits\n- The Power of Now\n- Sapiens\n- Educated\n\n📊 Business:\n- The Lean Startup\n- Good to Great\n- The Innovator\'s Dilemma\n\nProgress: 8/12 books completed ✅',
    tags: ['books', 'reading', 'personal', 'goals'],
    isArchived: false,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
  },
  {
    title: 'Travel Planning - Europe Trip',
    content: 'Planning my European adventure:\n\n🗺️ Destinations:\n- Paris, France (5 days)\n- Rome, Italy (4 days)\n- Barcelona, Spain (3 days)\n- Amsterdam, Netherlands (3 days)\n\n✈️ Flights:\n- Departure: July 15\n- Return: July 30\n- Cost: $1,200\n\n🏨 Accommodation:\n- Paris: Hotel Rivoli\n- Rome: Airbnb in Trastevere\n- Barcelona: Hostel BCN\n- Amsterdam: Canal House Hotel\n\n📋 To-Do:\n- Book accommodations\n- Apply for travel insurance\n- Research local attractions\n- Learn basic phrases',
    tags: ['travel', 'vacation', 'europe', 'planning'],
    isArchived: false,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  },
  // Mike Brown's notes
  {
    title: 'Fitness Goals 2024',
    content: 'My fitness journey goals:\n\n🏋️ Strength Training:\n- Bench Press: 225 lbs (current: 185 lbs)\n- Deadlift: 315 lbs (current: 275 lbs)\n- Squat: 275 lbs (current: 225 lbs)\n\n🏃 Cardio:\n- Run 5K under 25 minutes\n- Complete a half marathon\n- Bike 50 miles in one session\n\n📊 Body Composition:\n- Lose 20 lbs of fat\n- Gain 10 lbs of muscle\n- Body fat: 15% (current: 22%)\n\n📅 Schedule:\n- Monday: Upper body\n- Tuesday: Cardio\n- Wednesday: Lower body\n- Thursday: Rest\n- Friday: Full body\n- Weekend: Outdoor activities',
    tags: ['fitness', 'health', 'goals', 'workout'],
    isArchived: false,
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  },
  {
    title: 'Investment Portfolio Review',
    content: 'Q3 2024 Portfolio Performance:\n\n📈 Stocks (60%):\n- AAPL: +12% YTD\n- GOOGL: +8% YTD\n- MSFT: +15% YTD\n- TSLA: -5% YTD\n\n🏦 Bonds (30%):\n- US Treasury: +3% YTD\n- Corporate Bonds: +4% YTD\n\n🏠 Real Estate (10%):\n- REIT Index: +6% YTD\n\n💰 Total Portfolio: +9.2% YTD\n\n📋 Actions:\n- Rebalance tech exposure\n- Add more international stocks\n- Consider crypto allocation\n- Review emergency fund',
    tags: ['finance', 'investment', 'portfolio', 'money'],
    isArchived: false,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000) // 12 hours ago
  },
  // Emily Wilson's notes
  {
    title: 'Garden Planning - Spring 2024',
    content: 'Planning my spring garden:\n\n🌱 Vegetables:\n- Tomatoes (cherry, beefsteak)\n- Peppers (bell, jalapeño)\n- Lettuce (romaine, arugula)\n- Herbs (basil, cilantro, parsley)\n- Cucumbers\n- Zucchini\n\n🌸 Flowers:\n- Marigolds (companion planting)\n- Sunflowers\n- Zinnias\n- Nasturtiums\n\n📅 Planting Schedule:\n- March: Start seeds indoors\n- April: Transplant seedlings\n- May: Direct sow warm crops\n- June: Succession planting\n\n🛠️ Supplies Needed:\n- Compost\n- Mulch\n- Tomato cages\n- Drip irrigation',
    tags: ['gardening', 'spring', 'vegetables', 'flowers'],
    isArchived: false,
    createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000), // 9 days ago
    updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)
  },
  {
    title: 'Photography Tips & Techniques',
    content: 'Improving my photography skills:\n\n📸 Composition Rules:\n- Rule of thirds\n- Leading lines\n- Framing\n- Symmetry and patterns\n- Depth of field\n\n🌅 Lighting:\n- Golden hour (sunrise/sunset)\n- Blue hour (twilight)\n- Avoid harsh midday sun\n- Use reflectors for portraits\n\n⚙️ Camera Settings:\n- Aperture: f/1.4-f/2.8 for portraits\n- Shutter Speed: 1/focal length rule\n- ISO: Keep as low as possible\n- Shoot in RAW format\n\n📷 Equipment:\n- Camera: Canon EOS R5\n- Lenses: 24-70mm, 85mm, 16-35mm\n- Tripod: Gitzo carbon fiber\n- Filters: Polarizing, ND',
    tags: ['photography', 'camera', 'tips', 'hobby'],
    isArchived: false,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
    updatedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000)
  },
  // David Lee's notes (inactive user)
  {
    title: 'Old Project Documentation',
    content: 'Legacy system documentation that needs to be archived.\n\nThis system was built in 2019 and is no longer in use.\nAll data has been migrated to the new platform.',
    tags: ['legacy', 'documentation', 'archived'],
    isArchived: true,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    updatedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000)
  },
  // Admin's notes
  {
    title: 'System Maintenance Schedule',
    content: 'Regular system maintenance tasks:\n\n📅 Daily:\n- Monitor server performance\n- Check error logs\n- Backup databases\n- Update security patches\n\n📅 Weekly:\n- Review user activity\n- Clean up temporary files\n- Update documentation\n- Performance testing\n\n📅 Monthly:\n- Security audit\n- Capacity planning\n- User feedback review\n- System updates\n\n🚨 Emergency Procedures:\n- Incident response plan\n- Recovery procedures\n- Communication protocols\n- Escalation matrix',
    tags: ['admin', 'maintenance', 'system', 'operations'],
    isArchived: false,
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), // 12 days ago
    updatedAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000)
  }
];

// Sharing relationships (who shares with whom)
const sharingRelationships = [
  {
    noteTitle: 'Project Alpha - Initial Planning',
    sharedWith: [
      { email: 'jane.smith@example.com', permission: 'read' },
      { email: 'mike.brown@example.com', permission: 'write' }
    ]
  },
  {
    noteTitle: 'Meeting Notes - Team Standup',
    sharedWith: [
      { email: 'admin@notesapp.com', permission: 'read' },
      { email: 'emily.wilson@example.com', permission: 'read' }
    ]
  },
  {
    noteTitle: 'Recipe Collection - Favorites',
    sharedWith: [
      { email: 'emily.wilson@example.com', permission: 'read' }
    ]
  },
  {
    noteTitle: 'Investment Portfolio Review',
    sharedWith: [
      { email: 'john.doe@example.com', permission: 'read' }
    ]
  }
];

// Sharing restrictions (who cannot share with whom)
const sharingRestrictions = [
  {
    userEmail: 'david.lee@example.com',
    restrictedUsers: ['admin@notesapp.com', 'john.doe@example.com']
  },
  {
    userEmail: 'mike.brown@example.com',
    restrictedUsers: ['david.lee@example.com']
  }
];

async function seedDemoData() {
  try {
    console.log('🚀 Starting demo data seeding...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await Note.deleteMany({});
    await User.deleteMany({});
    console.log('✅ Existing data cleared');

    // Create demo users
    console.log('👥 Creating demo users...');
    const createdUsers = [];
    
    for (const userData of demoUsers) {
      const user = new User(userData);
      await user.save();
      createdUsers.push(user);
      console.log(`✅ Created user: ${user.email} (${user.role})`);
    }

    // Create user lookup map
    const userMap = {};
    createdUsers.forEach(user => {
      userMap[user.email] = user;
    });

    // Create sample notes
    console.log('📝 Creating sample notes...');
    const createdNotes = [];
    
    // Assign notes to users
    const userEmails = Object.keys(userMap);
    const noteAssignments = [
      { userEmail: 'john.doe@example.com', noteIndices: [0, 1, 2] },
      { userEmail: 'jane.smith@example.com', noteIndices: [3, 4, 5] },
      { userEmail: 'mike.brown@example.com', noteIndices: [6, 7] },
      { userEmail: 'emily.wilson@example.com', noteIndices: [8, 9] },
      { userEmail: 'david.lee@example.com', noteIndices: [10] },
      { userEmail: 'admin@notesapp.com', noteIndices: [11] }
    ];

    for (const assignment of noteAssignments) {
      const user = userMap[assignment.userEmail];
      for (const noteIndex of assignment.noteIndices) {
        if (noteIndex < sampleNotes.length) {
          const noteData = sampleNotes[noteIndex];
          const note = new Note({
            ...noteData,
            owner: user._id
          });
          await note.save();
          createdNotes.push(note);
          console.log(`✅ Created note: "${note.title}" for ${user.email}`);
        }
      }
    }

    // Create sharing relationships
    console.log('🔗 Creating sharing relationships...');
    for (const sharing of sharingRelationships) {
      const note = createdNotes.find(n => n.title === sharing.noteTitle);
      if (note) {
        for (const shareData of sharing.sharedWith) {
          const sharedUser = userMap[shareData.email];
          if (sharedUser) {
            note.sharedWith.push({
              user: sharedUser._id,
              permission: shareData.permission
            });
          }
        }
        await note.save();
        console.log(`✅ Shared note: "${note.title}" with ${sharing.sharedWith.length} users`);
      }
    }

    // Create sharing restrictions
    console.log('🔒 Creating sharing restrictions...');
    for (const restriction of sharingRestrictions) {
      const user = userMap[restriction.userEmail];
      if (user) {
        for (const restrictedEmail of restriction.restrictedUsers) {
          const restrictedUser = userMap[restrictedEmail];
          if (restrictedUser) {
            user.sharingRestrictedUsers.push(restrictedUser._id);
          }
        }
        await user.save();
        console.log(`✅ Added sharing restrictions for ${user.email}`);
      }
    }

    // Generate statistics
    console.log('\n📊 Generating final statistics...');
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const adminUsers = await User.countDocuments({ role: 'admin' });
    const totalNotes = await Note.countDocuments();
    const archivedNotes = await Note.countDocuments({ isArchived: true });
    const sharedNotes = await Note.countDocuments({ 'sharedWith.0': { $exists: true } });
    
    console.log('\n🎉 Demo data seeding completed successfully!');
    console.log('\n📈 Summary:');
    console.log(`- Total users: ${totalUsers}`);
    console.log(`- Active users: ${activeUsers}`);
    console.log(`- Admin users: ${adminUsers}`);
    console.log(`- Total notes: ${totalNotes}`);
    console.log(`- Archived notes: ${archivedNotes}`);
    console.log(`- Shared notes: ${sharedNotes}`);

    // Generate credentials document
    console.log('\n📋 Generating credentials document...');
    await generateCredentialsDocument(createdUsers);

  } catch (error) {
    console.error('❌ Error seeding demo data:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Database connection closed');
    process.exit(0);
  }
}

async function generateCredentialsDocument(users) {
  const fs = require('fs');
  const path = require('path');
  
  let credentialsDoc = `# Notes App - Demo User Credentials

## Login Credentials

Use these credentials to test the Notes App with different user roles and scenarios.

### Admin User
- **Email:** admin@notesapp.com
- **Password:** admin123
- **Role:** Admin
- **Status:** Active
- **Description:** Full administrative access to the system

### Regular Users

#### John Doe
- **Email:** john.doe@example.com
- **Password:** john123
- **Role:** User
- **Status:** Active
- **Description:** Active user with work-related notes and project documentation

#### Jane Smith
- **Email:** jane.smith@example.com
- **Password:** jane123
- **Role:** User
- **Status:** Active
- **Description:** Active user with personal notes (recipes, books, travel)

#### Mike Brown
- **Email:** mike.brown@example.com
- **Password:** mike123
- **Role:** User
- **Status:** Active
- **Description:** Active user with fitness and investment notes

#### Emily Wilson
- **Email:** emily.wilson@example.com
- **Password:** emily123
- **Role:** User
- **Status:** Active
- **Description:** Active user with gardening and photography notes

#### David Lee
- **Email:** david.lee@example.com
- **Password:** david123
- **Role:** User
- **Status:** Inactive
- **Description:** Inactive user with archived notes (for testing inactive user scenarios)

## Features Demonstrated

### Notes
- **Total Notes:** 12
- **Active Notes:** 11
- **Archived Notes:** 1
- **Shared Notes:** 4
- **Tags:** Various categories (work, personal, fitness, travel, etc.)

### Sharing
- John's "Project Alpha" note is shared with Jane (read) and Mike (write)
- John's "Meeting Notes" note is shared with Admin and Emily (read)
- Jane's "Recipe Collection" note is shared with Emily (read)
- Mike's "Investment Portfolio" note is shared with John (read)

### Sharing Restrictions
- David Lee cannot share notes with Admin or John
- Mike Brown cannot share notes with David Lee

### User Management
- Admin can manage all users
- Active/Inactive user status testing
- Role-based access control

## Testing Scenarios

### 1. Basic Login and Navigation
- Login with each user credential
- Navigate through different sections
- Create, edit, and delete notes

### 2. Note Sharing
- Login as John Doe
- Share a note with another user
- Login as the recipient to view shared note
- Test read vs write permissions

### 3. Admin Functions
- Login as admin
- Access user management
- View analytics dashboard
- Manage user sharing restrictions

### 4. Sharing Restrictions
- Login as David Lee (inactive user)
- Try to share notes (should be restricted)
- Login as Mike Brown
- Try to share with David Lee (should be restricted)

### 5. Search and Filter
- Search for notes by title/content
- Filter by tags
- Search for users in sharing modal

### 6. Archive/Unarchive
- Archive and unarchive notes
- View archived notes section

## Notes Distribution

### John Doe (3 notes)
- Project Alpha - Initial Planning (shared with Jane & Mike)
- Meeting Notes - Team Standup (shared with Admin & Emily)
- Learning JavaScript ES6+

### Jane Smith (3 notes)
- Recipe Collection - Favorites (shared with Emily)
- Book Reading List 2024
- Travel Planning - Europe Trip

### Mike Brown (2 notes)
- Fitness Goals 2024
- Investment Portfolio Review (shared with John)

### Emily Wilson (2 notes)
- Garden Planning - Spring 2024
- Photography Tips & Techniques

### David Lee (1 note)
- Old Project Documentation (archived)

### Admin (1 note)
- System Maintenance Schedule

## Analytics Data

The seeded data provides rich analytics:
- User activity patterns
- Note creation trends
- Tag usage statistics
- Sharing behavior analysis
- Active vs inactive user metrics

## Development Notes

- All passwords are simple for demo purposes (not recommended for production)
- Data spans multiple days to show activity trends
- Covers various use cases and edge cases
- Includes realistic content for better testing experience

---

**Generated on:** ${new Date().toLocaleString()}
**Database:** ${process.env.MONGODB_URI ? 'MongoDB Atlas' : 'Local MongoDB'}
`;

  const credentialsPath = path.join(__dirname, 'DEMO_CREDENTIALS.md');
  fs.writeFileSync(credentialsPath, credentialsDoc);
  console.log(`✅ Credentials document saved to: ${credentialsPath}`);
}

// Run the seeding
seedDemoData();
