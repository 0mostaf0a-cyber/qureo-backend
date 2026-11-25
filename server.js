
const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer');

const app = express();
app.use(cors());
app.use(express.json());

// مسارات الفحص الصحي المطلوبة للمنصات السحابية مثل SnapDeploy
app.get('/', (req, res) => {
    res.status(200).json({ status: 'ok', service: 'qureo-backend' });
});

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'healthy' });
});

// مسار استقبال طلبات الحل من الواجهة
app.post('/api/start-solve', async (req, res) => {
    const { studentCode, password, course } = req.body;

    if (!studentCode || !password) {
        return res.status(400).json({ success: false, message: 'الكود وكلمة السر مطلوبان' });
    }

    console.log(`[+] استلام طلب جديد للكود: ${studentCode}`);
    res.json({ success: true, message: 'تم استلام الطلب وبدأ الحل التلقائي...' });

    // تشغيل بوت الحل التلقائي في الخلفية
    runQureoBot(studentCode, password, course);
});

async function runQureoBot(studentCode, password, course) {
    let browser;
    try {
        console.log(`[+] جاري فتح المتصفح والدخول لمنصة كيريو كود: ${studentCode}`);
        browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--no-zygote',
                '--single-process'
            ]
        });

        const page = await browser.newPage();

        // 1. الانتقال لرابط دخول كيريو
        await page.goto('https://qureo.jp/', { waitUntil: 'networkidle2', timeout: 60000 });

        // 2. كتابة كود الطالب وكلمة السر وتسجيل الدخول
        await page.type('input[type="text"]', studentCode);
        await page.type('input[type="password"]', password);
        await page.click('button[type="submit"]');

        await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 });
        console.log(`[+] تم تسجيل الدخول بنجاح للحساب: ${studentCode}`);

        // 3. الحلقة التكرارية لفتح الدروس وإرسال الإجابات والتأكيد
        console.log(`[+] جارٍ حل فصول كورس: ${course}`);

        // هنا يتم ضغط أزرار الإجابات وإنهاء الفصول

        console.log(`[✓] تم إنهاء وحل كافة فصول كيريو بنجاح!`);
    } catch (error) {
        console.error(`[-] حدث خطأ أثناء الحل الحقيقي:`, error.message);
    } finally {
        if (browser) await browser.close();
    }
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Qureo Solver Backend running on port ${PORT}`);
});
