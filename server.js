const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3444;
const publicDir = path.join(__dirname, 'public');
const templatePath = path.join(publicDir, 'index.html');
const template = fs.readFileSync(templatePath, 'utf8');

const defaultSeo = {
  title: 'ImgConvertCrop.com | Convert, Crop, Compress Images Free',
  description:
    'ImgConvertCrop is a fast, free online image tool to convert formats, crop images, and compress files directly in your browser. We never save your images.',
  canonicalPath: '/',
  ogTitle: 'ImgConvertCrop.com | Convert, Crop, Compress Images Free',
  ogDescription:
    'Convert image formats, crop precisely, and compress online for free. Fast in-browser processing, and we never save your images.',
  twitterTitle: 'ImgConvertCrop.com | Convert, Crop, Compress Images Free',
  twitterDescription:
    'Free online image converter, cropper, and compressor. Runs in browser with privacy-first processing.',
  heroTitle: 'ImgConvertCrop',
  heroSubtitle:
    'Fast, free image tools in one place: convert formats, crop precisely, and compress in seconds. We never save your images.',
  seoH2: 'Free Online Image Converter, Cropper, and Compressor',
  seoP1: 'ImgConvertCrop helps you convert image formats, crop with precision, and reduce file size in seconds.',
  seoP2: 'Everything runs in your browser for speed and privacy. We never save your images.',
  seoLi1: 'Convert to JPEG, PNG, WEBP, and AVIF',
  seoLi2: 'Modern interactive crop with optional resize',
  seoLi3: 'Compress image files while keeping dimensions',
  keywordTitle: 'Popular Search Terms in the United States',
  keywordText:
    'Common queries include "image converter online free", "crop image online no watermark", and "compress image online free".',
  activeTab: 'convert'
};

const supportedLocales = ['en', 'es', 'zh', 'hi', 'ar', 'ja', 'ko'];
const localeMeta = {
  en: { name: 'English', htmlLang: 'en', dir: 'ltr' },
  es: { name: 'Espanol', htmlLang: 'es', dir: 'ltr' },
  zh: { name: '中文', htmlLang: 'zh-CN', dir: 'ltr' },
  hi: { name: 'Hindi', htmlLang: 'hi', dir: 'ltr' },
  ar: { name: 'العربية', htmlLang: 'ar', dir: 'rtl' },
  ja: { name: '日本語', htmlLang: 'ja', dir: 'ltr' },
  ko: { name: '한국어', htmlLang: 'ko', dir: 'ltr' }
};

