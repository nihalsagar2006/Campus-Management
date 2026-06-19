// Mock API client for fully local/offline execution on GitHub Pages
// Intercepts all requests and manages state in localStorage

const getDB = (key, defaultVal = []) => {
  const val = localStorage.getItem(key);
  return val ? JSON.parse(val) : defaultVal;
};

const setDB = (key, val) => {
  localStorage.setItem(key, JSON.stringify(val));
};

// Seed default users
let users = getDB('db_users');
if (users.length === 0) {
  users = [
    {
      id: 1,
      email: 'admin@campus.edu',
      full_name: 'System Admin',
      password: 'admin123',
      is_active: true,
      is_admin: true
    }
  ];
  setDB('db_users', users);
}

// Seed default events
let events = getDB('db_events');
if (events.length === 0) {
  events = [
    {
      id: 1,
      title: "Esports Championship",
      category: "Esports",
      description: "Ultimate campus gaming showdown! Featuring BGMI, Free Fire, Call of Duty Mobile, Valorant, and FIFA with solo/team registration, brackets, leaderboards, match updates, MVPs, and prize pools.",
      venue: "Main Auditorium / Gaming Arena",
      date_time: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      capacity: 500,
      deadline: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString(),
      organizer_id: 1,
      status: "upcoming"
    },
    {
      id: 2,
      title: "CodeSprint Hackathon",
      category: "Technology",
      description: "A high-octane 6-hour innovation challenge! Solve real-world campus problems, build fully working prototypes, and pitch to judges for awards in innovation, technical excellence, and impact.",
      venue: "Computer Center Lab 3",
      date_time: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString(),
      capacity: 150,
      deadline: new Date(Date.now() + 33 * 24 * 60 * 60 * 1000).toISOString(),
      organizer_id: 1,
      status: "upcoming"
    },
    {
      id: 3,
      title: "TechNova Exhibition",
      category: "Technology",
      description: "Showcase of students' hardware, software, IoT, AI, websites, mobile apps, robotics, and research projects. Includes visitor voting, professional judging panel, and major cash prizes.",
      venue: "Exhibition Hall A",
      date_time: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000).toISOString(),
      capacity: 300,
      deadline: new Date(Date.now() + 38 * 24 * 60 * 60 * 1000).toISOString(),
      organizer_id: 1,
      status: "upcoming"
    },
    {
      id: 4,
      title: "Entrepreneurship Pitch & Vibe",
      category: "Business",
      description: "Got a startup idea? Present your business models, prototypes, and pitch decks to real judges and investors. Network with mentors and secure startup incubation awards.",
      venue: "Seminar Hall 1",
      date_time: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
      capacity: 100,
      deadline: new Date(Date.now() + 43 * 24 * 60 * 60 * 1000).toISOString(),
      organizer_id: 1,
      status: "upcoming"
    },
    {
      id: 5,
      title: "Sports Arena",
      category: "Sports",
      description: "Inter-department sports league featuring Cricket, Football, and Kabaddi. Complete with fixtures, knockout rounds, score tracking, points tables, and MVP recognitions.",
      venue: "Campus Sports Grounds",
      date_time: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000).toISOString(),
      capacity: 1000,
      deadline: new Date(Date.now() + 48 * 24 * 60 * 60 * 1000).toISOString(),
      organizer_id: 1,
      status: "upcoming"
    }
  ];
  setDB('db_events', events);
}

// Seed default notifications
let notifications = getDB('db_notifications');
if (notifications.length === 0) {
  notifications = [
    {
      id: 1,
      content: "Emergency Notice: Server maintenance scheduled tonight from 12 AM to 2 AM. Some system modules may be temporarily unavailable.",
      type: "urgent",
      priority: 10,
      is_pinned: true,
      link_url: null,
      created_at: new Date().toISOString(),
      created_by_id: 1,
      is_active: true
    },
    {
      id: 2,
      content: "Winner Announcement: Congratulations to CS Titans for winning the Sports Arena Football Championship!",
      type: "success",
      priority: 5,
      is_pinned: false,
      link_url: "/events/5",
      created_at: new Date().toISOString(),
      created_by_id: 1,
      is_active: true
    },
    {
      id: 3,
      content: "Deadline Alert: Registration for CodeSprint Hackathon closes in 24 hours. Submit your team entry now!",
      type: "warning",
      priority: 8,
      is_pinned: false,
      link_url: "/events/2",
      created_at: new Date().toISOString(),
      created_by_id: 1,
      is_active: true
    },
    {
      id: 4,
      content: "Venue Change: TechNova Exhibition will now be held in the Main Exhibition Hall B instead of Hall A.",
      type: "info",
      priority: 3,
      is_pinned: false,
      link_url: "/events/3",
      created_at: new Date().toISOString(),
      created_by_id: 1,
      is_active: true
    }
  ];
  setDB('db_notifications', notifications);
}

