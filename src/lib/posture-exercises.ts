// Exercise recommendations mapped to specific posture issues
export interface Exercise {
  id: string;
  name: string;
  description: string;
  duration: string;
  difficulty: "easy" | "medium" | "hard";
  videoUrl?: string;
  steps: string[];
}

export interface PostureTip {
  id: string;
  title: string;
  description: string;
  category: "workspace" | "habit" | "stretch" | "strength";
}

// Exercises mapped to common posture issues
export const POSTURE_EXERCISES: Record<string, Exercise[]> = {
  // Forward head / Tech neck
  "forward head": [
    {
      id: "chin_tucks",
      name: "Chin Tucks",
      description: "Strengthen deep neck flexors to correct forward head posture",
      duration: "2-3 minutes",
      difficulty: "easy",
      steps: [
        "Sit or stand with your back straight",
        "Gently tuck your chin back as if making a double chin",
        "Hold for 5 seconds, then release",
        "Repeat 10-15 times",
      ],
    },
    {
      id: "neck_stretches",
      name: "Neck Stretches",
      description: "Release tension in neck muscles caused by forward head position",
      duration: "3-4 minutes",
      difficulty: "easy",
      steps: [
        "Tilt your head to the right, bringing ear toward shoulder",
        "Hold for 20-30 seconds",
        "Repeat on the left side",
        "Do 3 sets on each side",
      ],
    },
  ],
  
  // Rounded shoulders
  "rounded shoulders": [
    {
      id: "doorway_stretch",
      name: "Doorway Chest Stretch",
      description: "Open up tight chest muscles pulling shoulders forward",
      duration: "2-3 minutes",
      difficulty: "easy",
      steps: [
        "Stand in a doorway with arms at 90 degrees",
        "Place forearms on door frame",
        "Step forward until you feel a stretch in your chest",
        "Hold for 30 seconds, repeat 3 times",
      ],
    },
    {
      id: "wall_angels",
      name: "Wall Angels",
      description: "Strengthen upper back to counteract rounded shoulders",
      duration: "3-4 minutes",
      difficulty: "medium",
      steps: [
        "Stand with back flat against a wall",
        "Raise arms to form a W shape against the wall",
        "Slowly slide arms up to form a Y, keeping contact with wall",
        "Return to W position, repeat 10-15 times",
      ],
    },
    {
      id: "band_pull_aparts",
      name: "Resistance Band Pull-Aparts",
      description: "Strengthen rear deltoids and rhomboids",
      duration: "2-3 minutes",
      difficulty: "medium",
      steps: [
        "Hold a resistance band with arms extended in front",
        "Pull the band apart by squeezing shoulder blades together",
        "Return slowly to starting position",
        "Repeat 15-20 times for 3 sets",
      ],
    },
  ],
  
  // Slouching / Poor sitting posture
  "slouching": [
    {
      id: "cat_cow",
      name: "Cat-Cow Stretch",
      description: "Improve spinal mobility and awareness",
      duration: "2-3 minutes",
      difficulty: "easy",
      steps: [
        "Start on hands and knees in tabletop position",
        "Arch your back upward like a cat, tucking chin",
        "Then drop belly toward floor, lifting head (cow)",
        "Flow between positions 10-15 times",
      ],
    },
    {
      id: "seated_twist",
      name: "Seated Spinal Twist",
      description: "Release tension in the spine from prolonged sitting",
      duration: "2-3 minutes",
      difficulty: "easy",
      steps: [
        "Sit tall in your chair with feet flat",
        "Twist to the right, holding the back of the chair",
        "Hold for 20-30 seconds",
        "Repeat on the left side",
      ],
    },
  ],
  
  // Lower back issues / Anterior pelvic tilt
  "lower back": [
    {
      id: "hip_flexor_stretch",
      name: "Hip Flexor Stretch",
      description: "Release tight hip flexors that cause lower back strain",
      duration: "3-4 minutes",
      difficulty: "easy",
      steps: [
        "Kneel on your right knee with left foot forward",
        "Push hips forward gently until you feel a stretch",
        "Keep torso upright, hold for 30 seconds",
        "Switch sides, repeat 3 times each",
      ],
    },
    {
      id: "glute_bridges",
      name: "Glute Bridges",
      description: "Strengthen glutes to support lower back",
      duration: "3-4 minutes",
      difficulty: "easy",
      steps: [
        "Lie on back with knees bent, feet flat",
        "Squeeze glutes and lift hips toward ceiling",
        "Hold at top for 2-3 seconds",
        "Lower slowly, repeat 15-20 times",
      ],
    },
    {
      id: "dead_bug",
      name: "Dead Bug Exercise",
      description: "Build core stability to protect the lower back",
      duration: "3-4 minutes",
      difficulty: "medium",
      steps: [
        "Lie on back with arms extended toward ceiling",
        "Lift legs to 90 degrees at hips and knees",
        "Lower opposite arm and leg while keeping back flat",
        "Return and alternate, do 10 reps per side",
      ],
    },
  ],
  
  // General poor posture
  "poor posture": [
    {
      id: "thoracic_extension",
      name: "Thoracic Extension",
      description: "Improve upper back mobility and posture",
      duration: "2-3 minutes",
      difficulty: "easy",
      steps: [
        "Sit on floor with foam roller behind upper back",
        "Support head with hands, keep hips down",
        "Gently extend over the roller",
        "Roll up and down the upper back for 1-2 minutes",
      ],
    },
    {
      id: "plank",
      name: "Plank Hold",
      description: "Build overall core strength for better posture",
      duration: "2-3 minutes",
      difficulty: "medium",
      steps: [
        "Start in push-up position on forearms",
        "Keep body in straight line from head to heels",
        "Engage core and hold for 30-60 seconds",
        "Rest and repeat 3 times",
      ],
    },
  ],
  
  // Neck tension/pain
  "neck": [
    {
      id: "levator_scapulae_stretch",
      name: "Levator Scapulae Stretch",
      description: "Release the muscle connecting neck to shoulder blade",
      duration: "2-3 minutes",
      difficulty: "easy",
      steps: [
        "Turn head 45 degrees to the right",
        "Look down toward your armpit",
        "Use right hand to gently increase the stretch",
        "Hold 30 seconds, repeat on other side",
      ],
    },
    {
      id: "neck_rotations",
      name: "Gentle Neck Rotations",
      description: "Improve neck mobility and reduce stiffness",
      duration: "2 minutes",
      difficulty: "easy",
      steps: [
        "Sit or stand with shoulders relaxed",
        "Slowly rotate head in a circle",
        "Do 5 circles in each direction",
        "Keep movements slow and controlled",
      ],
    },
  ],
  
  // Tight shoulders
  "tight shoulders": [
    {
      id: "shoulder_rolls",
      name: "Shoulder Rolls",
      description: "Release shoulder tension and improve circulation",
      duration: "1-2 minutes",
      difficulty: "easy",
      steps: [
        "Sit or stand with arms relaxed at sides",
        "Roll shoulders forward in circles 10 times",
        "Reverse direction for 10 more rolls",
        "Repeat 2-3 times throughout the day",
      ],
    },
    {
      id: "cross_body_stretch",
      name: "Cross-Body Shoulder Stretch",
      description: "Stretch rear deltoid and upper back muscles",
      duration: "2-3 minutes",
      difficulty: "easy",
      steps: [
        "Bring right arm across your body",
        "Use left hand to pull it closer to chest",
        "Hold for 30 seconds",
        "Repeat on other side",
      ],
    },
  ],
};

