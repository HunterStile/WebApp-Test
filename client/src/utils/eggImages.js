// src/utils/eggImages.js

const importAll = (r) => {
  let images = {};
  r.keys().map((item, index) => { images[item.replace('./', '')] = r(item); });
  return images;
};

const eggImages = importAll(require.context('../assets/images/egg', false, /\.(png|jpe?g|svg)$/));

export const getEggImage = (eggType) => {
  if (!eggType) return null;
  
  // Normalize the egg type name to match file naming convention
  const normalizedName = eggType.toLowerCase().replace(/ /g, '-');
  
  // Try different file extensions
  const extensions = ['png', 'jpg', 'jpeg', 'svg'];
  for (const ext of extensions) {
    const fileName = `${normalizedName}.${ext}`;
    if (eggImages[fileName]) {
      return eggImages[fileName];
    }
  }
  
  // Return a default egg image if no matching image is found
  return eggImages['default-egg.png'] || null;
};

export default getEggImage;