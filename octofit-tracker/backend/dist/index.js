import express from 'express';
import { pathToFileURL } from 'node:url';
import './config/database.js';
import { Activity, Leaderboard, Team, User, Workout } from './models/index.js';
const app = express();
const port = 8000;
export function getApiBaseUrl() {
    const codespaceName = process.env.CODESPACE_NAME;
    return codespaceName ? `https://${codespaceName}-8000.app.github.dev` : `http://localhost:${port}`;
}
function buildResourceResponse(resource, payload) {
    return {
        resource,
        count: payload.length,
        baseUrl: getApiBaseUrl(),
        results: payload
    };
}
app.use(express.json());
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'octofit-backend', baseUrl: getApiBaseUrl() });
});
app.get('/api/users/', async (_req, res) => {
    const users = await User.find().populate('team', 'name points').lean();
    res.json(buildResourceResponse('users', users));
});
app.post('/api/users/', async (req, res) => {
    const incomingUser = req.body ?? {};
    const user = await User.create({
        name: incomingUser.name ?? 'New User',
        email: incomingUser.email ?? 'new-user@octofit.local',
        fitnessLevel: incomingUser.fitnessLevel ?? 'beginner'
    });
    res.status(201).json({ message: 'User created', user, baseUrl: getApiBaseUrl() });
});
app.get('/api/teams/', async (_req, res) => {
    const teams = await Team.find().populate('members', 'name email').lean();
    res.json(buildResourceResponse('teams', teams));
});
app.post('/api/teams/', async (req, res) => {
    const incomingTeam = req.body ?? {};
    const team = await Team.create({
        name: incomingTeam.name ?? 'New Team',
        points: Number(incomingTeam.points ?? 0)
    });
    res.status(201).json({ message: 'Team created', team, baseUrl: getApiBaseUrl() });
});
app.get('/api/activities/', async (_req, res) => {
    const activities = await Activity.find().populate('user', 'name email').sort({ completedAt: -1 }).lean();
    res.json(buildResourceResponse('activities', activities));
});
app.post('/api/activities/', async (req, res) => {
    const incomingActivity = req.body ?? {};
    const activity = await Activity.create({
        user: incomingActivity.user,
        type: incomingActivity.type ?? 'walking',
        durationMinutes: Number(incomingActivity.durationMinutes ?? incomingActivity.minutes ?? 30),
        calories: Number(incomingActivity.calories ?? 0)
    });
    res.status(201).json({ message: 'Activity created', activity, baseUrl: getApiBaseUrl() });
});
app.get('/api/leaderboard/', async (_req, res) => {
    const leaderboard = await Leaderboard.find().populate('user', 'name email').populate('team', 'name').sort({ rank: 1 }).lean();
    res.json(buildResourceResponse('leaderboard', leaderboard));
});
app.post('/api/leaderboard/', async (req, res) => {
    const incomingScore = req.body ?? {};
    const entry = await Leaderboard.create({
        rank: Number(incomingScore.rank ?? 1),
        user: incomingScore.user,
        team: incomingScore.team,
        points: Number(incomingScore.points ?? 0)
    });
    res.status(201).json({ message: 'Leaderboard entry created', entry, baseUrl: getApiBaseUrl() });
});
app.get('/api/workouts/', async (_req, res) => {
    const workouts = await Workout.find().lean();
    res.json(buildResourceResponse('workouts', workouts));
});
app.post('/api/workouts/', async (req, res) => {
    const incomingWorkout = req.body ?? {};
    const workout = await Workout.create({
        title: incomingWorkout.title ?? 'Custom Workout',
        difficulty: incomingWorkout.difficulty ?? 'beginner',
        focus: incomingWorkout.focus ?? 'balance',
        durationMinutes: Number(incomingWorkout.durationMinutes ?? 30),
        caloriesBurned: Number(incomingWorkout.caloriesBurned ?? 0),
        description: incomingWorkout.description ?? 'A custom workout for your training plan.',
        exercises: incomingWorkout.exercises ?? []
    });
    res.status(201).json({ message: 'Workout created', workout, baseUrl: getApiBaseUrl() });
});
export { app };
const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isDirectRun) {
    app.listen(port, () => {
        console.log(`OctoFit backend listening on ${getApiBaseUrl()}`);
    });
}