const copyTranslations = {
  es: {
    'ImgConvertCrop.com | Convert, Crop, Compress Images Free': 'ImgConvertCrop.com | Convertir, Recortar y Comprimir Imagenes Gratis',
    'Free online image converter, cropper, and compressor. Runs in browser with privacy-first processing.':
      'Convertidor, recortador y compresor de imagenes gratis. Funciona en el navegador con privacidad primero.',
    'Convert image formats, crop precisely, and compress online for free. Fast in-browser processing, and we never save your images.':
      'Convierte formatos de imagen, recorta con precision y comprime en linea gratis. Rapido en navegador y nunca guardamos tus imagenes.',
    'Free Online Image Converter, Cropper, and Compressor': 'Convertidor, recortador y compresor de imagenes gratis en linea',
    'ImgConvertCrop helps you convert image formats, crop with precision, and reduce file size in seconds.':
      'ImgConvertCrop te ayuda a convertir formatos, recortar con precision y reducir el tamano en segundos.',
    'Everything runs in your browser for speed and privacy. We never save your images.':
      'Todo se ejecuta en tu navegador para velocidad y privacidad. Nunca guardamos tus imagenes.',
    'Convert to JPEG, PNG, WEBP, and AVIF': 'Convierte a JPEG, PNG, WEBP y AVIF',
    'Modern interactive crop with optional resize': 'Recorte interactivo moderno con cambio de tamano opcional',
    'Compress image files while keeping dimensions': 'Comprime imagenes manteniendo las dimensiones',
    'Free Image Converter': 'Convertidor de imagenes gratis',
    'Convert JPG, PNG, WEBP, and AVIF in seconds. Privacy-first, browser-based processing.':
      'Convierte JPG, PNG, WEBP y AVIF en segundos. Procesamiento en el navegador con privacidad primero.',
    'Convert Images Between Popular Formats': 'Convierte imagenes entre formatos populares',
    'Use this tool to convert image files without installing software.':
      'Usa esta herramienta para convertir imagenes sin instalar software.',
    'Choose output format and quality, then download instantly.':
      'Elige formato y calidad de salida, luego descarga al instante.',
    'JPG to WEBP converter': 'Convertidor de JPG a WEBP',
    'PNG to JPG converter': 'Convertidor de PNG a JPG',
    'JPG to AVIF converter': 'Convertidor de JPG a AVIF',
    'JPG to WEBP Converter Online Free': 'Convertidor JPG a WEBP en linea gratis',
    'JPG to WEBP Converter': 'Convertidor JPG a WEBP',
    'Convert JPG to WEBP online for smaller image files and better web performance. No server upload required.':
      'Convierte JPG a WEBP en linea para archivos mas pequenos y mejor rendimiento web. No se requiere subir al servidor.',
    'Turn JPEG images into WEBP to cut file size for websites and apps.':
      'Convierte imagenes JPEG a WEBP para reducir tamano en sitios web y apps.',
    'Convert JPG to WEBP for Better Compression': 'Convierte JPG a WEBP para mejor compresion',
    'WEBP usually provides smaller files than JPG at similar visual quality.':
      'WEBP normalmente ofrece archivos mas pequenos que JPG con una calidad visual similar.',
    'Choose quality level and download your WEBP image instantly.':
      'Elige el nivel de calidad y descarga tu imagen WEBP al instante.',
    'Fast in-browser processing': 'Procesamiento rapido en el navegador',
    'No image upload to server': 'Sin subida de imagen al servidor',
    'Quality control supported': 'Control de calidad disponible',
    'Popular Search Terms in the United States': 'Terminos de busqueda populares en espanol',
    'Common queries include "image converter online free", "crop image online no watermark", and "compress image online free".':
      'Busquedas comunes en espanol incluyen "convertidor de imagenes online gratis", "recortar imagen online sin marca de agua" y "comprimir imagen online gratis".',
    'Image Converter Online': 'Convertidor de imagenes en linea',
    'PNG to JPG Converter': 'Convertidor PNG a JPG',
    'JPG to AVIF Converter': 'Convertidor JPG a AVIF',
    'US-focused intent terms: "image converter online free", "png to jpg online free", "jpg to webp converter", "jpg to avif online".':
      'Terminos de intencion en espanol: "convertidor de imagenes online gratis", "png a jpg online gratis", "jpg a webp", "jpg a avif online".',
    'US-focused intent terms: "crop image online free", "crop image no watermark", "crop to square", "crop image to 16:9".':
      'Terminos de intencion en espanol: "recortar imagen online gratis", "recortar imagen sin marca de agua", "recortar a cuadrado", "recortar imagen a 16:9".',
    'US-focused intent terms: "compress image online free", "jpeg compressor online", "compress webp", "compress avif image".':
      'Terminos de intencion en espanol: "comprimir imagen online gratis", "compresor jpeg online", "comprimir webp", "comprimir imagen avif".',
    'Related pages': 'Paginas relacionadas'
  },
  zh: {
    'ImgConvertCrop.com | Convert, Crop, Compress Images Free': 'ImgConvertCrop.com | 免费图片转换、裁剪、压缩',
    'Free online image converter, cropper, and compressor. Runs in browser with privacy-first processing.':
      '免费在线图片转换、裁剪与压缩。浏览器内处理，隐私优先。',
    'Convert image formats, crop precisely, and compress online for free. Fast in-browser processing, and we never save your images.':
      '免费在线转换图片格式、精准裁剪与压缩。浏览器内快速处理，我们不会保存你的图片。',
    'Free Online Image Converter, Cropper, and Compressor': '免费在线图片转换、裁剪与压缩',
    'ImgConvertCrop helps you convert image formats, crop with precision, and reduce file size in seconds.':
      'ImgConvertCrop 帮你快速完成格式转换、精准裁剪，并在几秒内减小文件体积。',
    'Everything runs in your browser for speed and privacy. We never save your images.':
      '所有处理都在你的浏览器中完成，兼顾速度与隐私。我们不会保存你的图片。',
    'Convert to JPEG, PNG, WEBP, and AVIF': '支持转换为 JPEG、PNG、WEBP、AVIF',
    'Modern interactive crop with optional resize': '现代交互式裁剪，支持可选调整尺寸',
    'Compress image files while keeping dimensions': '在保持尺寸不变的情况下压缩图片',
    'Free Image Converter': '免费图片转换器',
    'Convert JPG, PNG, WEBP, and AVIF in seconds. Privacy-first, browser-based processing.':
      '几秒内完成 JPG、PNG、WEBP、AVIF 转换。浏览器内处理，隐私优先。',
    'Convert Images Between Popular Formats': '在常见图片格式之间转换',
    'Use this tool to convert image files without installing software.':
      '使用此工具可在不安装软件的情况下转换图片文件。',
    'Choose output format and quality, then download instantly.':
      '选择输出格式和质量后即可立即下载。',
    'JPG to WEBP converter': 'JPG 转 WEBP 转换',
    'PNG to JPG converter': 'PNG 转 JPG 转换',
    'JPG to AVIF converter': 'JPG 转 AVIF 转换',
    'JPG to WEBP Converter Online Free': 'JPG 转 WEBP 在线免费',
    'JPG to WEBP Converter': 'JPG 转 WEBP 转换器',
    'Convert JPG to WEBP online for smaller image files and better web performance. No server upload required.':
      '在线将 JPG 转为 WEBP，可获得更小文件并提升网页性能。无需上传到服务器。',
    'Turn JPEG images into WEBP to cut file size for websites and apps.':
      '将 JPEG 图片转换为 WEBP，以减少网站和应用中的文件大小。',
    'Convert JPG to WEBP for Better Compression': '将 JPG 转为 WEBP 以获得更高压缩率',
    'WEBP usually provides smaller files than JPG at similar visual quality.':
      '在相近画质下，WEBP 通常比 JPG 文件更小。',
    'Choose quality level and download your WEBP image instantly.':
      '选择质量等级后即可立即下载 WEBP 图片。',
    'Fast in-browser processing': '浏览器内快速处理',
    'No image upload to server': '无需上传图片到服务器',
    'Quality control supported': '支持质量控制',
    'Popular Search Terms in the United States': '中文热门搜索词',
    'Common queries include "image converter online free", "crop image online no watermark", and "compress image online free".':
      '常见中文搜索包括“图片在线转换免费”、“在线裁剪图片 无水印”、“在线压缩图片 免费”。',
    'Image Converter Online': '在线图片转换器',
    'PNG to JPG Converter': 'PNG 转 JPG 转换器',
    'JPG to AVIF Converter': 'JPG 转 AVIF 转换器',
    'US-focused intent terms: "image converter online free", "png to jpg online free", "jpg to webp converter", "jpg to avif online".':
      '中文常见搜索词："图片在线转换免费"、"png转jpg 在线"、"jpg转webp"、"jpg转avif 在线"。',
    'US-focused intent terms: "crop image online free", "crop image no watermark", "crop to square", "crop image to 16:9".':
      '中文常见搜索词："在线裁剪图片 免费"、"裁剪图片 无水印"、"图片裁剪成正方形"、"图片裁剪 16:9"。',
    'US-focused intent terms: "compress image online free", "jpeg compressor online", "compress webp", "compress avif image".':
      '中文常见搜索词："在线压缩图片 免费"、"jpeg压缩 在线"、"压缩webp"、"压缩avif图片"。',
    'Related pages': '相关页面'
  },
  hi: {
    'ImgConvertCrop.com | Convert, Crop, Compress Images Free': 'ImgConvertCrop.com | मुफ्त इमेज कन्वर्ट, क्रॉप और कंप्रेस',
    'Free online image converter, cropper, and compressor. Runs in browser with privacy-first processing.':
      'मुफ्त ऑनलाइन इमेज कन्वर्टर, क्रॉपर और कंप्रेसर। ब्राउज़र में चलता है और गोपनीयता प्राथमिक है।',
    'Convert image formats, crop precisely, and compress online for free. Fast in-browser processing, and we never save your images.':
      'इमेज फॉर्मेट बदलें, सटीक क्रॉप करें और मुफ्त में ऑनलाइन कंप्रेस करें। सब कुछ ब्राउज़र में तेज़ी से होता है और हम आपकी इमेज सेव नहीं करते।',
    'Free Online Image Converter, Cropper, and Compressor': 'मुफ्त ऑनलाइन इमेज कन्वर्टर, क्रॉपर और कंप्रेसर',
    'ImgConvertCrop helps you convert image formats, crop with precision, and reduce file size in seconds.':
      'ImgConvertCrop आपको इमेज फॉर्मेट बदलने, सटीक क्रॉप करने और सेकंडों में फाइल साइज़ घटाने में मदद करता है।',
    'Everything runs in your browser for speed and privacy. We never save your images.':
      'सब कुछ आपके ब्राउज़र में चलता है, जिससे गति और गोपनीयता दोनों मिलती हैं। हम आपकी इमेज सेव नहीं करते।',
    'Convert to JPEG, PNG, WEBP, and AVIF': 'JPEG, PNG, WEBP और AVIF में कन्वर्ट करें',
    'Modern interactive crop with optional resize': 'वैकल्पिक रिसाइज़ के साथ आधुनिक इंटरएक्टिव क्रॉप',
    'Compress image files while keeping dimensions': 'डायमेंशन बनाए रखते हुए इमेज फाइल कंप्रेस करें',
    'Free Image Converter': 'मुफ्त इमेज कन्वर्टर',
    'Convert JPG, PNG, WEBP, and AVIF in seconds. Privacy-first, browser-based processing.':
      'JPG, PNG, WEBP और AVIF को सेकंडों में कन्वर्ट करें। गोपनीयता-प्राथमिक, ब्राउज़र-आधारित प्रोसेसिंग।',
    'Convert Images Between Popular Formats': 'लोकप्रिय फॉर्मेट्स के बीच इमेज कन्वर्ट करें',
    'Use this tool to convert image files without installing software.':
      'बिना सॉफ्टवेयर इंस्टॉल किए इमेज फाइल कन्वर्ट करने के लिए इस टूल का उपयोग करें।',
    'Choose output format and quality, then download instantly.':
      'आउटपुट फॉर्मेट और क्वालिटी चुनें, फिर तुरंत डाउनलोड करें।',
    'JPG to WEBP converter': 'JPG से WEBP कन्वर्टर',
    'PNG to JPG converter': 'PNG से JPG कन्वर्टर',
    'JPG to AVIF converter': 'JPG से AVIF कन्वर्टर',
    'JPG to WEBP Converter Online Free': 'JPG से WEBP कन्वर्टर ऑनलाइन फ्री',
    'JPG to WEBP Converter': 'JPG से WEBP कन्वर्टर',
    'Convert JPG to WEBP online for smaller image files and better web performance. No server upload required.':
      'छोटी इमेज फाइल और बेहतर वेब परफॉर्मेंस के लिए JPG को WEBP में ऑनलाइन बदलें। सर्वर अपलोड की जरूरत नहीं।',
    'Turn JPEG images into WEBP to cut file size for websites and apps.':
      'वेबसाइट और ऐप के लिए फाइल साइज़ घटाने हेतु JPEG को WEBP में बदलें।',
    'Convert JPG to WEBP for Better Compression': 'बेहतर कंप्रेशन के लिए JPG को WEBP में बदलें',
    'WEBP usually provides smaller files than JPG at similar visual quality.':
      'एक जैसी दृश्य गुणवत्ता पर WEBP आमतौर पर JPG से छोटी फाइल देता है।',
    'Choose quality level and download your WEBP image instantly.':
      'क्वालिटी लेवल चुनें और अपनी WEBP इमेज तुरंत डाउनलोड करें।',
    'Fast in-browser processing': 'ब्राउज़र में तेज प्रोसेसिंग',
    'No image upload to server': 'इमेज सर्वर पर अपलोड नहीं होती',
    'Quality control supported': 'क्वालिटी कंट्रोल उपलब्ध',
    'Popular Search Terms in the United States': 'हिंदी में लोकप्रिय खोज शब्द',
    'Common queries include "image converter online free", "crop image online no watermark", and "compress image online free".':
      'आम हिंदी खोजों में "इमेज कन्वर्टर ऑनलाइन फ्री", "इमेज क्रॉप ऑनलाइन बिना वॉटरमार्क", और "इमेज कंप्रेस ऑनलाइन फ्री" शामिल हैं।',
    'Image Converter Online': 'इमेज कन्वर्टर ऑनलाइन',
    'PNG to JPG Converter': 'PNG से JPG कन्वर्टर',
    'JPG to AVIF Converter': 'JPG से AVIF कन्वर्टर',
    'US-focused intent terms: "image converter online free", "png to jpg online free", "jpg to webp converter", "jpg to avif online".':
      'हिंदी सर्च इंटेंट शब्द: "इमेज कन्वर्टर ऑनलाइन फ्री", "png से jpg ऑनलाइन", "jpg से webp", "jpg से avif ऑनलाइन"।',
    'US-focused intent terms: "crop image online free", "crop image no watermark", "crop to square", "crop image to 16:9".':
      'हिंदी सर्च इंटेंट शब्द: "इमेज क्रॉप ऑनलाइन फ्री", "क्रॉप इमेज बिना वॉटरमार्क", "स्क्वेयर में क्रॉप", "इमेज 16:9 में क्रॉप"।',
    'US-focused intent terms: "compress image online free", "jpeg compressor online", "compress webp", "compress avif image".':
      'हिंदी सर्च इंटेंट शब्द: "इमेज कंप्रेस ऑनलाइन फ्री", "jpeg कंप्रेसर ऑनलाइन", "webp कंप्रेस", "avif इमेज कंप्रेस"।',
    'Related pages': 'संबंधित पेज'
  },
  ar: {
    'ImgConvertCrop.com | Convert, Crop, Compress Images Free': 'ImgConvertCrop.com | تحويل وقص وضغط الصور مجانا',
    'Free online image converter, cropper, and compressor. Runs in browser with privacy-first processing.':
      'محول وقاص وضاغط صور مجاني عبر الإنترنت. يعمل داخل المتصفح مع أولوية للخصوصية.',
    'Convert image formats, crop precisely, and compress online for free. Fast in-browser processing, and we never save your images.':
      'حوّل صيغ الصور واقصها بدقة واضغطها مجانا عبر الإنترنت. معالجة سريعة داخل المتصفح ونحن لا نحفظ صورك.',
    'Free Online Image Converter, Cropper, and Compressor': 'محول وقاص وضاغط صور مجاني عبر الإنترنت',
    'ImgConvertCrop helps you convert image formats, crop with precision, and reduce file size in seconds.':
      'يساعدك ImgConvertCrop على تحويل صيغ الصور والقص بدقة وتقليل حجم الملف خلال ثوانٍ.',
    'Everything runs in your browser for speed and privacy. We never save your images.':
      'كل شيء يعمل في متصفحك لسرعة أكبر وخصوصية أفضل. نحن لا نحفظ صورك.',
    'Convert to JPEG, PNG, WEBP, and AVIF': 'تحويل إلى JPEG وPNG وWEBP وAVIF',
    'Modern interactive crop with optional resize': 'قص تفاعلي حديث مع تغيير حجم اختياري',
    'Compress image files while keeping dimensions': 'ضغط ملفات الصور مع الحفاظ على الأبعاد',
    'Free Image Converter': 'محول صور مجاني',
    'Convert JPG, PNG, WEBP, and AVIF in seconds. Privacy-first, browser-based processing.':
      'حوّل JPG وPNG وWEBP وAVIF خلال ثوانٍ. معالجة داخل المتصفح مع أولوية للخصوصية.',
    'Convert Images Between Popular Formats': 'حوّل الصور بين الصيغ الشائعة',
    'Use this tool to convert image files without installing software.':
      'استخدم هذه الأداة لتحويل ملفات الصور دون تثبيت برامج.',
    'Choose output format and quality, then download instantly.':
      'اختر صيغة الإخراج والجودة ثم نزّل فورًا.',
    'JPG to WEBP converter': 'محول JPG إلى WEBP',
    'PNG to JPG converter': 'محول PNG إلى JPG',
    'JPG to AVIF converter': 'محول JPG إلى AVIF',
    'JPG to WEBP Converter Online Free': 'محول JPG إلى WEBP مجانا عبر الإنترنت',
    'JPG to WEBP Converter': 'محول JPG إلى WEBP',
    'Convert JPG to WEBP online for smaller image files and better web performance. No server upload required.':
      'حوّل JPG إلى WEBP عبر الإنترنت للحصول على ملفات أصغر وأداء ويب أفضل. لا يلزم الرفع إلى الخادم.',
    'Turn JPEG images into WEBP to cut file size for websites and apps.':
      'حوّل صور JPEG إلى WEBP لتقليل حجم الملفات للمواقع والتطبيقات.',
    'Convert JPG to WEBP for Better Compression': 'حوّل JPG إلى WEBP لضغط أفضل',
    'WEBP usually provides smaller files than JPG at similar visual quality.':
      'عادة ما يوفر WEBP ملفات أصغر من JPG عند جودة مرئية متقاربة.',
    'Choose quality level and download your WEBP image instantly.':
      'اختر مستوى الجودة ثم نزّل صورة WEBP فورا.',
    'Fast in-browser processing': 'معالجة سريعة داخل المتصفح',
    'No image upload to server': 'بدون رفع الصورة إلى الخادم',
    'Quality control supported': 'يدعم التحكم في الجودة',
    'Popular Search Terms in the United States': 'مصطلحات البحث الشائعة بالعربية',
    'Common queries include "image converter online free", "crop image online no watermark", and "compress image online free".':
      'تشمل عمليات البحث العربية الشائعة "تحويل الصور اونلاين مجانا" و"قص الصور اونلاين بدون علامة مائية" و"ضغط الصور اونلاين مجانا".',
    'Image Converter Online': 'محول الصور عبر الإنترنت',
    'PNG to JPG Converter': 'محول PNG إلى JPG',
    'JPG to AVIF Converter': 'محول JPG إلى AVIF',
    'US-focused intent terms: "image converter online free", "png to jpg online free", "jpg to webp converter", "jpg to avif online".':
      'مصطلحات نية البحث بالعربية: "تحويل الصور اونلاين مجانا" و"png الى jpg اونلاين" و"jpg الى webp" و"jpg الى avif اونلاين".',
    'US-focused intent terms: "crop image online free", "crop image no watermark", "crop to square", "crop image to 16:9".':
      'مصطلحات نية البحث بالعربية: "قص الصور اونلاين مجانا" و"قص الصور بدون علامة مائية" و"قص الصورة مربع" و"قص الصورة 16:9".',
    'US-focused intent terms: "compress image online free", "jpeg compressor online", "compress webp", "compress avif image".':
      'مصطلحات نية البحث بالعربية: "ضغط الصور اونلاين مجانا" و"jpeg compressor online" و"ضغط webp" و"ضغط صورة avif".',
    'Related pages': 'صفحات ذات صلة'
  }
};