// Tips organized by category
export const POSTURE_TIPS: PostureTip[] = [
  // Workspace tips
  {
    id: "monitor_height",
    title: "Adjust Monitor Height",
    description: "Position your monitor so the top of the screen is at or slightly below eye level. This prevents neck strain from looking up or down.",
    category: "workspace",
  },
  {
    id: "chair_setup",
    title: "Optimize Chair Settings",
    description: "Adjust your chair so your feet are flat on the floor, knees at 90 degrees, and lower back supported by the chair's lumbar support.",
    category: "workspace",
  },
  {
    id: "keyboard_position",
    title: "Position Keyboard Correctly",
    description: "Keep your keyboard at elbow height with wrists straight. Consider using a keyboard tray to achieve the optimal position.",
    category: "workspace",
  },
  
  // Habit tips
  {
    id: "movement_breaks",
    title: "Take Regular Movement Breaks",
    description: "Set a timer to stand up and move every 30-60 minutes. Even a 2-minute walk can reset your posture and boost circulation.",
    category: "habit",
  },
  {
    id: "posture_checks",
    title: "Perform Posture Checks",
    description: "Set 3-4 daily reminders to check your posture. Ask yourself: Are my shoulders back? Is my chin tucked? Am I sitting tall?",
    category: "habit",
  },
  {
    id: "phone_usage",
    title: "Mindful Phone Usage",
    description: "Hold your phone at eye level instead of looking down. This prevents 'text neck' which can add up to 60 lbs of pressure on your spine.",
    category: "habit",
  },
  
  // Stretch tips
  {
    id: "morning_routine",
    title: "Start with Morning Stretches",
    description: "Spend 5 minutes each morning doing basic stretches. Focus on chest openers, neck rolls, and spinal twists to set up your day.",
    category: "stretch",
  },
  {
    id: "desk_stretches",
    title: "Desk-Friendly Stretches",
    description: "Practice stretches you can do at your desk: seated twists, shoulder shrugs, and wrist circles help maintain flexibility.",
    category: "stretch",
  },
  
  // Strength tips
  {
    id: "core_strength",
    title: "Build Core Strength",
    description: "A strong core is the foundation of good posture. Include planks, dead bugs, and bird-dogs in your workout routine.",
    category: "strength",
  },
  {
    id: "back_exercises",
    title: "Strengthen Your Back",
    description: "Exercises like rows, reverse flies, and lat pulldowns build the muscles that pull your shoulders back and maintain upright posture.",
    category: "strength",
  },
];

