# Notes App - Demo User Credentials

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

**Generated on:** 7/4/2025, 7:55:59 AM
**Database:** MongoDB Atlas