const toolInternalLinks = {
  convert: [
    { href: '/convert', label: 'Image Converter Online' },
    { href: '/convert/png-to-jpg', label: 'PNG to JPG Converter' },
    { href: '/convert/jpg-to-webp', label: 'JPG to WEBP Converter' },
    { href: '/convert/jpg-to-avif', label: 'JPG to AVIF Converter' }
  ],
  crop: [
    { href: '/crop', label: 'Image Cropper Online' },
    { href: '/crop/resize-image', label: 'Crop and Resize Image' },
    { href: '/crop/crop-to-square', label: 'Crop Image to Square' },
    { href: '/crop/crop-to-16-9', label: 'Crop Image to 16:9' }
  ],
  compress: [
    { href: '/compress', label: 'Image Compressor Online' },
    { href: '/compress/jpeg', label: 'JPEG Compressor' },
    { href: '/compress/webp', label: 'WEBP Compressor' },
    { href: '/compress/avif', label: 'AVIF Compressor' }
  ],
  upscale: [
    { href: '/upscale', label: 'Image Upscaler Online' }
  ],
  remove: [
    { href: '/remove', label: 'Object Remover Online' }
  ]
};

const toolKeywordCopy = {
  convert:
    'US-focused intent terms: "image converter online free", "png to jpg online free", "jpg to webp converter", "jpg to avif online".',
  crop:
    'US-focused intent terms: "crop image online free", "crop image no watermark", "crop to square", "crop image to 16:9".',
  compress:
    'US-focused intent terms: "compress image online free", "jpeg compressor online", "compress webp", "compress avif image".',
  upscale:
    'US-focused intent terms: "ai image upscaler online free", "increase image resolution ai", "photo enhancer ai", "2x ai upscaler".',
  remove:
    'US-focused intent terms: "remove object from photo online", "ai object remover free", "erase unwanted object from image", "inpaint image online".'
};

