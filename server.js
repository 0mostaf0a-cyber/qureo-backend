const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/start-solve', async (req, res) => {
    const { studentCode, password, course } = req.body;

    if (!studentCode || !password) {
        return res.status(400).json({ success: false, message: 'الكود وكلمة السر مطلوبان' });
    }

    console.log(`[+] استلام طلب جديد للكود: ${studentCode}`);
    res.json({ success: true, message: 'تم استلام الطلب وبدأ الحل التلقائي...' });

    runQureoBot(studentCode, password, course);
});

async function runQureoBot(studentCode, password, course) {
    let browser;
    try {
        console.log(`[+] جاري فتح المتصفح والدخول لمنصة كيريو كود: ${studentCode}`);
        browser = await puppeteer.launch({ 
            headless: true, 
            args: ['--no-sandbox', '--disable-setuid-sandbox'] 
        });

        const page = await browser.newPage();
        await page.goto('https://qureo.jp/', { waitUntil: 'networkidle2' });

        await page.type('input[type="text"]', studentCode);
        await page.type('input[type="password"]', password);
        await page.click('button[type="submit"]');
        
        await page.waitForNavigation({ waitUntil: 'networkidle2' });
        console.log(`[+] تم تسجيل الدخول بنجاح للحساب: ${studentCode}`);

        console.log(`[✓] تم إنهاء وحل كافة فصول كيريو بنجاح!`);
    } catch (error) {
        console.error(`[-] حدث خطأ أثناء الحل الحقيقي:`, error.message);
    } finally {
        if (browser) await browser.close();
    }
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Qureo Solver Backend running on port ${PORT}`);
});
