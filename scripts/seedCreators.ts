import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Firebase Admin
const app = initializeApp({
  credential: cert({
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  }),
});

const db = getFirestore(app);
const CREATORS_COLLECTION = 'creators';

interface Creator {
  name: string;
  bio: string;
  avatar: string;
  platforms: {
    youtube: {
      channelId: string;
      handle: string;
    };
  };
  tags: string[];
  cuisineTypes: string[];
  specialties: string[];
  difficultyLevel: string;
  contentStyle?: {
    types: string[];
    uploadFrequency?: string;
    language?: string;
  };
  socialLinks: Record<string, string>;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

const creators: Partial<Creator>[] = [
  {
    name: "Joshua Weissman",
    bio: "Award-winning chef known for elevating home cooking with professional techniques and humor",
    platforms: {
      youtube: {
        channelId: "UChBEbMKI1eCcejTtmI32UEw",
        handle: "@JoshuaWeissman"
      }
    },
    tags: ["cooking", "chef", "gourmet", "butfirst"],
    cuisineTypes: ["American", "French", "Asian"],
    specialties: ["bread making", "sauce crafting", "burger perfection", "desserts"],
    difficultyLevel: "intermediate",
    featured: true
  },
  {
    name: "Binging with Babish",
    bio: "Andrew Rea recreates dishes from movies, TV shows, and video games with precise technique",
    platforms: {
      youtube: {
        channelId: "UCJHA_jMfCvEnv-3kRjTCQXw",
        handle: "@BabishCulinaryUniverse"
      }
    },
    tags: ["movies", "pop culture", "recreation", "basics"],
    cuisineTypes: ["American", "International", "Fictional"],
    specialties: ["pop culture recipes", "kitchen basics", "desserts", "pasta"],
    difficultyLevel: "intermediate",
    featured: true
  },
  // Adding more top creators initially
  {
    name: "Food Wishes (Chef John)",
    bio: "Professional chef John Mitzewich offers precise recipes with his distinctive narration style and humor",
    platforms: {
      youtube: {
        channelId: "UCRIZtPl9nb9RiXc9btSTQNw",
        handle: "@foodwishes"
      }
    },
    tags: ["classics", "techniques", "humor"],
    cuisineTypes: ["American", "International", "Mediterranean"],
    specialties: ["sauces", "pasta", "baking", "comfort food"],
    difficultyLevel: "beginner to intermediate",
    featured: true
  },
  {
    name: "J. Kenji López-Alt",
    bio: "Food scientist and chef explaining cooking techniques through scientific principles with POV style videos",
    platforms: {
      youtube: {
        channelId: "UC54SLBnD5k5U3Q6N__UjbAw",
        handle: "@jkenjilopezalt"
      }
    },
    tags: ["science", "pov", "techniques", "testing"],
    cuisineTypes: ["American", "International", "Asian"],
    specialties: ["scientific approach", "testing methods", "wok cooking", "breakfast"],
    difficultyLevel: "intermediate",
    featured: true
  },
  {
    name: "Marion's Kitchen",
    bio: "Former MasterChef contestant sharing authentic Asian recipes with clear instructions and vibrant flavors",
    platforms: {
      youtube: {
        channelId: "UCCDPxcQjWh1xBMTRrYmSL2A",
        handle: "@Marionskitchen"
      }
    },
    tags: ["Asian", "authentic", "masterchef"],
    cuisineTypes: ["Thai", "Asian", "Fusion"],
    specialties: ["curries", "stir fries", "noodle dishes", "street food"],
    difficultyLevel: "beginner to intermediate",
    featured: true
  },
  {
    name: "Bon Appétit",
    bio: "Magazine's test kitchen featuring professional chefs creating and testing recipes with educational commentary",
    platforms: {
      youtube: {
        channelId: "UCbpMy0Fg74eXXkvxJrtEn3w",
        handle: "@bonappetit"
      }
    },
    tags: ["test kitchen", "professional", "magazine"],
    cuisineTypes: ["American", "International", "Fusion"],
    specialties: ["techniques", "gourmet", "restaurant classics", "baking"],
    difficultyLevel: "intermediate to advanced",
    featured: true
  },
  {
    name: "Tasty",
    bio: "BuzzFeed's cooking channel known for overhead-shot recipe videos with quick, accessible recipes and food trends",
    platforms: {
      youtube: {
        channelId: "UCJFp8uSYCjXOMnkUyb3CQ3Q",
        handle: "@buzzfeedtasty"
      }
    },
    tags: ["viral", "quick", "trends", "overhead"],
    cuisineTypes: ["American", "Fusion", "International"],
    specialties: ["desserts", "comfort food", "quick meals", "party food"],
    difficultyLevel: "beginner",
    featured: true
  },
  {
    name: "Gordon Ramsay",
    bio: "Celebrity chef bringing restaurant techniques to home cooks with his signature intensity and expertise",
    platforms: {
      youtube: {
        channelId: "UCIEv3lZ_tNXHzL3ox-_uUGQ",
        handle: "@gordonramsay"
      }
    },
    tags: ["celebrity chef", "gourmet", "restaurant"],
    cuisineTypes: ["British", "French", "International"],
    specialties: ["meat cooking", "seafood", "refined dishes", "breakfast"],
    difficultyLevel: "intermediate to advanced",
    featured: true
  },
  {
    name: "Maangchi",
    bio: "Korean home cook Emily Kim sharing authentic Korean recipes with detailed instructions and cultural context",
    platforms: {
      youtube: {
        channelId: "UC8gFadPgK2r1ndqLI04Xvvw",
        handle: "@maangchi"
      }
    },
    tags: ["Korean", "authentic", "traditional"],
    cuisineTypes: ["Korean"],
    specialties: ["kimchi", "banchan", "Korean BBQ", "soups and stews"],
    difficultyLevel: "beginner to intermediate",
    featured: true
  },
  {
    name: "Sam the Cooking Guy",
    bio: "Relaxed, no-frills approach to delicious food with a focus on big flavors and practical techniques",
    platforms: {
      youtube: {
        channelId: "UCbRj3Tcy1Zoz3rcf83nW5kw",
        handle: "@samthecookingguy"
      }
    },
    tags: ["casual", "big flavors", "practical", "humor"],
    cuisineTypes: ["American", "Mexican", "Asian Fusion"],
    specialties: ["sandwiches", "tacos", "grilling", "comfort food"],
    difficultyLevel: "beginner",
    featured: true
  },
  {
    name: "Adam Ragusea",
    bio: "Home cook focused on practical food science, recipe testing, and cooking history with thoughtful analysis",
    platforms: {
      youtube: {
        channelId: "UC9_p50tH3WmMslWRWKnM7dQ",
        handle: "@aragusea"
      }
    },
    tags: ["science", "practical", "history", "explanations"],
    cuisineTypes: ["American", "International"],
    specialties: ["food science", "kitchen tips", "classic recipes", "technique analysis"],
    difficultyLevel: "beginner to intermediate",
    featured: true
  },
  {
    name: "Pro Home Cooks",
    bio: "Mike Greenfield teaching practical skills and recipes for cooking better at home with a focus on fundamentals",
    platforms: {
      youtube: {
        channelId: "UCzH5n3Ih5kgQoiDAQt2FwLw",
        handle: "@ProHomeCooks"
      }
    },
    tags: ["home cooking", "basics", "practical", "meal prep"],
    cuisineTypes: ["American", "International"],
    specialties: ["fermentation", "basics", "meal prep", "bread"],
    difficultyLevel: "beginner to intermediate",
    featured: true
  },
  {
    name: "America's Test Kitchen",
    bio: "Expert test cooks sharing meticulously tested recipes with science-based approach and equipment reviews",
    platforms: {
      youtube: {
        channelId: "UCxAS_aK7sS2x_bqnlJHDSHw",
        handle: "@AmericasTestKitchen"
      }
    },
    tags: ["testing", "equipment", "science", "reliable"],
    cuisineTypes: ["American", "International"],
    specialties: ["foolproof recipes", "kitchen equipment", "baking", "technique mastery"],
    difficultyLevel: "intermediate",
    featured: true
  },
  {
    name: "Matty Matheson",
    bio: "Tattooed chef known for irreverent humor and comfort food with a focus on hearty, indulgent dishes",
    platforms: {
      youtube: {
        channelId: "UCEqhyGZCZvPbTdvLYnUqmUQ",
        handle: "@mattymatheson"
      }
    },
    tags: ["humor", "comfort food", "personality", "hearty"],
    cuisineTypes: ["Canadian", "American", "International"],
    specialties: ["comfort food", "meat dishes", "sandwiches", "pasta"],
    difficultyLevel: "beginner to intermediate",
    featured: true
  },
  {
    name: "Jamie Oliver",
    bio: "British chef promoting accessible, nutritious home cooking with emphasis on fresh ingredients and simple techniques",
    platforms: {
      youtube: {
        channelId: "UCpSgg_ECBj25s9moCDfSTsA",
        handle: "@jamieoliver"
      }
    },
    tags: ["family", "accessible", "nutrition", "british"],
    cuisineTypes: ["British", "Italian", "International"],
    specialties: ["family meals", "pasta", "healthy options", "15-minute meals"],
    difficultyLevel: "beginner",
    featured: true
  },
  {
    name: "Seonkyoung Longest",
    bio: "Korean-American chef bringing Asian flavors to home cooks with fusion recipes and restaurant favorites",
    platforms: {
      youtube: {
        channelId: "UCIvA9ZGeoR6CH2e0DZtvxzw",
        handle: "@SeonkyoungLongest"
      }
    },
    tags: ["Asian", "fusion", "restaurant recreations"],
    cuisineTypes: ["Korean", "Chinese", "Japanese", "Asian Fusion"],
    specialties: ["Korean BBQ", "noodles", "Asian-inspired fusion", "banchan"],
    difficultyLevel: "beginner to intermediate",
    featured: true
  },
  {
    name: "Preppy Kitchen",
    bio: "Former math teacher John Kanell creating detailed baking tutorials and elegant desserts with clear instructions",
    platforms: {
      youtube: {
        channelId: "UCTvYEid8tmg0jqGPDkehc_Q",
        handle: "@preppykitchen"
      }
    },
    tags: ["baking", "desserts", "elegant", "detailed"],
    cuisineTypes: ["American", "European"],
    specialties: ["cakes", "cookies", "pies", "holiday baking"],
    difficultyLevel: "intermediate",
    featured: true
  },
  {
    name: "Souped Up Recipes",
    bio: "Mandy Zhu sharing authentic Chinese recipes with detailed techniques and cultural context",
    platforms: {
      youtube: {
        channelId: "UC3HjB3X8jeENm46HCkI0Inw",
        handle: "@SoupedUpRecipes"
      }
    },
    tags: ["Chinese", "authentic", "traditional"],
    cuisineTypes: ["Chinese"],
    specialties: ["dim sum", "noodles", "stir fry", "regional Chinese"],
    difficultyLevel: "intermediate",
    featured: true
  },
  {
    name: "Emmy Made in Japan",
    bio: "Emmy tests unusual recipes, international foods, and vintage dishes with curiosity and detailed taste testing",
    platforms: {
      youtube: {
        channelId: "UCzqbfYjQmf9nLQPMxVgPhiA",
        handle: "@emmymade"
      }
    },
    tags: ["testing", "international", "vintage", "curious"],
    cuisineTypes: ["International", "Japanese", "American"],
    specialties: ["taste tests", "vintage recipes", "Japanese snacks", "international cuisines"],
    difficultyLevel: "beginner to intermediate",
    featured: true
  },
  {
    name: "Brian Lagerstrom",
    bio: "Former restaurant pastry chef and baker focusing on bread, pasta, and restaurant-quality dishes at home",
    platforms: {
      youtube: {
        channelId: "UCNbngWUqL2eqRw12yAwcICg",
        handle: "@brianlagerstrom"
      }
    },
    tags: ["restaurant", "bread", "professional", "techniques"],
    cuisineTypes: ["American", "Italian"],
    specialties: ["bread baking", "pasta making", "sandwich construction", "sauces"],
    difficultyLevel: "intermediate to advanced",
    featured: true
  },
  {
    name: "Not Another Cooking Show",
    bio: "Stephen Cusato creates Italian-American recipes with emphasis on technique, flavor, and quality ingredients",
    platforms: {
      youtube: {
        channelId: "UCuL-5ytBmu6KG0BwjSFaD0g",
        handle: "@notanothercookingshow"
      }
    },
    tags: ["Italian-American", "technique", "flavor"],
    cuisineTypes: ["Italian", "American"],
    specialties: ["pasta", "sauce development", "sandwiches", "comfort food"],
    difficultyLevel: "intermediate",
    featured: true
  }
];

async function getYouTubeAvatar(channelId: string): Promise<string> {
  // For now, using a standard YouTube avatar URL format
  return `https://yt3.googleusercontent.com/ytc/${channelId}=s176-c-k-c0x00ffffff-no-rj`;
}

async function seedCreators() {
  console.log('Starting creator seeding...');
  
  for (const creatorData of creators) {
    try {
      console.log(`Attempting to create creator: ${creatorData.name}`);
      
      // Get avatar URL
      const avatar = await getYouTubeAvatar(creatorData.platforms?.youtube.channelId || '');
      
      // Prepare creator document
      const creator: Creator = {
        ...creatorData as Creator,
        avatar,
        socialLinks: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      console.log('Attempting to create creator with data:', JSON.stringify(creator, null, 2));
      
      // Add to Firestore
      const docRef = await db.collection(CREATORS_COLLECTION).add(creator);
      console.log(`Successfully created creator: ${creator.name} with ID: ${docRef.id}`);
      
    } catch (error) {
      console.error(`Error creating creator ${creatorData.name}:`, error);
    }
  }
  
  console.log('Creator seeding completed successfully!');
  process.exit(0);
}

// Run the seeding
seedCreators().catch(error => {
  console.error('Failed to seed creators:', error);
  process.exit(1);
}); 