const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config/environment');
const User = require('../models/User');
const { Challenge } = require('../models/Challenge');
const Quiz = require('../models/Quiz');
const Badge = require('../models/Badge');
const UserBadge = require('../models/UserBadge');
const LearningResource = require('../models/LearningResource');
const PointsTransaction = require('../models/PointsTransaction');
const ChallengeSubmission = require('../models/ChallengeSubmission');
const QuizAttempt = require('../models/QuizAttempt');

const seedData = async () => {
  try {
    console.log('[Seed] Connecting to MongoDB...');
    await mongoose.connect(config.mongodbUri);
    console.log('[Seed] Connected. Clearing previous seed collections...');

    await Promise.all([
      User.deleteMany({}),
      Challenge.deleteMany({}),
      Quiz.deleteMany({}),
      Badge.deleteMany({}),
      UserBadge.deleteMany({}),
      LearningResource.deleteMany({}),
      PointsTransaction.deleteMany({}),
      ChallengeSubmission.deleteMany({}),
      QuizAttempt.deleteMany({}),
    ]);

    console.log('[Seed] Seeding Badges...');
    const badges = await Badge.insertMany([
      {
        code: 'FIRST_CHALLENGE',
        name: 'First Challenge Completed',
        description: 'Successfully submitted and had your first environmental challenge approved.',
        icon: 'Award',
        category: 'Action',
        criteria: { type: 'CHALLENGE_COUNT', threshold: 1 },
      },
      {
        code: 'ECO_LEARNER',
        name: 'Eco Learner',
        description: 'Passed your first environmental knowledge quiz.',
        icon: 'BookOpen',
        category: 'Knowledge',
        criteria: { type: 'QUIZ_COUNT', threshold: 1 },
      },
      {
        code: 'WATER_SAVER',
        name: 'Water Saver',
        description: 'Completed challenges dedicated to water conservation.',
        icon: 'Droplets',
        category: 'Conservation',
        criteria: { type: 'CATEGORY_CHALLENGE', threshold: 1, category: 'Water Conservation' },
      },
      {
        code: 'WASTE_WARRIOR',
        name: 'Waste Warrior',
        description: 'Championed waste reduction and recycling challenges.',
        icon: 'Trash2',
        category: 'Recycling',
        criteria: { type: 'CATEGORY_CHALLENGE', threshold: 1, category: 'Waste Management' },
      },
      {
        code: 'QUIZ_MASTER',
        name: 'Quiz Master',
        description: 'Scored high and passed at least 3 environmental quizzes.',
        icon: 'CheckCircle',
        category: 'Excellence',
        criteria: { type: 'QUIZ_COUNT', threshold: 3 },
      },
      {
        code: 'CONSISTENCY_CHAMPION',
        name: 'Consistency Champion',
        description: 'Earned over 300 points through sustained environmental actions.',
        icon: 'Zap',
        category: 'Milestone',
        criteria: { type: 'TOTAL_POINTS', threshold: 300 },
      },
    ]);

    console.log('[Seed] Seeding Default Users...');
    const salt = await bcrypt.genSalt(10);
    const adminPasswordHash = await bcrypt.hash('Admin@123', salt);
    const teacherPasswordHash = await bcrypt.hash('Teacher@123', salt);
    const studentPasswordHash = await bcrypt.hash('Student@123', salt);

    const admin = await User.create({
      name: 'Dr. Eleanor Vance (Admin)',
      email: 'admin@ecoquest.edu',
      passwordHash: adminPasswordHash,
      role: 'admin',
      isVerified: true,
      schoolOrCollege: 'EcoQuest Platform Administration',
      totalPoints: 0,
      experiencePoints: 0,
      level: 1,
    });

    const teacher = await User.create({
      name: 'Prof. Marcus Thorne',
      email: 'teacher@ecoquest.edu',
      passwordHash: teacherPasswordHash,
      role: 'teacher',
      isVerified: true,
      schoolOrCollege: 'Greenwood High School',
      totalPoints: 0,
      experiencePoints: 0,
      level: 1,
    });

    const student1 = await User.create({
      name: 'Maya Lin',
      email: 'student@ecoquest.edu',
      passwordHash: studentPasswordHash,
      role: 'student',
      isVerified: true,
      schoolOrCollege: 'Greenwood High School',
      totalPoints: 210,
      experiencePoints: 210,
      level: 2,
    });

    const student2 = await User.create({
      name: 'Liam Chen',
      email: 'liam@ecoquest.edu',
      passwordHash: studentPasswordHash,
      role: 'student',
      isVerified: true,
      schoolOrCollege: 'Oakridge International Academy',
      totalPoints: 340,
      experiencePoints: 340,
      level: 2,
    });

    const student3 = await User.create({
      name: 'Sophia Rodriguez',
      email: 'sophia@ecoquest.edu',
      passwordHash: studentPasswordHash,
      role: 'student',
      isVerified: true,
      schoolOrCollege: 'Greenwood High School',
      totalPoints: 480,
      experiencePoints: 480,
      level: 3,
    });

    console.log('[Seed] Seeding Environmental Challenges...');
    const challenges = await Challenge.insertMany([
      {
        title: 'Zero-Waste Lunch Week',
        description: 'Pack completely zero-waste lunches for five consecutive school or college days. Eliminate single-use bags, plastic wrap, and disposable drink containers.',
        category: 'Waste Management',
        difficulty: 'Medium',
        pointsReward: 60,
        xpReward: 60,
        instructions: '1. Prepare lunch using reusable containers, cloth napkins, and refillable bottles.\n2. Document each day with a photo or checklist.\n3. Calculate the estimated plastic packaging saved.',
        submissionRequirements: 'Provide a brief summary of how you packed your meals without disposables and calculate the single-use items diverted from landfills.',
        isApprovedByAdmin: true,
        creator: teacher._id,
      },
      {
        title: 'Household Water Audit & Leak Detection',
        description: 'Inspect faucets, showers, and toilet cisterns at home or dorm for leaks and measure water flow rates.',
        category: 'Water Conservation',
        difficulty: 'Easy',
        pointsReward: 40,
        xpReward: 40,
        instructions: '1. Perform the food-coloring test on toilet cisterns to check for silent leaks.\n2. Place a bucket under running taps to measure liters per minute.\n3. Report or fix identified drips.',
        submissionRequirements: 'Detail the fixtures you inspected, any leaks discovered or repaired, and your household estimated daily water usage.',
        isApprovedByAdmin: true,
        creator: teacher._id,
      },
      {
        title: 'Vampire Power Shutdown',
        description: 'Identify and unplug electronics and chargers drawing phantom energy while in standby mode.',
        category: 'Energy Saving',
        difficulty: 'Easy',
        pointsReward: 35,
        xpReward: 35,
        instructions: '1. Audit electronic appliances in your living space that remain plugged in 24/7.\n2. Install power strips with on/off switches for entertainment setups and laptop chargers.\n3. Keep appliances fully switched off when not in active use for 7 days.',
        submissionRequirements: 'List at least 5 devices you identified and unplugged, along with estimated kilowatt-hours conserved.',
        isApprovedByAdmin: true,
        creator: teacher._id,
      },
      {
        title: 'Native Tree / Flora Planting',
        description: 'Plant a native tree sapling or pollinator garden patch in your school, college, or community green space.',
        category: 'Tree Plantation',
        difficulty: 'Hard',
        pointsReward: 100,
        xpReward: 100,
        instructions: '1. Select native saplings suitable for local soil and climate conditions.\n2. Dig an appropriate planting hole with compost nutrients.\n3. Commit to a watering and mulch schedule for ongoing growth.',
        submissionRequirements: 'Describe the species planted, planting location, soil preparation, and your ongoing maintenance plan.',
        isApprovedByAdmin: true,
        creator: admin._id,
      },
      {
        title: 'Campus Biodiversity & Pollinator Census',
        description: 'Spend 60 minutes observing and logging species of birds, butterflies, bees, and insects in your local ecosystem.',
        category: 'Biodiversity',
        difficulty: 'Medium',
        pointsReward: 50,
        xpReward: 50,
        instructions: '1. Choose an outdoor observation area on campus or a local park.\n2. Record date, temperature, and habitat type.\n3. Count and categorize organisms seen during the 60-minute window.',
        submissionRequirements: 'Submit your species observation log and a reflection on local habitat health.',
        isApprovedByAdmin: true,
        creator: teacher._id,
      },
      {
        title: 'Zero-Emission Commute Challenge',
        description: 'Replace motor vehicle trips with walking, bicycling, or public transit for at least 3 days this week.',
        category: 'Sustainable Transportation',
        difficulty: 'Medium',
        pointsReward: 55,
        xpReward: 55,
        instructions: '1. Map safe bike or pedestrian routes to your institution.\n2. Log kilometers travelled via active transportation.\n3. Track avoided vehicle emissions.',
        submissionRequirements: 'Submit your travel routes, total distance covered without fossil-fuel personal cars, and your experience.',
        isApprovedByAdmin: true,
        creator: teacher._id,
      },
    ]);

    console.log('[Seed] Seeding Quizzes...');
    const quizzes = await Quiz.insertMany([
      {
        title: 'Ocean Plastics & Marine Ecosystems',
        description: 'Test your understanding of plastic breakdown, microplastics, and their effects on marine biodiversity.',
        topic: 'Plastic Reduction',
        difficulty: 'Medium',
        timeLimitMinutes: 10,
        passingScore: 60,
        pointsReward: 30,
        xpReward: 30,
        createdBy: teacher._id,
        questions: [
          {
            questionText: 'What term describes plastic particles measuring less than 5 millimeters in diameter?',
            options: ['Macroplastics', 'Microplastics', 'Nanopolymers', 'Cellulose beads'],
            correctOptionIndex: 1,
            explanation: 'Microplastics are defined as synthetic solid plastic particles or fragments smaller than 5 mm in size.',
          },
          {
            questionText: 'Which oceanic gyre contains the highest documented accumulation of floating plastic debris on Earth?',
            options: ['North Atlantic Gyre', 'Indian Ocean Gyre', 'Great Pacific Garbage Patch', 'South Atlantic Gyre'],
            correctOptionIndex: 2,
            explanation: 'The Great Pacific Garbage Patch, situated between California and Hawaii, is the largest marine accumulation of plastic debris.',
          },
          {
            questionText: 'Approximately how long does a standard polyethylene terephthalate (PET) plastic bottle take to decompose in nature?',
            options: ['5 to 10 years', '20 to 50 years', 'Up to 450 years', 'Forever without breaking into pieces'],
            correctOptionIndex: 2,
            explanation: 'PET bottles take an estimated 450 years to break down photo-chemically into microplastics.',
          },
          {
            questionText: 'Which marine animal is especially prone to confusing transparent plastic bags with their natural prey, jellyfish?',
            options: ['Sea turtles', 'Humpback whales', 'Moray eels', 'Clownfish'],
            correctOptionIndex: 0,
            explanation: 'Sea turtles frequently ingest floating plastic bags because they closely resemble translucent jellyfish.',
          },
        ],
      },
      {
        title: 'Water Conservation & Watershed Dynamics',
        description: 'Assess your practical knowledge on freshwater scarcity, groundwater recharging, and conservation measures.',
        topic: 'Water Conservation',
        difficulty: 'Easy',
        timeLimitMinutes: 8,
        passingScore: 60,
        pointsReward: 25,
        xpReward: 25,
        createdBy: teacher._id,
        questions: [
          {
            questionText: 'What percentage of Earths total water is readily accessible freshwater available for human consumption?',
            options: ['Approximately 70%', 'Around 25%', 'Less than 1%', 'About 12%'],
            correctOptionIndex: 2,
            explanation: 'Over 97% of Earths water is saline, and roughly 2% is locked in polar ice caps, leaving less than 1% as accessible freshwater.',
          },
          {
            questionText: 'Which household fixture typically accounts for the largest proportion of indoor domestic water usage?',
            options: ['Dishwasher', 'Toilet flushing', 'Washing car', 'Lawn sprinkler'],
            correctOptionIndex: 1,
            explanation: 'Standard indoor toilets represent approximately 24% to 30% of average household indoor water consumption.',
          },
          {
            questionText: 'What is greywater in domestic environmental terminology?',
            options: [
              'Contaminated industrial toxic waste',
              'Untreated wastewater from showers, washing machines, and sinks',
              'Sewage water from toilets',
              'Rainwater collected strictly from roofs',
            ],
            correctOptionIndex: 1,
            explanation: 'Greywater is gently used wastewater from bathroom sinks, showers, tubs, and washing machines that can be safely reused for landscape irrigation.',
          },
        ],
      },
      {
        title: 'Renewable Energy & Carbon Footprints',
        description: 'Evaluate your grasp of clean energy generation, photovoltaic cells, and emission reduction.',
        topic: 'Energy Saving',
        difficulty: 'Medium',
        timeLimitMinutes: 10,
        passingScore: 66,
        pointsReward: 35,
        xpReward: 35,
        createdBy: admin._id,
        questions: [
          {
            questionText: 'Which renewable energy source converts sunlight directly into electricity via the photovoltaic effect?',
            options: ['Solar thermal collectors', 'Solar photovoltaic (PV) panels', 'Geothermal turbines', 'Biomass digesters'],
            correctOptionIndex: 1,
            explanation: 'Solar PV cells exploit the photoelectric effect to convert incoming photons directly into DC electrical currents.',
          },
          {
            questionText: 'What does the term "Vampire Power" or standby power refer to?',
            options: [
              'Energy stolen through illegal grid taps',
              'Electricity consumed by electronic appliances while turned off or in standby mode',
              'Power generated during nighttime wind storms',
              'Emergency backup diesel power',
            ],
            correctOptionIndex: 1,
            explanation: 'Vampire power refers to the electrical power consumed by electronic appliances when they are switched off but still plugged into wall sockets.',
          },
          {
            questionText: 'Which greenhouse gas is primarily released from burning fossil fuels and has the largest overall impact on climate warming due to emitted volume?',
            options: ['Methane (CH4)', 'Nitrous oxide (N2O)', 'Carbon dioxide (CO2)', 'Sulfur hexafluoride (SF6)'],
            correctOptionIndex: 2,
            explanation: 'Carbon dioxide accounts for the vast majority of human-induced greenhouse gas emissions by volume from coal, oil, and gas combustion.',
          },
        ],
      },
    ]);

    console.log('[Seed] Seeding Learning Resources...');
    await LearningResource.insertMany([
      {
        title: 'Understanding the Carbon Cycle and Climate Equilibrium',
        topic: 'Climate Awareness',
        shortDescription: 'Explore the biospheric pathways of carbon exchange between atmosphere, oceans, terrestrial biomass, and geological sinks.',
        content: `### The Global Carbon Equilibrium

The carbon cycle is the biogeochemical process through which carbon moves continuously among Earth's four fundamental reservoirs:
1. **The Atmosphere**: Primarily gaseous carbon dioxide ($CO_2$) and methane ($CH_4$).
2. **The Biosphere**: Terrestrial vegetation, soil organisms, fungi, animals, and marine phytoplankton.
3. **The Hydrosphere**: Oceans, lakes, and dissolved bicarbonate ions.
4. **The Lithosphere**: Sedimentary rocks, limestone, and ancient fossil fuel deposits.

#### Anthropogenic Disruption
For hundreds of thousands of years, atmospheric carbon dioxide fluctuated naturally between 180 and 280 parts per million (ppm). Since the dawn of the Industrial Revolution, intensive extraction and combustion of subterranean fossil fuels has elevated atmospheric concentrations past 420 ppm.

#### Actionable Mitigation Steps for Institutions:
- Transition campus energy contracts toward verified wind and solar power purchase agreements.
- Preserve and expand mature urban tree canopies that actively sequester atmospheric carbon.
- Promote plant-rich menu options in dining halls to reduce methane emissions linked to intensive livestock farming.`,
        targetAudience: 'Intermediate',
        estimatedMinutes: 6,
        createdBy: admin._id,
        isPublished: true,
      },
      {
        title: 'Mastering Campus & Home Composting: From Food Scraps to Living Soil',
        topic: 'Waste Management',
        shortDescription: 'A practical, scientific manual on aerobic microbial decomposition of organic waste into nutrient-rich humus.',
        content: `### Why Organic Waste Divergence Matters

When food scraps and yard trimmings are buried in municipal landfills, anaerobic conditions cause bacteria to convert organic material into methane ($CH_4$) — a greenhouse gas with over 28 times the global warming potential of carbon dioxide over a 100-year horizon.

#### The Golden Carbon-to-Nitrogen (C:N) Ratio
Successful aerobic composting relies on maintaining balance between two main categories of materials:

- **"Browns" (Carbon-rich)**: Dry autumn leaves, clean cardboard, straw, woodchips, and paper egg cartons.
- **"Greens" (Nitrogen-rich)**: Vegetable peels, fruit rinds, coffee grounds, and fresh grass clippings.

The target volumetric ratio is approximately **3 parts brown material to 1 part green material**.

#### Practical Checklist:
1. Keep the compost pile as damp as a wrung-out sponge.
2. Turn the material with a pitchfork every 7-14 days to re-introduce oxygen.
3. Monitor internal core temperatures: active piles reach 55°C to 65°C, effectively killing weed seeds and pathogens.`,
        targetAudience: 'Beginner',
        estimatedMinutes: 5,
        createdBy: teacher._id,
        isPublished: true,
      },
      {
        title: 'Water Auditing and Watershed Stewardship',
        topic: 'Water Conservation',
        shortDescription: 'Step-by-step methodology to measure, map, and curtail unnecessary water loss across educational facilities.',
        content: `### Watersheds and Institutional Conservation

A watershed is the entire land basin that drains precipitation and snowmelt into a common river, aquifer, or lake. Urbanization with impermeable concrete surfaces disrupts the natural hydrology, reducing groundwater recharge and amplifying flash floods.

#### Conducting a Fixture Audit:
1. **Flow Bags / Bucket Test**: Place a graduated container under showers and faucets for 10 seconds. Multiply by 6 to determine liters-per-minute (LPM).
2. **Standard Targets**: Aerated bathroom faucets should dispense no more than 4 to 6 LPM. High-efficiency showerheads should operate below 7.5 LPM.
3. **Rainwater Harvesting**: Educational buildings with expansive rooftops possess ideal catchment geometries. Capturing 1 mm of rain over a 100 square meter roof yields 100 liters of non-potable water for groundskeeping.`,
        targetAudience: 'All Levels',
        estimatedMinutes: 4,
        createdBy: teacher._id,
        isPublished: true,
      },
    ]);

    console.log('[Seed] Seeding Sample Student Activity & Submissions...');
    // Seed approved submission for Student1 (Maya) on Zero-Waste Lunch
    const sub1 = await ChallengeSubmission.create({
      challenge: challenges[0]._id,
      student: student1._id,
      proofText: 'Packed stainless steel tiffin containers and reusable beeswax wrap every day from Monday to Friday. Avoided 5 single-use plastic sandwich bags and 5 juice cartons.',
      status: 'approved',
      reviewedBy: teacher._id,
      feedback: 'Excellent dedication Maya! Great calculations on diverted plastic.',
      pointsAwarded: 60,
      reviewedAt: new Date(),
    });

    await PointsTransaction.create({
      user: student1._id,
      amount: 60,
      type: 'CHALLENGE_REWARD',
      referenceModel: 'Challenge',
      referenceId: challenges[0]._id,
      balanceAfter: 60,
      description: `Completed challenge: ${challenges[0].title}`,
    });

    // Seed passed quiz attempt for Student1
    const quiz1 = quizzes[0];
    await QuizAttempt.create({
      quiz: quiz1._id,
      student: student1._id,
      answers: [
        { questionId: quiz1.questions[0]._id, selectedOptionIndex: 1, isCorrect: true },
        { questionId: quiz1.questions[1]._id, selectedOptionIndex: 2, isCorrect: true },
        { questionId: quiz1.questions[2]._id, selectedOptionIndex: 2, isCorrect: true },
        { questionId: quiz1.questions[3]._id, selectedOptionIndex: 0, isCorrect: true },
      ],
      score: 100,
      correctCount: 4,
      totalQuestions: 4,
      passed: true,
      pointsAwarded: 30,
      timeSpentSeconds: 145,
    });

    await PointsTransaction.create({
      user: student1._id,
      amount: 30,
      type: 'QUIZ_REWARD',
      referenceModel: 'Quiz',
      referenceId: quiz1._id,
      balanceAfter: 90,
      description: `Passed quiz: ${quiz1.title} (100%)`,
    });

    // Award badges to Student1
    await UserBadge.create({
      user: student1._id,
      badge: badges[0]._id, // FIRST_CHALLENGE
      earnedAt: new Date(),
    });
    await UserBadge.create({
      user: student1._id,
      badge: badges[1]._id, // ECO_LEARNER
      earnedAt: new Date(),
    });

    // Seed pending submission for Liam to test teacher review workflow
    await ChallengeSubmission.create({
      challenge: challenges[1]._id,
      student: student2._id,
      proofText: 'Tested bathroom taps in our dorm building. Found one faucet in the 2nd floor restroom dripping 12 drips per minute. Placed dye tablets in 3 toilet cisterns and discovered a leaking flapper valve in stall 2.',
      status: 'pending',
    });

    console.log('[Seed] Database successfully seeded with:');
    console.log(`- ${badges.length} Badges`);
    console.log(`- 5 Users (Admin, Teacher, 3 Students)`);
    console.log(`- ${challenges.length} Challenges`);
    console.log(`- ${quizzes.length} Quizzes`);
    console.log(`- 3 Learning Resources`);
    console.log(`- Sample Submissions, Quiz Attempts, Points Ledger, and Badges`);

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]', error);
    process.exit(1);
  }
};

seedData();