const getCurrentUser = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  const usersList = getDB('db_users');
  return usersList.find(u => u.email === token) || null;
};

// Simulate async network response
const delay = (ms = 100) => new Promise(resolve => setTimeout(resolve, ms));

const api = {
  interceptors: {
    request: { use: () => {} },
    response: { use: () => {} }
  },

  get: async (url, config) => {
    await delay();
    const currentUser = getCurrentUser();

    // GET /auth/me
    if (url === '/auth/me') {
      if (!currentUser) throw new Error('Unauthorized');
      return { data: currentUser };
    }

    // GET /auth/users
    if (url === '/auth/users') {
      const usersList = getDB('db_users');
      return { data: usersList };
    }

    // GET /events/ or /events
    if (url.startsWith('/events/') || url === '/events') {
      const parts = url.split('/');
      const eventsList = getDB('db_events');
      
      // GET /events/:id
      if (parts.length > 2 && parts[2] !== '') {
        const id = parseInt(parts[2]);
        const event = eventsList.find(e => e.id === id);
        if (!event) throw new Error('Event not found');
        return { data: event };
      }
      
      return { data: eventsList };
    }

    // GET /registrations/my
    if (url === '/registrations/my') {
      if (!currentUser) throw new Error('Unauthorized');
      const regs = getDB('db_registrations');
      const myRegs = regs.filter(r => r.user_id === currentUser.id || (r.team_members && r.team_members.some(m => m.email === currentUser.email)));
      return { data: myRegs };
    }

    // GET /registrations/by-invite/:inviteCode
    if (url.startsWith('/registrations/by-invite/')) {
      const inviteCode = url.replace('/registrations/by-invite/', '');
      const regs = getDB('db_registrations');
      const reg = regs.find(r => r.invite_code === inviteCode);
      if (!reg) throw new Error('Invite code not found');
      return { data: reg };
    }

    // GET /registrations/team-status/:regId
    if (url.startsWith('/registrations/team-status/')) {
      const regId = parseInt(url.replace('/registrations/team-status/', ''));
      const regs = getDB('db_registrations');
      const reg = regs.find(r => r.id === regId);
      if (!reg) throw new Error('Registration not found');
      return { data: reg };
    }

    // GET /registrations/:regId/confirmation-pdf or certificate
    if (url.includes('/confirmation-pdf') || url.includes('/certificates/download/')) {
      return { data: new Blob(["Mock PDF Content"], { type: "application/pdf" }) };
    }

    // GET /event_features/:eventId/announcements
    if (url.includes('/announcements') && url.startsWith('/event_features/')) {
      const eventId = parseInt(url.split('/')[2]);
      const anns = getDB('db_announcements');
      return { data: anns.filter(a => a.event_id === eventId) };
    }

    // GET /event_features/:eventId/gallery
    if (url.includes('/gallery') && url.startsWith('/event_features/')) {
      const eventId = parseInt(url.split('/')[2]);
      const gallery = getDB('db_gallery');
      return { data: gallery.filter(g => g.event_id === eventId) };
    }

    // GET /event_features/:eventId/projects
    if (url.includes('/projects') && url.startsWith('/event_features/')) {
      const eventId = parseInt(url.split('/')[2]);
      const projects = getDB('db_projects');
      return { data: projects.filter(p => p.event_id === eventId) };
    }

    // GET /event_features/:eventId/fixtures
    if (url.includes('/fixtures') && url.startsWith('/event_features/')) {
      const eventId = parseInt(url.split('/')[2]);
      const fixtures = getDB('db_fixtures');
      return { data: fixtures.filter(f => f.event_id === eventId) };
    }

    // GET /event_features/:eventId/leaderboard
    if (url.includes('/leaderboard') && url.startsWith('/event_features/')) {
      const eventId = parseInt(url.split('/')[2]);
      const rows = getDB('db_leaderboard');
      return { data: rows.filter(r => r.event_id === eventId) };
    }

    // GET /event_features/:eventId/analytics
    if (url.includes('/analytics') && url.startsWith('/event_features/')) {
      const eventId = parseInt(url.split('/')[2]);
      const regs = getDB('db_registrations').filter(r => r.event_id === eventId);
      const approved = regs.filter(r => r.status === 'approved').length;
      const pending = regs.filter(r => r.status === 'pending').length;
      return {
        data: {
          total_registrations: regs.length,
          approved_registrations: approved,
          pending_registrations: pending,
          capacity_fill_rate: regs.length ? (regs.length / 100) * 100 : 0
        }
      };
    }

    // GET /event_features/:eventId/registrations
    if (url.includes('/registrations') && url.startsWith('/event_features/')) {
      const eventId = parseInt(url.split('/')[2]);
      const regs = getDB('db_registrations');
      return { data: regs.filter(r => r.event_id === eventId) };
    }

    // GET /notifications/active
    if (url === '/notifications/active') {
      const notices = getDB('db_notifications').filter(n => n.is_active);
      return { data: notices };
    }

    // GET /notifications/all
    if (url === '/notifications/all') {
      const notices = getDB('db_notifications');
      return { data: notices };
    }

    // GET /notifications/:id/stats
    if (url.startsWith('/notifications/') && url.endsWith('/stats')) {
      const id = parseInt(url.split('/')[2]);
      const views = getDB('db_notification_views').filter(v => v.notification_id === id).length;
      const reads = getDB('db_notification_reads').filter(r => r.notification_id === id).length;
      return { data: { views, reads } };
    }

    throw new Error(`404: Mock route not found for GET ${url}`);
  },

  post: async (url, data, config) => {
    await delay();
    const currentUser = getCurrentUser();

    // POST /auth/login
    if (url === '/auth/login') {
      let email = "";
      let password = "";
      if (data instanceof URLSearchParams) {
        email = data.get('username');
        password = data.get('password');
      } else {
        email = data.username || data.email;
        password = data.password;
      }

      const usersList = getDB('db_users');
      const foundUser = usersList.find(u => u.email === email && u.password === password);
      if (!foundUser) {
        throw new Error('Invalid email or password');
      }

      // Store email as token for simplicity
      localStorage.setItem('token', foundUser.email);
      return { data: { access_token: foundUser.email } };
    }

    // POST /auth/register
    if (url === '/auth/register') {
      const usersList = getDB('db_users');
      if (usersList.some(u => u.email === data.email)) {
        throw new Error('User already exists');
      }
      const newUser = {
        id: usersList.length + 1,
        email: data.email,
        full_name: data.full_name,
        password: data.password,
        is_active: true,
        is_admin: false
      };
      usersList.push(newUser);
      setDB('db_users', usersList);
      return { data: newUser };
    }

    // POST /events/ or /events
    if (url.startsWith('/events')) {
      if (!currentUser || !currentUser.is_admin) throw new Error('Unauthorized');
      const eventsList = getDB('db_events');
      const newEvent = {
        id: eventsList.length + 1,
        title: data.title,
        category: data.category,
        description: data.description,
        venue: data.venue,
        date_time: data.date_time,
        capacity: data.capacity,
        deadline: data.deadline,
        organizer_id: currentUser.id,
        status: "upcoming"
      };
      eventsList.push(newEvent);
      setDB('db_events', eventsList);
      return { data: newEvent };
    }

    // POST /registrations/
    if (url === '/registrations/' || url === '/registrations') {
      if (!currentUser) throw new Error('Unauthorized');
      const regs = getDB('db_registrations');
      const eventsList = getDB('db_events');
      const event = eventsList.find(e => e.id === data.event_id);
      
      const newReg = {
        id: regs.length + 1,
        event_id: data.event_id,
        event_title: event ? event.title : 'Event',
        user_id: currentUser.id,
        user_name: currentUser.full_name,
        user_email: currentUser.email,
        status: 'pending',
        invite_code: Math.random().toString(36).substring(2, 8).toUpperCase(),
        registration_type: data.registration_type || 'solo',
        team_name: data.team_name || null,
        team_members: data.team_members ? data.team_members.map((m, idx) => ({ ...m, id: idx + 1, status: 'joined' })) : [],
        qr_code_data: `CAMPUS-REG-${regs.length + 1}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
        created_at: new Date().toISOString()
      };
      regs.push(newReg);
      setDB('db_registrations', regs);
      return { data: newReg };
    }

    // POST /registrations/join/:inviteCode
    if (url.startsWith('/registrations/join/')) {
      if (!currentUser) throw new Error('Unauthorized');
      const inviteCode = url.replace('/registrations/join/', '');
      const regs = getDB('db_registrations');
      const reg = regs.find(r => r.invite_code === inviteCode);
      if (!reg) throw new Error('Registration team not found');

      if (!reg.team_members) reg.team_members = [];
      if (reg.team_members.some(m => m.email === currentUser.email)) {
        return { data: reg };
      }

      reg.team_members.push({
        id: reg.team_members.length + 1,
        name: currentUser.full_name,
        email: currentUser.email,
        status: 'joined'
      });
      setDB('db_registrations', regs);
      return { data: reg };
    }

    // POST /event_features/:eventId/submit_project
    if (url.includes('/submit_project')) {
      const eventId = parseInt(url.split('/')[2]);
      const projects = getDB('db_projects');
      const newProj = {
        id: projects.length + 1,
        event_id: eventId,
        title: data.title,
        description: data.description,
        github_url: data.github_url || '',
        live_demo_url: data.live_demo_url || '',
        submitter_name: currentUser ? currentUser.full_name : 'Student',
        votes: 0,
        voters: [],
        score: null,
        feedback: null
      };
      projects.push(newProj);
      setDB('db_projects', projects);
      return { data: newProj };
    }

    // POST /event_features/projects/:projId/vote
    if (url.startsWith('/event_features/projects/') && url.endsWith('/vote')) {
      if (!currentUser) throw new Error('Unauthorized');
      const projId = parseInt(url.split('/')[3]);
      const projects = getDB('db_projects');
      const proj = projects.find(p => p.id === projId);
      if (!proj) throw new Error('Project not found');

      if (!proj.voters) proj.voters = [];
      if (proj.voters.includes(currentUser.email)) {
        throw new Error('Already voted for this project');
      }

      proj.votes += 1;
      proj.voters.push(currentUser.email);
      setDB('db_projects', projects);
      return { data: proj };
    }

    // POST /event_features/:eventId/announcements
    if (url.includes('/announcements') && url.startsWith('/event_features/')) {
      const eventId = parseInt(url.split('/')[2]);
      const anns = getDB('db_announcements');
      const newAnn = {
        id: anns.length + 1,
        event_id: eventId,
        title: data.title,
        content: data.content,
        created_at: new Date().toISOString()
      };
      anns.push(newAnn);
      setDB('db_announcements', anns);
      return { data: newAnn };
    }

    // POST /event_features/:eventId/gallery
    if (url.includes('/gallery') && url.startsWith('/event_features/')) {
      const eventId = parseInt(url.split('/')[2]);
      const gallery = getDB('db_gallery');
      const newGal = {
        id: gallery.length + 1,
        event_id: eventId,
        title: data.title,
        image_url: data.image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
        uploaded_by: currentUser ? currentUser.full_name : 'Admin',
        created_at: new Date().toISOString()
      };
      gallery.push(newGal);
      setDB('db_gallery', gallery);
      return { data: newGal };
    }

    // POST /registrations/mark_attendance
    if (url.startsWith('/registrations/mark_attendance')) {
      const qrCodeData = new URLSearchParams(url.split('?')[1]).get('qr_code_data');
      const regs = getDB('db_registrations');
      const reg = regs.find(r => r.qr_code_data === qrCodeData);
      if (!reg) throw new Error('Invalid QR code');
      reg.attended = true;
      setDB('db_registrations', regs);
      return { data: reg };
    }

    // POST /event_features/:eventId/issue_custom_certificate
    if (url.includes('/issue_custom_certificate')) {
      return { data: { message: "Certificate issued successfully!" } };
    }

    // POST /event_features/:eventId/fixtures
    if (url.includes('/fixtures') && url.startsWith('/event_features/')) {
      const eventId = parseInt(url.split('/')[2]);
      const fixtures = getDB('db_fixtures');
      const newFix = {
        id: fixtures.length + 1,
        event_id: eventId,
        team_a: data.team_a,
        team_b: data.team_b,
        round: data.round,
        date_time: data.date_time,
        status: data.status || 'scheduled',
        score_a: data.score_a || 0,
        score_b: data.score_b || 0
      };
      fixtures.push(newFix);
      setDB('db_fixtures', fixtures);
      return { data: newFix };
    }

    // POST /event_features/:eventId/leaderboard
    if (url.includes('/leaderboard') && url.startsWith('/event_features/')) {
      const eventId = parseInt(url.split('/')[2]);
      const rows = getDB('db_leaderboard');
      const newRow = {
        id: rows.length + 1,
        event_id: eventId,
        team_name: data.team_name,
        played: data.played || 0,
        won: data.won || 0,
        lost: data.lost || 0,
        points: data.points || 0
      };
      rows.push(newRow);
      setDB('db_leaderboard', rows);
      return { data: newRow };
    }

    // POST /event_features/projects/:submissionId/grade
    if (url.startsWith('/event_features/projects/') && url.endsWith('/grade')) {
      const subId = parseInt(url.split('/')[3]);
      const projects = getDB('db_projects');
      const proj = projects.find(p => p.id === subId);
      if (!proj) throw new Error('Submission not found');
      proj.score = data.score;
      proj.feedback = data.feedback;
      setDB('db_projects', projects);
      return { data: proj };
    }

    // POST /registrations/:regId/approve
    if (url.startsWith('/registrations/') && url.endsWith('/approve')) {
      const regId = parseInt(url.split('/')[2]);
      const regs = getDB('db_registrations');
      const reg = regs.find(r => r.id === regId);
      if (!reg) throw new Error('Registration not found');
      reg.status = 'approved';
      setDB('db_registrations', regs);
      return { data: reg };
    }

    // POST /registrations/:regId/reject
    if (url.startsWith('/registrations/') && url.endsWith('/reject')) {
      const regId = parseInt(url.split('/')[2]);
      const regs = getDB('db_registrations');
      const reg = regs.find(r => r.id === regId);
      if (!reg) throw new Error('Registration not found');
      reg.status = 'rejected';
      setDB('db_registrations', regs);
      return { data: reg };
    }

    // POST /notifications/:id/view
    if (url.startsWith('/notifications/') && url.endsWith('/view')) {
      const notId = parseInt(url.split('/')[2]);
      const views = getDB('db_notification_views');
      views.push({ notification_id: notId, user: currentUser ? currentUser.email : 'guest', timestamp: new Date().toISOString() });
      setDB('db_notification_views', views);
      return { data: { success: true } };
    }

    // POST /notifications/:id/read
    if (url.startsWith('/notifications/') && url.endsWith('/read')) {
      const notId = parseInt(url.split('/')[2]);
      const reads = getDB('db_notification_reads');
      reads.push({ notification_id: notId, user: currentUser ? currentUser.email : 'guest', timestamp: new Date().toISOString() });
      setDB('db_notification_reads', reads);
      return { data: { success: true } };
    }

    // POST /notifications/read-all
    if (url === '/notifications/read-all') {
      const reads = getDB('db_notification_reads');
      const notices = getDB('db_notifications');
      notices.forEach(n => {
        reads.push({ notification_id: n.id, user: currentUser ? currentUser.email : 'guest', timestamp: new Date().toISOString() });
      });
      setDB('db_notification_reads', reads);
      return { data: { success: true } };
    }

    // POST /notifications/ or /notifications
    if (url.startsWith('/notifications')) {
      if (!currentUser || !currentUser.is_admin) throw new Error('Unauthorized');
      const notices = getDB('db_notifications');
      const newNotice = {
        id: notices.length + 1,
        content: data.content,
        type: data.type || 'info',
        priority: data.priority || 5,
        is_pinned: data.is_pinned || false,
        link_url: data.link_url || null,
        created_at: new Date().toISOString(),
        created_by_id: currentUser.id,
        is_active: true
      };
      notices.push(newNotice);
      setDB('db_notifications', notices);
      return { data: newNotice };
    }

    // POST /chatbot/
    if (url.startsWith('/chatbot')) {
      const msg = data.message ? data.message.toLowerCase() : '';
      let reply = "Hello! I am your Campus Event Assistant. How can I help you today?";
      
      if (msg.includes('hackathon') || msg.includes('codesprint') || msg.includes('code')) {
        reply = "The CodeSprint Hackathon is a high-octane 6-hour coding challenge. It starts soon in Computer Center Lab 3. Registrations are open on the Events portal!";
      } else if (msg.includes('esports') || msg.includes('gaming') || msg.includes('valorant') || msg.includes('bgmi')) {
        reply = "The Esports Championship features BGMI, Valorant, COD Mobile, and FIFA. It's happening in the Gaming Arena. Team registrations are open now!";
      } else if (msg.includes('technova') || msg.includes('exhibition') || msg.includes('project')) {
        reply = "TechNova is our student project exhibition showcasing AI, IoT, robotics, and software developments. Join as a visitor or project presenter in Exhibition Hall B.";
      } else if (msg.includes('sports') || msg.includes('football') || msg.includes('cricket')) {
        reply = "Sports Arena matches are happening on the main Sports Grounds. You can check fixtures, live tables, and point updates in the Sports Arena event hub!";
      } else if (msg.includes('login') || msg.includes('admin') || msg.includes('credentials')) {
        reply = "You can log in as Admin using 'admin@campus.edu' and password 'admin123'. Ordinary users can create a new account via the Sign Up link.";
      } else if (msg.includes('pitch') || msg.includes('investor') || msg.includes('startup')) {
        reply = "The Entrepreneurship Pitch & Vibe event is on. Pitch your startup prototype in Seminar Hall 1 to win seed funding.";
      }
      
      return { data: { response: reply } };
    }

    throw new Error(`404: Mock route not found for POST ${url}`);
  },

  put: async (url, data, config) => {
    await delay();
    const currentUser = getCurrentUser();

    // PUT /registrations/:regId
    if (url.startsWith('/registrations/')) {
      const parts = url.split('/');
      const regId = parseInt(parts[2]);
      const regs = getDB('db_registrations');
      const idx = regs.findIndex(r => r.id === regId);
      if (idx === -1) throw new Error('Registration not found');

      // Update registration details
      regs[idx] = { ...regs[idx], ...data };
      setDB('db_registrations', regs);
      return { data: regs[idx] };
    }

    // PUT /event_features/fixtures/:fixtureId
    if (url.startsWith('/event_features/fixtures/')) {
      const fixId = parseInt(url.split('/')[3]);
      const fixtures = getDB('db_fixtures');
      const idx = fixtures.findIndex(f => f.id === fixId);
      if (idx === -1) throw new Error('Fixture not found');
      fixtures[idx] = { ...fixtures[idx], ...data };
      setDB('db_fixtures', fixtures);
      return { data: fixtures[idx] };
    }

    // PUT /notifications/:id
    if (url.startsWith('/notifications/')) {
      const notId = parseInt(url.split('/')[2]);
      const notices = getDB('db_notifications');
      const idx = notices.findIndex(n => n.id === notId);
      if (idx === -1) throw new Error('Notification not found');
      notices[idx] = { ...notices[idx], ...data };
      setDB('db_notifications', notices);
      return { data: notices[idx] };
    }

    throw new Error(`404: Mock route not found for PUT ${url}`);
  },

  delete: async (url, config) => {
    await delay();
    const currentUser = getCurrentUser();

    // DELETE /event_features/announcements/:annId
    if (url.startsWith('/event_features/announcements/')) {
      const annId = parseInt(url.split('/')[3]);
      const anns = getDB('db_announcements');
      const filtered = anns.filter(a => a.id !== annId);
      setDB('db_announcements', filtered);
      return { data: { success: true } };
    }

    // DELETE /event_features/gallery/:galId
    if (url.startsWith('/event_features/gallery/')) {
      const galId = parseInt(url.split('/')[3]);
      const gallery = getDB('db_gallery');
      const filtered = gallery.filter(g => g.id !== galId);
      setDB('db_gallery', filtered);
      return { data: { success: true } };
    }

    // DELETE /event_features/fixtures/:fixtureId
    if (url.startsWith('/event_features/fixtures/')) {
      const fixId = parseInt(url.split('/')[3]);
      const fixtures = getDB('db_fixtures');
      const filtered = fixtures.filter(f => f.id !== fixId);
      setDB('db_fixtures', filtered);
      return { data: { success: true } };
    }

    // DELETE /event_features/leaderboard/:rowId
    if (url.startsWith('/event_features/leaderboard/')) {
      const rowId = parseInt(url.split('/')[3]);
      const rows = getDB('db_leaderboard');
      const filtered = rows.filter(r => r.id !== rowId);
      setDB('db_leaderboard', filtered);
      return { data: { success: true } };
    }

    // DELETE /notifications/:id
    if (url.startsWith('/notifications/')) {
      const notId = parseInt(url.split('/')[2]);
      const notices = getDB('db_notifications');
      const filtered = notices.filter(n => n.id !== notId);
      setDB('db_notifications', filtered);
      return { data: { success: true } };
    }

    throw new Error(`404: Mock route not found for DELETE ${url}`);
  }
};

export default api;