const pages = {
  '/': {},
  '/convert': {
    title: 'Free Image Converter Online | JPG PNG WEBP AVIF',
    description: 'Convert images online for free. Change JPG, PNG, WEBP, and AVIF formats in your browser with no upload to server.',
    canonicalPath: '/convert',
    ogTitle: 'Free Image Converter Online | ImgConvertCrop',
    twitterTitle: 'Free Image Converter Online | ImgConvertCrop',
    heroTitle: 'Free Image Converter',
    heroSubtitle: 'Convert JPG, PNG, WEBP, and AVIF in seconds. Privacy-first, browser-based processing.',
    seoH2: 'Convert Images Between Popular Formats',
    seoP1: 'Use this tool to convert image files without installing software.',
    seoP2: 'Choose output format and quality, then download instantly.',
    seoLi1: 'JPG to WEBP converter',
    seoLi2: 'PNG to JPG converter',
    seoLi3: 'JPG to AVIF converter',
    activeTab: 'convert'
  },
  '/convert/png-to-jpg': {
    title: 'PNG to JPG Converter Online Free',
    description: 'Convert PNG to JPG online for free. Fast browser-based PNG to JPEG conversion with adjustable quality.',
    canonicalPath: '/convert/png-to-jpg',
    heroTitle: 'PNG to JPG Converter',
    heroSubtitle: 'Convert PNG images to JPG format quickly with size-friendly output.',
    seoH2: 'Convert PNG to JPG in Browser',
    seoP1: 'Great for reducing PNG file size when transparency is not needed.',
    seoP2: 'Your image stays local in your browser for better privacy.',
    seoLi1: 'No signup required',
    seoLi2: 'Set JPG quality before export',
    seoLi3: 'Works on desktop and mobile',
    activeTab: 'convert',
    convertFormat: 'jpeg',
    convertQuality: 90
  },
  '/convert/jpg-to-webp': {
    title: 'JPG to WEBP Converter Online Free',
    description: 'Convert JPG to WEBP online for smaller image files and better web performance. No server upload required.',
    canonicalPath: '/convert/jpg-to-webp',
    heroTitle: 'JPG to WEBP Converter',
    heroSubtitle: 'Turn JPEG images into WEBP to cut file size for websites and apps.',
    seoH2: 'Convert JPG to WEBP for Better Compression',
    seoP1: 'WEBP usually provides smaller files than JPG at similar visual quality.',
    seoP2: 'Choose quality level and download your WEBP image instantly.',
    seoLi1: 'Fast in-browser processing',
    seoLi2: 'No image upload to server',
    seoLi3: 'Quality control supported',
    activeTab: 'convert',
    convertFormat: 'webp',
    convertQuality: 85
  },
  '/convert/jpg-to-avif': {
    title: 'JPG to AVIF Converter Online Free',
    description: 'Convert JPG to AVIF online in your browser. Create modern, high-efficiency AVIF images for web delivery.',
    canonicalPath: '/convert/jpg-to-avif',
    heroTitle: 'JPG to AVIF Converter',
    heroSubtitle: 'Convert JPEG files to AVIF for high compression and modern browser support.',
    seoH2: 'Convert JPG to AVIF with Quality Control',
    seoP1: 'AVIF can significantly reduce image file size compared with legacy formats.',
    seoP2: 'If your browser supports AVIF encoding, conversion completes locally and quickly.',
    seoLi1: 'Modern AVIF output',
    seoLi2: 'No account needed',
    seoLi3: 'Runs directly in browser',
    activeTab: 'convert',
    convertFormat: 'avif',
    convertQuality: 80
  },
  '/crop': {
    title: 'Crop Image Online Free | Precise Image Cropper',
    description: 'Crop images online for free with an interactive crop box. Optionally resize after crop and export as JPG, PNG, WEBP, or AVIF.',
    canonicalPath: '/crop',
    ogTitle: 'Crop Image Online Free | ImgConvertCrop',
    twitterTitle: 'Crop Image Online Free | ImgConvertCrop',
    heroTitle: 'Free Image Cropper',
    heroSubtitle: 'Drag, resize, and export exact crop areas with optional resize after crop.',
    seoH2: 'Crop Images with an Interactive Frame',
    seoP1: 'Use drag-and-resize handles to choose the exact area to keep.',
    seoP2: 'Export cropped images in popular formats in one click.',
    seoLi1: 'Precision crop selection',
    seoLi2: 'Optional post-crop resize',
    seoLi3: 'Multiple output formats',
    activeTab: 'crop'
  },
  '/crop/resize-image': {
    title: 'Resize Image After Crop Online Free',
    description: 'Crop and resize images online for free. Set a crop area, then scale down to target width and height while keeping aspect ratio.',
    canonicalPath: '/crop/resize-image',
    heroTitle: 'Crop and Resize Image',
    heroSubtitle: 'Select crop area first, then resize output dimensions for web, social, or upload limits.',
    seoH2: 'Resize Image from Cropped Area',
    seoP1: 'Enable the resize option to scale the cropped image to your target size.',
    seoP2: 'Aspect ratio is preserved and images are never stretched.',
    seoLi1: 'Width and height targets',
    seoLi2: 'Aspect-ratio aware scaling',
    seoLi3: 'All processing stays local',
    activeTab: 'crop',
    enableCropResize: true
  },
  '/crop/crop-to-square': {
    title: 'Crop Image to Square Online Free',
    description: 'Crop an image to a square aspect ratio online for free. Perfect for profile pictures, avatars, and thumbnails.',
    canonicalPath: '/crop/crop-to-square',
    heroTitle: 'Crop Image to Square',
    heroSubtitle: 'Create 1:1 square crops for profile images, product cards, and social posts.',
    seoH2: 'Square Image Cropper (1:1)',
    seoP1: 'Quickly crop photos into a clean square frame with precise handle control.',
    seoP2: 'Download in JPG, PNG, WEBP, or AVIF.',
    seoLi1: '1:1 crop preset',
    seoLi2: 'Interactive crop frame',
    seoLi3: 'No watermark',
    activeTab: 'crop',
    cropPreset: 'square'
  },
  '/crop/crop-to-16-9': {
    title: 'Crop Image to 16:9 Online Free',
    description: 'Crop images to 16:9 aspect ratio online for free. Useful for video thumbnails, banners, and widescreen layouts.',
    canonicalPath: '/crop/crop-to-16-9',
    heroTitle: 'Crop Image to 16:9',
    heroSubtitle: 'Use a 16:9 crop area for YouTube thumbnails, hero banners, and widescreen content.',
    seoH2: '16:9 Aspect Ratio Image Crop',
    seoP1: 'Apply a widescreen crop ratio while keeping full control over image position.',
    seoP2: 'Export instantly with your preferred format and quality settings.',
    seoLi1: '16:9 preset for wide layouts',
    seoLi2: 'Drag to reposition framing',
    seoLi3: 'Fast browser-only workflow',
    activeTab: 'crop',
    cropPreset: '16:9'
  },
  '/compress': {
    title: 'Compress Image Online Free | JPG WEBP AVIF PNG',
    description: 'Compress images online for free while preserving pixel dimensions. Adjust quality and export optimized files quickly.',
    canonicalPath: '/compress',
    ogTitle: 'Compress Image Online Free | ImgConvertCrop',
    twitterTitle: 'Compress Image Online Free | ImgConvertCrop',
    heroTitle: 'Free Image Compressor',
    heroSubtitle: 'Reduce image file size for faster websites and easier sharing while keeping dimensions.',
    seoH2: 'Compress Images Without Changing Dimensions',
    seoP1: 'Lower encoded quality to shrink file size while keeping original width and height.',
    seoP2: 'Ideal for websites, email attachments, and upload limits.',
    seoLi1: 'Control compression quality',
    seoLi2: 'Keep original pixel dimensions',
    seoLi3: 'Export to JPG, WEBP, AVIF, or PNG',
    activeTab: 'compress'
  },
  '/compress/jpeg': {
    title: 'JPEG Compressor Online Free',
    description: 'Compress JPEG images online for free. Reduce JPG/JPEG file size with adjustable quality settings.',
    canonicalPath: '/compress/jpeg',
    heroTitle: 'JPEG Compressor',
    heroSubtitle: 'Shrink JPG/JPEG files quickly while balancing quality and size.',
    seoH2: 'Compress JPEG Files Online',
    seoP1: 'Use quality controls to optimize JPEG output for web and sharing.',
    seoP2: 'No upload required: image processing stays in your browser.',
    seoLi1: 'JPEG-focused compression',
    seoLi2: 'Adjustable quality',
    seoLi3: 'Instant download',
    activeTab: 'compress',
    compressFormat: 'jpeg',
    compressQuality: 70
  },
  '/compress/webp': {
    title: 'WEBP Compressor Online Free',
    description: 'Compress WEBP images online for free with quality control. Optimize web images for faster loading.',
    canonicalPath: '/compress/webp',
    heroTitle: 'WEBP Compressor',
    heroSubtitle: 'Optimize WEBP file size for performance-focused websites and apps.',
    seoH2: 'Compress WEBP Images in Browser',
    seoP1: 'Tune compression quality and keep the same image dimensions.',
    seoP2: 'Works directly in-browser for speed and privacy.',
    seoLi1: 'WEBP output optimization',
    seoLi2: 'Preserve dimensions',
    seoLi3: 'No account needed',
    activeTab: 'compress',
    compressFormat: 'webp',
    compressQuality: 65
  },
  '/compress/avif': {
    title: 'AVIF Compressor Online Free',
    description: 'Compress AVIF images online free. Adjust AVIF quality and generate smaller files for modern web delivery.',
    canonicalPath: '/compress/avif',
    heroTitle: 'AVIF Compressor',
    heroSubtitle: 'Create smaller AVIF files with flexible quality settings for modern image pipelines.',
    seoH2: 'Compress AVIF Images with Quality Control',
    seoP1: 'AVIF offers efficient compression for many image types and use cases.',
    seoP2: 'If AVIF encoding is available in your browser, output is generated locally.',
    seoLi1: 'Modern AVIF optimization',
    seoLi2: 'In-browser compression workflow',
    seoLi3: 'Quick export and download',
    activeTab: 'compress',
    compressFormat: 'avif',
    compressQuality: 60
  },
  '/upscale': {
    title: 'Upscale Image Online Free | AI 2x 4x Resolution',
    description: 'AI-enhanced image upscaler in your browser. Improve perceived detail at 2x or 4x with on-device processing.',
    canonicalPath: '/upscale',
    ogTitle: 'Upscale Image Online Free | ImgConvertCrop',
    twitterTitle: 'Upscale Image Online Free | ImgConvertCrop',
    heroTitle: 'Free Image Upscaler',
    heroSubtitle: 'AI Enhance runs on your device to upscale at 2x or 4x with practical quality limits.',
    seoH2: 'AI-Enhanced Image Upscaling in Browser',
    seoP1: 'This mode uses a lightweight neural model to improve perceived sharpness and texture while enlarging your image.',
    seoP2: 'Everything stays in your browser, and progress is shown step-by-step from model load to export.',
    seoLi1: 'AI-enhanced 2x and 4x upscale',
    seoLi2: 'Progress and step status during inference',
    seoLi3: 'No image upload to server',
    activeTab: 'upscale',
    upscaleFormat: 'png',
    upscaleQuality: 100,
    upscaleScale: 2
  },
  '/remove': {
    title: 'Remove Object from Image Online Free | Brush + Inpaint',
    description: 'Paint over unwanted objects and remove them with in-browser inpainting. Zoom, adjust brush size, and download after preview.',
    canonicalPath: '/remove',
    ogTitle: 'Remove Object from Image Online Free | ImgConvertCrop',
    twitterTitle: 'Remove Object from Image Online Free | ImgConvertCrop',
    heroTitle: 'Free Object Remover',
    heroSubtitle: 'Paint the area to remove, run inpaint, preview the result, then confirm download.',
    seoH2: 'Remove Unwanted Objects with Brush Selection',
    seoP1: 'Upload an image, paint over the area you want to erase, and run object removal directly in your browser.',
    seoP2: 'This tool supports zoom for precise edits and keeps your file local for privacy.',
    seoLi1: 'Brush size control and zoom workspace',
    seoLi2: 'In-browser object removal algorithm',
    seoLi3: 'Download only after removal is finished',
    activeTab: 'remove'
  }
};

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function translateText(locale, text) {
  if (!text || locale === 'en') return text;
  return (copyTranslations[locale] && copyTranslations[locale][text]) || text;
}

