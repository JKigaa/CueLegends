// Pool/billiards images from Pexels (license-free, guaranteed to load)
export const POOL_IMAGES = {
  heroMain: 'https://images.pexels.com/photos/6253911/pexels-photo-6253911.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  heroRed: 'https://images.pexels.com/photos/37063418/pexels-photo-37063418.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  heroBlue: 'https://images.pexels.com/photos/7403785/pexels-photo-7403785.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  playerCue: 'https://images.pexels.com/photos/6253988/pexels-photo-6253988.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  poolHall: 'https://images.pexels.com/photos/7404682/pexels-photo-7404682.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  ballFive: 'https://images.pexels.com/photos/36055834/pexels-photo-36055834.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  orangeBall: 'https://images.pexels.com/photos/11346496/pexels-photo-11346496.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  bwPool: 'https://images.pexels.com/photos/6253677/pexels-photo-6253677.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  cueStick: 'https://images.pexels.com/photos/8724476/pexels-photo-8724476.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  womanYellow: 'https://images.pexels.com/photos/7404684/pexels-photo-7404684.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  manPlaid: 'https://images.pexels.com/photos/7404552/pexels-photo-7404552.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  womanFocus: 'https://images.pexels.com/photos/10627103/pexels-photo-10627103.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  redTable: 'https://images.pexels.com/photos/37063409/pexels-photo-37063409.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  ballAlign: 'https://images.pexels.com/photos/6253676/pexels-photo-6253676.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
};

export const CLUB_COVERS: Record<string, string> = {
  'nairobi-sharks': POOL_IMAGES.poolHall,
  'westlands-cue-club': POOL_IMAGES.heroBlue,
  'mombasa-breakers': POOL_IMAGES.heroRed,
  'kampala-cuesticks': POOL_IMAGES.playerCue,
  'dar-pockets': POOL_IMAGES.cueStick,
  'kasarani-aces': POOL_IMAGES.orangeBall,
};

export const PLAYER_PHOTOS: Record<string, string> = {
  'brian-otieno': POOL_IMAGES.playerCue,
  'james-mwangi': POOL_IMAGES.manPlaid,
  'grace-wanjiru': POOL_IMAGES.womanYellow,
  'ali-hassan': POOL_IMAGES.heroRed,
  'john-mwesigwa': POOL_IMAGES.poolHall,
  'mercy-achieng': POOL_IMAGES.womanFocus,
  'cynthia-akoth': POOL_IMAGES.womanYellow,
};
