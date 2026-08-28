import mongoose from 'mongoose';
import { Activity, Leaderboard, Team, User, Workout } from '../models/index.js';
const connectionString = process.env.MONGODB_URI || 'mongodb://localhost:27017/octofit_db';
/**
 * Seed the octofit_db database with test data
 */
async function seedDatabase() {
    try {
        await mongoose.connect(connectionString);
        console.log('Connected to octofit_db');
        await Promise.all([
            Activity.deleteMany({}),
            Leaderboard.deleteMany({}),
            User.deleteMany({}),
            Team.deleteMany({}),
            Workout.deleteMany({})
        ]);
        const [rocketRunners, stormStriders] = await Team.create([
            { name: 'Rocket Runners', points: 2850 },
            { name: 'Storm Striders', points: 2715 }
        ]);
        const users = await User.create([
            { name: 'Ava Chen', email: 'ava@octofit.local', team: rocketRunners._id, fitnessLevel: 'advanced' },
            { name: 'Leo Martins', email: 'leo@octofit.local', team: stormStriders._id, fitnessLevel: 'intermediate' },
            { name: 'Maya Patel', email: 'maya@octofit.local', team: rocketRunners._id, fitnessLevel: 'intermediate' },
            { name: 'Noah Williams', email: 'noah@octofit.local', team: stormStriders._id, fitnessLevel: 'beginner' }
        ]);
        await Team.findByIdAndUpdate(rocketRunners._id, { members: [users[0]._id, users[2]._id] });
        await Team.findByIdAndUpdate(stormStriders._id, { members: [users[1]._id, users[3]._id] });
        await Activity.create([
            { user: users[0]._id, type: 'running', durationMinutes: 42, calories: 420, completedAt: new Date('2026-08-26') },
            { user: users[1]._id, type: 'strength', durationMinutes: 35, calories: 310, completedAt: new Date('2026-08-26') },
            { user: users[2]._id, type: 'cycling', durationMinutes: 50, calories: 455, completedAt: new Date('2026-08-25') },
            { user: users[3]._id, type: 'walking', durationMinutes: 30, calories: 145, completedAt: new Date('2026-08-24') }
        ]);
        await Leaderboard.create([
            { rank: 1, user: users[0]._id, team: rocketRunners._id, points: 960 },
            { rank: 2, user: users[1]._id, team: stormStriders._id, points: 920 },
            { rank: 3, user: users[2]._id, team: rocketRunners._id, points: 870 },
            { rank: 4, user: users[3]._id, team: stormStriders._id, points: 735 }
        ]);
        await Workout.create([
            {
                title: 'Tempo Run', difficulty: 'moderate', focus: 'cardio', durationMinutes: 35,
                caloriesBurned: 360, description: 'Build speed with controlled running intervals.',
                exercises: ['Warm-up jog', 'Three tempo intervals', 'Cool-down walk']
            },
            {
                title: 'Core Circuit', difficulty: 'beginner', focus: 'strength', durationMinutes: 25,
                caloriesBurned: 210, description: 'Strengthen the core with low-impact bodyweight movements.',
                exercises: ['Plank', 'Dead bug', 'Bird dog', 'Side plank']
            },
            {
                title: 'Power Ride', difficulty: 'advanced', focus: 'cycling', durationMinutes: 45,
                caloriesBurned: 480, description: 'Push cycling power through short high-intensity efforts.',
                exercises: ['Easy spin', 'Hill sprints', 'Recovery ride']
            }
        ]);
        console.log('Seeded users, teams, activities, leaderboard, and workouts');
        console.log('Database seeding complete');
        await mongoose.disconnect();
    }
    catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
}
seedDatabase();
