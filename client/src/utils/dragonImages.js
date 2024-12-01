// src/utils/dragonImages.js

export const importAll = (r) => {
  let images = {};
  r.keys().map((item) => { 
    images[item.replace('./', '')] = r(item); 
  });
  return images;
};

export const dragonImages = importAll(require.context('../assets/images/dragons', false, /\.(png|jpe?g|svg)$/));

export const getDragonImage = (dragonName) => {
  const imageName = dragonName
    ? `${dragonName.toLowerCase().replace(/ /g, '-')}.png`
    : 'default-dragon.png';
  return dragonImages[imageName];
};