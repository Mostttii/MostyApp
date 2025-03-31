export interface Creator {
  id: string;
  name: string;
  username: string;
  bio: string;
  avatar: string;
  coverImage: string;
  platforms: {
    youtube?: {
      channelId: string;
      subscribers: number;
    };
    instagram?: {
      username: string;
      followers: number;
    };
    tiktok?: {
      username: string;
      followers: number;
    };
    blog?: {
      url: string;
      feedUrl: string;
    };
  };
  specialties: string[];
  cuisineTypes: string[];
}

export const creators: Creator[] = [
  {
    id: 'joshua-weissman',
    name: 'Joshua Weissman',
    username: 'joshuaweissman',
    bio: 'Professional chef known for technique-focused recipes and making better versions of popular foods.',
    avatar: 'https://yt3.googleusercontent.com/ytc/APkrFKZVYoVq_bqXvKsGWC5T8dJ5cLF5BFNhvmE8GwYq=s176-c-k-c0x00ffffff-no-rj',
    coverImage: 'https://yt3.googleusercontent.com/HdaCVY_qqn9ZX5ZXCHVZDnGlL7aR6RB2BYB8lh0MZvnE3y6URiWIV1SIbhQOBHKOF0wIZXFa=w2560-fcrop64=1,00005a57ffffa5a8-k-c0xffffffff-no-nd-rj',
    platforms: {
      youtube: {
        channelId: 'UChBEbMKI1eCcejTtmI32UEw',
        subscribers: 6800000,
      },
      instagram: {
        username: 'joshuaweissman',
        followers: 1200000,
      },
    },
    specialties: ['Technique-focused cooking', 'Restaurant recreations', 'Bread making'],
    cuisineTypes: ['American', 'French', 'Asian fusion'],
  },
  {
    id: 'half-baked-harvest',
    name: 'Tieghan Gerard',
    username: 'halfbakedharvest',
    bio: 'Creator of Half Baked Harvest, known for comfort food recipes with a creative twist.',
    avatar: 'https://www.halfbakedharvest.com/wp-content/uploads/2020/01/Tieghan-Gerard-Half-Baked-Harvest.jpg',
    coverImage: 'https://www.halfbakedharvest.com/wp-content/uploads/2020/01/Half-Baked-Harvest-Kitchen.jpg',
    platforms: {
      instagram: {
        username: 'halfbakedharvest',
        followers: 4700000,
      },
      blog: {
        url: 'https://www.halfbakedharvest.com',
        feedUrl: 'https://www.halfbakedharvest.com/feed/',
      },
    },
    specialties: ['Comfort food', 'Seasonal recipes', 'Baking'],
    cuisineTypes: ['American', 'Italian', 'Fusion'],
  },
  {
    id: 'sohla-el-waylly',
    name: 'Sohla El-Waylly',
    username: 'sohlae',
    bio: 'Former Bon Appétit chef known for technical expertise and innovative cooking.',
    avatar: 'https://pbs.twimg.com/profile_images/1280564514146541568/ZF5F5j_q_400x400.jpg',
    coverImage: 'https://www.seriouseats.com/thmb/lR62-1uQlJ7uGj7B_CjZ7jK8TgY=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/__opt__aboutcom__coeus__resources__content_migration__serious_eats__seriouseats.com__images__2016__10__20161012-sohla-el-waylly-vicky-wasik-1-1500x1125-6d8d0a6b9a714935844a25d44c3d49e7.jpg',
    platforms: {
      youtube: {
        channelId: 'UC4kQZ1YhH-LWR_VQY8WXdcg',
        subscribers: 500000,
      },
    },
    specialties: ['Technical cooking', 'Recipe development', 'Culinary education'],
    cuisineTypes: ['Middle Eastern', 'South Asian', 'French'],
  },
  // Add more creators...
];

export const getCreatorById = (id: string): Creator | undefined => {
  return creators.find(creator => creator.id === id);
}; 