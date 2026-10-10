// Creates admin, demo artisans, customer, and products
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Product = require('./models/Product');

const seedDB = async () => {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@artisan.local';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@12345';

  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    admin = await User.create({
      name: 'Platform Administrator',
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
    });
    console.log(`Admin created: ${adminEmail} / ${adminPassword}`);
  }

  let meena = await User.findOne({ email: 'meena@artisan.local' });
  if (!meena) {
    meena = await User.create({
      name: 'Meena Devi',
      email: 'meena@artisan.local',
      password: 'Artisan@123',
      role: 'artisan',
      craft: 'Palm-leaf Basketry & Grass Weaving',
      location: 'Erode, Tamil Nadu',
      community: 'Kaveri Women Weavers Collective',
      bio: 'Third-generation weaver passionate about preserving sustainable palm leaf craft. Working with 24 local rural women to craft durable, eco-friendly lifestyle products.',
    });
    console.log('Demo artisan created: meena@artisan.local / Artisan@123');
  }

  let rajesh = await User.findOne({ email: 'rajesh@artisan.local' });
  if (!rajesh) {
    rajesh = await User.create({
      name: 'Rajesh Prajapati',
      email: 'rajesh@artisan.local',
      password: 'Artisan@123',
      role: 'artisan',
      craft: 'Terracotta Pottery & Glazed Stoneware',
      location: 'Khurja, Uttar Pradesh',
      community: 'Prajapati Clay Guild',
      bio: 'Master potter practicing wheel-thrown ceramics for over 22 years. Known for natural wood-ash glazes and chip-resistant dinnerware.',
    });
    console.log('Demo artisan created: rajesh@artisan.local / Artisan@123');
  }

  let ananya = await User.findOne({ email: 'ananya@artisan.local' });
  if (!ananya) {
    ananya = await User.create({
      name: 'Ananya Sen',
      email: 'ananya@artisan.local',
      password: 'Artisan@123',
      role: 'artisan',
      craft: 'Dhokra Metal Casting & Kantha',
      location: 'Bishnupur, West Bengal',
      community: 'Bengal Heritage Crafts Society',
      bio: 'Practicing the ancient 4,000-year-old lost-wax bell metal casting technique alongside tribal artisan families in rural Bengal.',
    });
    console.log('Demo artisan created: ananya@artisan.local / Artisan@123');
  }

  let customer = await User.findOne({ email: 'rahul@customer.local' });
  if (!customer) {
    customer = await User.create({
      name: 'Rahul Sharma',
      email: 'rahul@customer.local',
      password: 'Customer@123',
      role: 'customer',
      location: 'Bengaluru, Karnataka',
    });
    console.log('Demo customer created: rahul@customer.local / Customer@123');
  }

  const existingCount = await Product.countDocuments();
  if (existingCount === 0) {
    await Product.create([
      {
        artisan: meena._id,
        title: 'Palm-Leaf Storage Basket',
        price: 550,
        stock: 14,
        sold: 22,
        category: 'Basketry',
        materials: 'wild palm leaf, natural turmeric dye',
        images: ['https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=800&q=80'],
        keywords: ['basket', 'palm leaf', 'storage', 'handmade', 'sustainable', 'organizer'],
        descriptions: {
          en: 'A sturdy hand-woven storage basket crafted from mature wild palm leaves by women artisans in Erode. Treated with eco-friendly plant dyes, perfect for organizing toys, throws, or fresh produce.',
          ta: 'ஈரோடு பகுதி பாரம்பரிய கைவினைக் கலைஞர்களால் காடுகளில் கிடைக்கும் பனை ஓலைகளைக் கொண்டு நுணுக்கமாக பின்னப்பட்ட சேமிப்புக் கூடை. இயற்கையான தாவர வண்ணங்களால் மெருகூட்டப்பட்டது.',
          hi: 'इरोड की कुशल महिला कारीगरों द्वारा प्राकृतिक ताड़ के पत्तों से बुनी गई मजबूत और टिकाऊ टोकरी। प्राकृतिक रंगों से रंगी गई यह टोकरी घरेलू सामान रखने के लिए उत्तम है।',
        },
      },
      {
        artisan: rajesh._id,
        title: 'Khurja Hand-Glazed Terracotta Tea Set',
        price: 950,
        stock: 10,
        sold: 35,
        category: 'Pottery',
        materials: 'Khurja red clay, food-grade mineral glaze',
        images: ['https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80'],
        keywords: ['pottery', 'tea set', 'ceramic', 'khurja', 'glazed', 'cups', 'handmade'],
        descriptions: {
          en: 'A six-piece handcrafted ceramic tea cup set with traditional indigo blue floral motifs. Wheel-thrown by master potters of Khurja and fired at 1200°C for exceptional durability and chip-resistance.',
          hi: 'खुर्जा के सिद्धहस्त कुम्हारों द्वारा चाक पर तराशी गई छह कपों की खूबसूरत चाय सेट। इस पर पारंपरिक नीले फूलों की बारीक नक्काशी की गई है जो 1200 डिग्री सेल्सियस पर पकाई गई है।',
          ta: 'பாரம்பரிய குர்ஜா சுடுமண் கலையில் உருவான நேர்த்தியான தேநீர் கோப்பைகள். உணவு-பாதுகாப்பான மெருகூட்டலுடன் உயர் வெப்பத்தில் சுடப்பட்டு தயாரிக்கப்பட்டது.',
        },
      },
      {
        artisan: ananya._id,
        title: 'Dhokra Lost-Wax Cast Brass Tribal Lamp',
        price: 1450,
        stock: 6,
        sold: 14,
        category: 'Metalwork',
        materials: 'recycled brass, beeswax mold, riverbed clay',
        images: ['https://images.unsplash.com/photo-1606293926075-69a00dbfde81?auto=format&fit=crop&w=800&q=80'],
        keywords: ['dhokra', 'brass', 'metalwork', 'tribal', 'diya', 'lamp', 'vintage', 'antique'],
        descriptions: {
          en: 'An authentic 4,000-year-old non-ferrous lost-wax casting technique (Dhokra) depicting traditional tribal dancers holding a ceremonial oil diya. A timeless heritage accent for festive decor and living spaces.',
          bn: '৪০০০ বছরের প্রাচীন ডোকরা পদ্ধতিতে মোম ও কাঁসার সংমিশ্রণে তৈরি ঐতিহ্যবাহী আদিবাসী নৃত্যশিল্পী ও প্রদীপ। হস্তশিল্পপ্রেমীদের ঘরের জন্য এক অনন্য অলঙ্কার।',
          hi: 'प्राचीन ढोकरा शिल्प तकनीक से तैयार की गई पीतल की पारंपरिक आदिवासी दीप। मोम और मिट्टी के सांचे से ढली यह कलाकृति घर की सजावट को राजसी गरिमा प्रदान करती है।',
        },
      },
      {
        artisan: meena._id,
        title: 'Kutch Hand-Embroidered Wall Hanging',
        price: 1200,
        stock: 8,
        sold: 19,
        category: 'Textiles',
        materials: 'organic khadi cotton, silk thread, glass mirror work',
        images: ['https://images.unsplash.com/photo-1617042375876-a13e36732a04?auto=format&fit=crop&w=800&q=80'],
        keywords: ['textiles', 'embroidery', 'kutch', 'tapestry', 'wall hanging', 'mirror work', 'boho'],
        descriptions: {
          en: 'Spectacular hand-embroidered wall tapestry showcasing intricate geometric needlework and genuine mirror embellishments. Celebrates the rich pastoral traditions of Western India.',
          hi: 'कच्छ की लोक परंपरा को दर्शाती हाथ से काढ़ी गई सुंदर दीवार सज्जा। इसमें महीन सुई-धागे का काम और छोटे गोल शीशे जड़े हुए हैं।',
          ta: 'கையால் எம்பிராய்டரி செய்யப்பட்ட நேர்த்தியான சுவரொட்டி. தூய பருத்தி துணியில் கண்ணாடி வேலைப்பாடுகளுடன் கூடிய அசல் கலைப்படைப்பு.',
        },
      },
      {
        artisan: rajesh._id,
        title: 'Carved Sheesham Wood Masala Spice Box',
        price: 850,
        stock: 15,
        sold: 42,
        category: 'Woodwork',
        materials: 'seasoned Sheesham Indian rosewood, brass latch, glass',
        images: ['https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80'],
        keywords: ['woodwork', 'spice box', 'masala dabba', 'sheesham', 'carved', 'kitchen', 'artisan'],
        descriptions: {
          en: 'Handcrafted 7-compartment wooden masala dabba carved from seasoned Indian rosewood. Finished with natural beeswax polish to safeguard aroma and freshness of daily spices.',
          hi: 'शीशम की मजबूत लकड़ी से हस्तनिर्मित 7 खानों वाला सुंदर मसाला डिब्बा। प्राकृतिक मोम की पॉलिश से सुरक्षित, रसोईघर के लिए एक उत्कृष्ट और टिकाऊ विकल्प।',
        },
      },
      {
        artisan: ananya._id,
        title: 'Hand-Hammered Pure Copper Water Carafe',
        price: 1800,
        stock: 7,
        sold: 18,
        category: 'Metalwork',
        materials: '99.7% pure virgin copper, hand-beaten pattern',
        images: ['https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=800&q=80'],
        keywords: ['copper', 'hammered', 'carafe', 'jug', 'ayurvedic', 'health', 'metalwork'],
        descriptions: {
          en: 'Ayurvedic copper water carafe meticulously hammered by generational coppersmiths. Encourages healthy alkalinity and balances body doshas while gracing any dinner table.',
          hi: 'शुद्ध तांबे से पारंपरिक हथौड़े की मार से तैयार किया गया स्वास्थ्यवर्धक जग। आयुर्वेद के अनुसार तांबे के बर्तन में रखा पानी शरीर के लिए अमृत समान है।',
        },
      },
      {
        artisan: meena._id,
        title: 'Woven River-Grass Dining Placemats (Set of 4)',
        price: 680,
        stock: 12,
        sold: 28,
        category: 'Basketry',
        materials: 'natural korai river grass, organic cotton loom warps',
        images: ['https://images.unsplash.com/photo-1590736969955-71cc94801759?auto=format&fit=crop&w=800&q=80'],
        keywords: ['placemats', 'river grass', 'korai', 'table mat', 'woven', 'dining', 'eco-friendly'],
        descriptions: {
          en: 'Eco-friendly korai grass table mats woven on traditional hand-looms. Naturally heat resistant, lightweight, and easy to wipe clean after meals.',
          ta: 'பாரம்பரிய தறியில் நெய்யப்பட்ட இயற்கை கோரைப்புல் உணவு மேஜை பாய்கள். வெப்பத்தை தாங்கக்கூடியது மற்றும் சுலபமாக துடைத்து சுத்தம் செய்யலாம்.',
        },
      },
      {
        artisan: rajesh._id,
        title: 'Terracotta Handcrafted Aromatherapy Diffuser',
        price: 420,
        stock: 18,
        sold: 15,
        category: 'Home Decor',
        materials: 'fired terracotta earthenware clay, jali lattice cutwork',
        images: ['https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80'],
        keywords: ['terracotta', 'diffuser', 'incense', 'burner', 'jali', 'decor', 'clay'],
        descriptions: {
          en: 'Earthy clay diffuser crafted with intricate jali-style ventilation patterns that cast serene geometric shadows as fragrant essential oils or incense disperse.',
          hi: 'प्राकृतिक चिकनी मिट्टी से बना खूबसूरत धूपदानी एवं डिफ्यूज़र। जालीदार नक्काशी से निकलने वाली सुगंध और रोशनी घर में शांति और सकारात्मकता लाती है।',
        },
      },
    ]);
    console.log('Seeded 8 authentic artisan products.');
  }
};

module.exports = seedDB;

if (require.main === module) {
  (async () => {
    try {
      const connectDB = require('./config/db');
      await connectDB();
      await seedDB();
      console.log('Seeding completed successfully.');
      process.exit(0);
    } catch (e) {
      console.error('Seeding failed:', e);
      process.exit(1);
    }
  })();
}
