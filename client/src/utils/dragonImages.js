const importAll = (r) => {
    let images = {};
    r.keys().map((item, index) => { images[item.replace('./', '')] = r(item); });
    return images;
  };
  
  const dragonImages = importAll(require.context('../assets/images/dragons', false, /\.(png|jpe?g|svg)$/));
  
  export default dragonImages;
  