function localizeSeoConfig(config, locale) {
  if (locale === 'en') return config;
  const localized = { ...config };
  const keys = [
    'title',
    'description',
    'canonicalPath',
    'ogTitle',
    'ogDescription',
    'twitterTitle',
    'twitterDescription',
    'heroTitle',
    'heroSubtitle',
    'seoH2',
    'seoP1',
    'seoP2',
    'seoLi1',
    'seoLi2',
    'seoLi3',
    'keywordTitle',
    'keywordText'
  ];
  keys.forEach((key) => {
    if (key === 'canonicalPath') return;
    if (typeof localized[key] === 'string') {
      localized[key] = translateText(locale, localized[key]);
    }
  });
  return localized;
}

function parseCookies(cookieHeader) {
  if (!cookieHeader) return {};
  return cookieHeader.split(';').reduce((acc, item) => {
    const eq = item.indexOf('=');
    if (eq < 0) return acc;
    const key = item.slice(0, eq).trim();
    const value = item.slice(eq + 1).trim();
    acc[key] = decodeURIComponent(value);
    return acc;
  }, {});
}

function normalizeLocale(code) {
  if (!code) return null;
  const lowered = String(code).toLowerCase().trim();
  const base = lowered.split('-')[0];
  return supportedLocales.includes(base) ? base : null;
}

