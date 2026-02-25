/**
 * Seed script: Dummy educator account + dummy contest
 *
 * Creates:
 * 1. Dummy educator (admin) - login: educator@demo.com / demo123
 * 2. Dummy contest with 2 MCQs and 2 coding problems (open, dummy time)
 *
 * Run: npm run seed  (from backend directory)
 * Or:  node scripts/seedDummyData.js
 *
 * Edit DUMMY_CONTEST.testTime and totalTime above to change contest timing.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const { AdminModel } = require('../models/AdminModel');
const { UserModel } = require('../models/UserModel');
const TestModel = require('../models/TestModel');
const QuestionModel = require('../models/QuestionModel');
const ProblemModel = require('../models/ProblemModel');
const { Types } = mongoose;

// ============ CONFIGURATION (edit these as needed) ============
const DUMMY_EDUCATOR = {
    name: 'Demo Educator',
    email: 'educator@demo.com',
    password: 'demo123'
};

// Contest: start 1 hour from now, duration 90 minutes (change as needed)
const getDummyTestTime = () => {
    const start = new Date();
    start.setHours(start.getHours() + 1);
    start.setMinutes(0, 0, 0);
    return start;
};

const DUMMY_CONTEST = {
    title: 'Dummy Contest - Sample Test',
    description: 'A sample contest with 2 MCQs and 2 coding questions. Open for everyone. Change time/settings as needed.',
    testTime: getDummyTestTime(),
    totalTime: 90, // minutes
    publishResult: true,
    examTakerPhase: 'finalized',
    phase: 'upcoming',
    isPrivate: false,
    contestType: 'mixed'
};

// ============ MCQ DEFINITIONS ============
const MCQ_QUESTIONS = [
    {
        questionText: 'What is 2 + 2?',
        questionType: 'single',
        options: [
            { text: '3', isCorrect: false },
            { text: '4', isCorrect: true },
            { text: '5', isCorrect: false },
            { text: '6', isCorrect: false }
        ],
        marks: 5,
        negativeMarks: 1,
        difficulty: 'easy'
    },
    {
        questionText: 'Which of the following are programming languages? (Select all that apply)',
        questionType: 'multiple',
        options: [
            { text: 'Python', isCorrect: true },
            { text: 'HTML', isCorrect: false },
            { text: 'Java', isCorrect: true },
            { text: 'CSS', isCorrect: false }
        ],
        marks: 10,
        negativeMarks: 2,
        difficulty: 'medium'
    }
];

// ============ CODING PROBLEM DEFINITIONS ============
const CODING_PROBLEMS = [
    {
        title: 'Sum of Two Numbers',
        statement: 'Write a program that takes two integers as input and returns their sum.\n\n## Input\nTwo space-separated integers a and b.\n\n## Output\nPrint the sum of a and b.',
        inputFormat: 'Two space-separated integers',
        outputFormat: 'Single integer (sum)',
        constraints: '-1000 <= a, b <= 1000',
        difficulty: 'easy',
        timeLimit: 1000,
        memoryLimit: 256,
        tags: [],  // Add tags as needed; keep [] if ProblemModel text index has restrictions
        testCases: [
            { input: '1 2', expectedOutput: '3', isSample: true, isHidden: false },
            { input: '-5 10', expectedOutput: '5', isSample: true, isHidden: false },
            { input: '0 0', expectedOutput: '0', isSample: false, isHidden: true },
            { input: '100 -50', expectedOutput: '50', isSample: false, isHidden: true }
        ],
        starterCodes: [
            { language: 'python', languageId: 71, code: 'a, b = map(int, input().split())\nprint(a + b)\n' },
            { language: 'cpp', languageId: 54, code: '#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b;\n    return 0;\n}\n' }
        ],
        solution: 'a, b = map(int, input().split())\nprint(a + b)',
        solutionLanguage: 'python',
        maxScore: 50
    },
    {
        title: 'Check Even or Odd',
        statement: 'Given an integer n, print "even" if n is even, otherwise print "odd".\n\n## Input\nA single integer n.\n\n## Output\nPrint "even" or "odd" (without quotes).',
        inputFormat: 'Single integer',
        outputFormat: '"even" or "odd"',
        constraints: '1 <= n <= 10^6',
        difficulty: 'easy',
        timeLimit: 1000,
        memoryLimit: 256,
        tags: [],
        testCases: [
            { input: '4', expectedOutput: 'even', isSample: true, isHidden: false },
            { input: '7', expectedOutput: 'odd', isSample: true, isHidden: false },
            { input: '2', expectedOutput: 'even', isSample: false, isHidden: true },
            { input: '1', expectedOutput: 'odd', isSample: false, isHidden: true }
        ],
        starterCodes: [
            { language: 'python', languageId: 71, code: 'n = int(input())\nif n % 2 == 0:\n    print("even")\nelse:\n    print("odd")\n' },
            { language: 'cpp', languageId: 54, code: '#include <iostream>\nusing namespace std;\nint main() {\n    int n;\n    cin >> n;\n    cout << (n % 2 == 0 ? "even" : "odd");\n    return 0;\n}\n' }
        ],
        solution: 'n = int(input())\nprint("even" if n % 2 == 0 else "odd")',
        solutionLanguage: 'python',
        maxScore: 50
    }
];

// ============ SEED LOGIC ============
async function seed() {
    await connectDB();

    if (!process.env.MONGODB_URI) {
        console.error('MONGODB_URI not set. Cannot seed.');
        process.exit(1);
    }

    try {
        console.log('Starting seed...\n');

        // 1. Create or find dummy educator (Admin) - for login
        let admin = await AdminModel.findOne({ email: DUMMY_EDUCATOR.email });
        if (!admin) {
            admin = await AdminModel.create({
                name: DUMMY_EDUCATOR.name,
                email: DUMMY_EDUCATOR.email,
                password: DUMMY_EDUCATOR.password
            });
            console.log('✓ Created dummy educator (admin):', DUMMY_EDUCATOR.email);
        } else {
            console.log('✓ Dummy educator already exists:', DUMMY_EDUCATOR.email);
        }

        // 2. Create or find User for linking questions/problems (examTakerId/creatorId)
        let user = await UserModel.findOne({ email: DUMMY_EDUCATOR.email });
        if (!user) {
            user = await UserModel.create({
                name: DUMMY_EDUCATOR.name,
                email: DUMMY_EDUCATOR.email,
                password: DUMMY_EDUCATOR.password,
                role: 'educator'
            });
            console.log('✓ Created educator user record for references');
        }

        // 3. Create or get dummy contest (Test)
        let test = await TestModel.findOne({ title: DUMMY_CONTEST.title });
        const isNewContest = !test;

        if (!test) {
            test = await TestModel.create({
            examTakerId: admin._id,
            examTakerModel: 'admins',
            title: DUMMY_CONTEST.title,
            description: DUMMY_CONTEST.description,
            testTime: DUMMY_CONTEST.testTime,
            totalTime: DUMMY_CONTEST.totalTime,
            publishResult: DUMMY_CONTEST.publishResult,
            examTakerPhase: DUMMY_CONTEST.examTakerPhase,
            phase: DUMMY_CONTEST.phase,
            isPrivate: DUMMY_CONTEST.isPrivate,
            contestType: DUMMY_CONTEST.contestType,
            questions: [],
            problems: [],
            students: []
        });
            console.log('✓ Created dummy contest:', test.title);
        } else {
            console.log('✓ Dummy contest already exists:', test.title);
        }
        console.log('  Start:', test.testTime, '| Duration:', test.totalTime, 'min | Open to all');

        // 4. Create 2 MCQs (skip if contest already has them)
        let questionIds = test.questions || [];
        if (questionIds.length < 2) {
            questionIds = [];
            for (const q of MCQ_QUESTIONS) {
            const options = q.options.map((opt, i) => ({
                _id: new Types.ObjectId(),
                text: opt.text,
                isCorrect: opt.isCorrect
            }));
            const correctOpt = options.find(o => o.isCorrect);
            const correctAnswers = q.questionType === 'multiple'
                ? options.filter(o => o.isCorrect).map(o => o._id)
                : undefined;

            const question = await QuestionModel.create({
                examTakerId: user._id,
                testId: test._id,
                questionText: q.questionText,
                questionType: q.questionType,
                options,
                correctAnswer: correctOpt._id,
                correctAnswers: correctAnswers || undefined,
                marks: q.marks,
                negativeMarks: q.negativeMarks,
                difficulty: q.difficulty
            });
            questionIds.push(question._id);
            }
            console.log('✓ Created 2 MCQ questions');
        } else {
            console.log('✓ MCQ questions already linked');
        }

        // 5. Create 2 coding problems (skip if already linked)
        let problemIds = test.problems || [];
        if (problemIds.length < 2) {
            // Drop problematic text+tags index if it exists (array fields incompatible with text index)
            try {
                const coll = mongoose.connection.db.collection('problems');
                const indexes = await coll.indexes();
                const textIndex = indexes.find(i => i.name && (i.name.includes('text') || i.key?.title === 'text'));
                if (textIndex) await coll.dropIndex(textIndex.name);
            } catch (e) {
                if (e.code !== 27 && e.code !== 26) console.warn('Index drop (optional):', e.message);
            }
            problemIds = [];
        for (const p of CODING_PROBLEMS) {
            const problem = await ProblemModel.create({
                creatorId: user._id,
                title: p.title,
                statement: p.statement,
                inputFormat: p.inputFormat,
                outputFormat: p.outputFormat,
                constraints: p.constraints,
                difficulty: p.difficulty,
                timeLimit: p.timeLimit,
                memoryLimit: p.memoryLimit,
                tags: p.tags,
                testCases: p.testCases,
                starterCodes: p.starterCodes,
                solution: p.solution,
                solutionLanguage: p.solutionLanguage,
                maxScore: p.maxScore,
                isPublic: true
            });
            problemIds.push(problem._id);
        }
            console.log('✓ Created 2 coding problems');
        } else {
            console.log('✓ Coding problems already linked');
        }

        // 6. Attach questions and problems to test (if updated)
        if (questionIds.length > 0 || problemIds.length > 0) {
            test.questions = questionIds;
            test.problems = problemIds;
            test.totalMarks = 5 + 10 + 50 + 50; // MCQ (5+10) + coding (50+50)
            await test.save();
            console.log('✓ Linked questions and problems to contest');
        }

        console.log('\n--- Dummy login credentials ---');
        console.log('Educator: email:', DUMMY_EDUCATOR.email, '| password:', DUMMY_EDUCATOR.password);
        console.log('--------------------------------');
        console.log('\nSeed completed successfully.\n');

    } catch (err) {
        console.error('Seed error:', err);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
}

seed();
