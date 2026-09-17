import fs from 'fs';

let content = fs.readFileSync('server.ts', 'utf-8');

// Replace imports
content = content.replace(
  'import { GoogleGenAI, Type } from "@google/genai";',
  'import { GoogleGenAI, Type } from "@google/genai";\nimport http from "http";\nimport { Server } from "socket.io";\nimport cors from "cors";\nimport axios from "axios";'
);

// Add Socket.io setup inside startServer
content = content.replace(
  'const PORT = 3000;\n  app.use(express.json({ limit: "15mb" }));',
  `const PORT = 3000;
  app.use(cors());
  app.use(express.json({ limit: "15mb" }));

  const server = http.createServer(app);
  const io = new Server(server, { cors: { origin: "*" } });

  const state = {
    teams: [],
    messages: [],
    onlineUsers: new Map()
  };

  io.on('connection', (socket) => {
    socket.on('register_user', (userData) => {
      state.onlineUsers.set(socket.id, { socketId: socket.id, username: userData.username });
      io.emit('online_users_list', Array.from(state.onlineUsers.values()));
      socket.emit('sync_initial_state', { teams: state.teams, messages: state.messages });
    });
    socket.on('call_user', ({ targetSocketId, offer }) => {
      io.to(targetSocketId).emit('incoming_call', { fromSocketId: socket.id, offer });
    });
    socket.on('answer_call', ({ targetSocketId, answer }) => {
      io.to(targetSocketId).emit('call_accepted', { fromSocketId: socket.id, answer });
    });
    socket.on('ice_candidate', ({ targetSocketId, candidate }) => {
      io.to(targetSocketId).emit('ice_candidate', { fromSocketId: socket.id, candidate });
    });
    socket.on('send_chat_message', (msg) => {
      state.messages.push(msg);
      io.emit('new_chat_message', msg);
    });
    socket.on('create_team', (teamData) => {
      const newTeam = {
        id: Date.now().toString(),
        name: teamData.name,
        xp: 0,
        requiredXp: 100000,
        lastRewardUnlocked: 0,
        members: [teamData.creator]
      };
      state.teams.push(newTeam);
      io.emit('teams_updated', state.teams);
    });
    socket.on('donate_team_xp', ({ teamId, xpAmount }) => {
      const team = state.teams.find(t => t.id === teamId);
      if (team) {
        team.xp += Number(xpAmount);
        io.emit('teams_updated', state.teams);
      }
    });
    socket.on('claim_team_reward', ({ teamId }) => {
      const team = state.teams.find(t => t.id === teamId);
      if (!team) return;
      const NOW = Date.now();
      const COOLDOWN_48H = 48 * 60 * 60 * 1000;
      if (team.xp >= team.requiredXp && (NOW - team.lastRewardUnlocked >= COOLDOWN_48H)) {
        team.xp -= team.requiredXp;
        team.lastRewardUnlocked = NOW;
        io.emit('teams_updated', state.teams);
        socket.emit('reward_status', { success: true, message: 'Prêmio resgatado com sucesso!' });
      } else {
        socket.emit('reward_status', { success: false, message: 'Requisitos insuficientes.' });
      }
    });
    socket.on('disconnect', () => {
      state.onlineUsers.delete(socket.id);
      io.emit('online_users_list', Array.from(state.onlineUsers.values()));
    });
  });

  const AVA_URL = 'https://ava.ifes.edu.br';
  app.post('/api/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      const response = await axios.get(\`\${AVA_URL}/login/token.php\`, {
        params: { username, password, service: 'moodle_mobile_app' }
      });
      res.json(response.data);
    } catch (err) {
      res.status(500).json({ error: 'Erro de conexão com o AVA IFES.' });
    }
  });
  app.get('/api/courses', async (req, res) => {
    try {
      const { token, userid } = req.query;
      const response = await axios.get(\`\${AVA_URL}/webservice/rest/server.php\`, {
        params: { wstoken: token, wsfunction: 'core_enrol_get_users_courses', moodlewsrestformat: 'json', userid }
      });
      res.json(response.data);
    } catch (err) {
      res.status(500).json({ error: 'Erro ao carregar matérias.' });
    }
  });
  app.get('/api/course-contents', async (req, res) => {
    try {
      const { token, courseid } = req.query;
      const response = await axios.get(\`\${AVA_URL}/webservice/rest/server.php\`, {
        params: { wstoken: token, wsfunction: 'core_course_get_contents', moodlewsrestformat: 'json', courseid }
      });
      res.json(response.data);
    } catch (err) {
      res.status(500).json({ error: 'Erro ao obter conteúdo do curso.' });
    }
  });`
);

// Replace app.listen with server.listen
content = content.replace(
  'app.listen(PORT, "0.0.0.0", () => {',
  'server.listen(PORT, "0.0.0.0", () => {'
);

fs.writeFileSync('server.ts', content);
console.log('patched');