function detectPreferredLocale(req) {
  const cookies = parseCookies(req.headers.cookie);
  const cookieLocale = normalizeLocale(cookies.lang);
  if (cookieLocale) return cookieLocale;

  const raw = req.headers['accept-language'] || '';
  const entries = raw
    .split(',')
    .map((token) => {
      const parts = token.trim().split(';');
      const code = normalizeLocale(parts[0]);
      if (!code) return null;
      const qPart = parts.find((p) => p.trim().startsWith('q='));
      const q = qPart ? Number(qPart.split('=')[1]) : 1;
      return { code, q: Number.isFinite(q) ? q : 1 };
    })
    .filter(Boolean)
    .sort((a, b) => b.q - a.q);

  return (entries[0] && entries[0].code) || 'en';
}

function toLocalizedPath(locale, pathname) {
  return pathname === '/' ? `/${locale}` : `/${locale}${pathname}`;
}

function parseLocalizedPath(pathname) {
  const segments = pathname.split('/').filter(Boolean);
  const locale = normalizeLocale(segments[0]);
  if (!locale) {
    return { hasLocalePrefix: false, locale: null, basePath: pathname };
  }
  const rest = `/${segments.slice(1).join('/')}`;
  return {
    hasLocalePrefix: true,
    locale,
    basePath: rest === '/' ? '/' : rest.replace(/\/+$/, '') || '/'
  };
}

