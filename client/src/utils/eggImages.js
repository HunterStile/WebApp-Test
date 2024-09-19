// src/utils/eggImages.js
const importAll = (r) => {
    let images = {};
    r.keys().map((item, index) => { images[item.replace('./', '')] = r(item); });
    return images;
  };
  
  const eggImages = importAll(require.context('../assets/images/egg', false, /\.(png|jpe?g|svg)$/));
  
  export default eggImages;