// Function to get relevant exercises based on detected issues
export function getExercisesForIssues(issues: string[]): Exercise[] {
  const exercises: Exercise[] = [];
  const addedIds = new Set<string>();
  
  issues.forEach((issue) => {
    const lowerIssue = issue.toLowerCase();
    
    // Check each exercise category for matches
    Object.entries(POSTURE_EXERCISES).forEach(([key, exerciseList]) => {
      if (lowerIssue.includes(key) || key.includes(lowerIssue.split(" ")[0])) {
        exerciseList.forEach((exercise) => {
          if (!addedIds.has(exercise.id)) {
            exercises.push(exercise);
            addedIds.add(exercise.id);
          }
        });
      }
    });
  });
  
  // If no specific matches, add general exercises
  if (exercises.length === 0) {
    POSTURE_EXERCISES["poor posture"].forEach((exercise) => {
      if (!addedIds.has(exercise.id)) {
        exercises.push(exercise);
        addedIds.add(exercise.id);
      }
    });
  }
  
  return exercises.slice(0, 6); // Return max 6 exercises
}

// Function to get relevant tips based on score
export function getTipsForScore(score: number): PostureTip[] {
  const tips: PostureTip[] = [];
  
  if (score < 50) {
    // Low score - focus on workspace setup and habits
    tips.push(...POSTURE_TIPS.filter((t) => t.category === "workspace"));
    tips.push(...POSTURE_TIPS.filter((t) => t.category === "habit").slice(0, 2));
  } else if (score < 70) {
    // Medium score - mix of all categories
    tips.push(...POSTURE_TIPS.filter((t) => t.category === "habit").slice(0, 2));
    tips.push(...POSTURE_TIPS.filter((t) => t.category === "stretch").slice(0, 1));
    tips.push(...POSTURE_TIPS.filter((t) => t.category === "strength").slice(0, 1));
  } else {
    // Good score - maintenance tips
    tips.push(...POSTURE_TIPS.filter((t) => t.category === "stretch"));
    tips.push(...POSTURE_TIPS.filter((t) => t.category === "strength"));
  }
  
  return tips.slice(0, 4); // Return max 4 tips
}