function buildRelatedLinksHtml(pathname, activeTab, locale) {
  const links = toolInternalLinks[activeTab] || [];
  const filtered = links.filter((item) => item.href !== pathname);
  return filtered
    .map((item) => `<li><a href="${toLocalizedPath(locale, item.href)}">${escapeHtml(translateText(locale, item.label))}</a></li>`)
    .join('');
}

function buildAlternateLinks(pathname) {
  const links = supportedLocales
    .map((locale) => {
      const href = `https://imgconvertcrop.com${toLocalizedPath(locale, pathname)}`;
      const hreflang = locale === 'en' ? 'en-US' : locale;
      return `<link rel="alternate" hreflang="${hreflang}" href="${href}" />`;
    })
    .join('');
  const xDefault = `<link rel="alternate" hreflang="x-default" href="https://imgconvertcrop.com${toLocalizedPath('en', pathname)}" />`;
  return `${links}${xDefault}`;
}

function buildLocaleOptionsHtml(locale) {
  return supportedLocales
    .map((code) => {
      const selected = code === locale ? ' selected' : '';
      const label = escapeHtml(localeMeta[code].name);
      return `<option value="${code}"${selected}>${label}</option>`;
    })
    .join('');
}

function renderPage(pathname, locale) {
  const config = localizeSeoConfig({ ...defaultSeo, ...(pages[pathname] || {}) }, locale);
  const canonicalPath = toLocalizedPath(locale, config.canonicalPath);
  const canonical = `https://imgconvertcrop.com${canonicalPath}`;
  const keywordText =
    config.keywordText || translateText(locale, toolKeywordCopy[config.activeTab]) || translateText(locale, defaultSeo.keywordText);
  const relatedLinksHtml = buildRelatedLinksHtml(pathname, config.activeTab, locale);
  const tabClasses = {
    convertBtn: config.activeTab === 'convert' ? 'active' : '',
    cropBtn: config.activeTab === 'crop' ? 'active' : '',
    compressBtn: config.activeTab === 'compress' ? 'active' : '',
    upscaleBtn: config.activeTab === 'upscale' ? 'active' : '',
    removeBtn: config.activeTab === 'remove' ? 'active' : '',
    convertPanel: config.activeTab === 'convert' ? 'active' : '',
    cropPanel: config.activeTab === 'crop' ? 'active' : '',
    compressPanel: config.activeTab === 'compress' ? 'active' : '',
    upscalePanel: config.activeTab === 'upscale' ? 'active' : '',
    removePanel: config.activeTab === 'remove' ? 'active' : ''
  };

  const pageConfigJson = JSON.stringify({
    locale,
    basePath: pathname,
    activeTab: config.activeTab,
    convertFormat: config.convertFormat,
    convertQuality: config.convertQuality,
    compressFormat: config.compressFormat,
    compressQuality: config.compressQuality,
    upscaleFormat: config.upscaleFormat,
    upscaleQuality: config.upscaleQuality,
    upscaleScale: config.upscaleScale,
    cropPreset: config.cropPreset,
    enableCropResize: config.enableCropResize
  });

  const replacements = {
    __HTML_LANG__: localeMeta[locale].htmlLang,
    __HTML_DIR__: localeMeta[locale].dir,
    __META_DESCRIPTION__: escapeHtml(config.description),
    __CANONICAL_URL__: canonical,
    __ALT_HREFLANG_LINKS__: buildAlternateLinks(config.canonicalPath),
    __OG_TITLE__: escapeHtml(config.ogTitle || config.title),
    __OG_DESCRIPTION__: escapeHtml(config.ogDescription || config.description),
    __TWITTER_TITLE__: escapeHtml(config.twitterTitle || config.title),
    __TWITTER_DESCRIPTION__: escapeHtml(config.twitterDescription || config.description),
    __PAGE_TITLE__: escapeHtml(config.title),
    __HERO_TITLE__: escapeHtml(config.heroTitle),
    __HERO_SUBTITLE__: escapeHtml(config.heroSubtitle),
    __SEO_H2__: escapeHtml(config.seoH2),
    __SEO_P1__: escapeHtml(config.seoP1),
    __SEO_P2__: escapeHtml(config.seoP2),
    __SEO_LI_1__: escapeHtml(config.seoLi1),
    __SEO_LI_2__: escapeHtml(config.seoLi2),
    __SEO_LI_3__: escapeHtml(config.seoLi3),
    __KEYWORD_TITLE__: escapeHtml(config.keywordTitle),
    __KEYWORD_TEXT__: escapeHtml(keywordText),
    __RELATED_LINKS_HTML__: relatedLinksHtml,
    __LANG_OPTIONS_HTML__: buildLocaleOptionsHtml(locale),
    __CONVERT_TAB_ACTIVE__: tabClasses.convertBtn,
    __CROP_TAB_ACTIVE__: tabClasses.cropBtn,
    __COMPRESS_TAB_ACTIVE__: tabClasses.compressBtn,
    __UPSCALE_TAB_ACTIVE__: tabClasses.upscaleBtn,
    __REMOVE_TAB_ACTIVE__: tabClasses.removeBtn,
    __CONVERT_PANEL_ACTIVE__: tabClasses.convertPanel,
    __CROP_PANEL_ACTIVE__: tabClasses.cropPanel,
    __COMPRESS_PANEL_ACTIVE__: tabClasses.compressPanel,
    __UPSCALE_PANEL_ACTIVE__: tabClasses.upscalePanel,
    __REMOVE_PANEL_ACTIVE__: tabClasses.removePanel,
    __PAGE_CONFIG_JSON__: pageConfigJson
  };

  return Object.keys(replacements).reduce((html, key) => {
    return html.split(key).join(replacements[key]);
  }, template);
}

app.use(express.static(publicDir, { index: false }));

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/editor', (_req, res) => {
  res.type('html').sendFile(path.join(publicDir, 'editor.html'));
});

app.get('/:locale/editor', (req, res, next) => {
  const locale = normalizeLocale(req.params.locale);
  if (!locale) {
    next();
    return;
  }
  res.setHeader('Set-Cookie', `lang=${locale}; Path=/; Max-Age=31536000; SameSite=Lax`);
  res.type('html').sendFile(path.join(publicDir, 'editor.html'));
});

app.get('*', (req, res, next) => {
  if (req.path.length > 1 && req.path.endsWith('/') && req.path !== '/') {
    const normalized = req.path.replace(/\/+$/, '');
    const parsed = parseLocalizedPath(normalized);
    if (pages[normalized] || (parsed.hasLocalePrefix && pages[parsed.basePath])) {
      res.redirect(301, normalized);
      return;
    }
  }
  next();
});

app.get('*', (req, res, next) => {
  const { hasLocalePrefix, locale, basePath } = parseLocalizedPath(req.path);

  if (!hasLocalePrefix) {
    if (!pages[req.path]) {
      next();
      return;
    }
    const preferred = detectPreferredLocale(req);
    res.redirect(302, toLocalizedPath(preferred, req.path));
    return;
  }

  if (!pages[basePath]) {
    next();
    return;
  }

  res.setHeader('Set-Cookie', `lang=${locale}; Path=/; Max-Age=31536000; SameSite=Lax`);
  res.type('html').send(renderPage(basePath, locale));
});

app.listen(port, () => {
  console.log(`Image converter running on http://localhost:${port}`);
});
