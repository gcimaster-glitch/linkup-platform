const puppeteer = require('puppeteer');

(async () => {
    console.log('🧪 LinkUp フルテスト開始\n');
    
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // コンソールログをキャプチャ
    page.on('console', msg => {
        const text = msg.text();
        if (text.includes('❌') || text.includes('ERROR') || text.includes('Failed')) {
            console.log('🔴 Console Error:', text);
        }
    });
    
    try {
        console.log('【1】ホームページアクセス');
        await page.goto('https://link-up.live/', { waitUntil: 'networkidle2', timeout: 30000 });
        console.log('✅ ホームページ読み込み成功\n');
        
        // バージョン確認
        const version = await page.evaluate(() => {
            const logs = [];
            console.defaultLog = console.log.bind(console);
            console.logs = [];
            console.log = function(){
                console.defaultLog.apply(console, arguments);
                console.logs.push(Array.from(arguments));
            }
            return document.title;
        });
        console.log('📄 Page Title:', version);
        
        console.log('\n【2】ログインモーダルを開く');
        // ログインボタンを探す
        await page.waitForSelector('button, a', { timeout: 5000 });
        
        // ページのHTMLを確認してログイン方法を見つける
        const loginMethod = await page.evaluate(() => {
            // ログインボタンを探す
            const buttons = Array.from(document.querySelectorAll('button, a'));
            const loginBtn = buttons.find(btn => 
                btn.textContent.includes('ログイン') || 
                btn.textContent.includes('Login')
            );
            
            if (loginBtn) {
                return { found: true, text: loginBtn.textContent };
            }
            return { found: false };
        });
        
        if (loginMethod.found) {
            console.log('✅ ログインボタン発見:', loginMethod.text);
            
            // ログインボタンをクリック
            await page.evaluate(() => {
                const buttons = Array.from(document.querySelectorAll('button, a'));
                const loginBtn = buttons.find(btn => 
                    btn.textContent.includes('ログイン') || 
                    btn.textContent.includes('Login')
                );
                if (loginBtn) loginBtn.click();
            });
            
            console.log('🔄 ログインモーダル待機中...');
            await page.waitForTimeout(2000);
            
            console.log('\n【3】ログイン情報入力');
            // メールアドレス入力
            const emailInput = await page.$('input[type="email"], input[name="email"], input[placeholder*="メール"]');
            if (emailInput) {
                await emailInput.type('user@demo.com');
                console.log('✅ メールアドレス入力: user@demo.com');
            } else {
                console.log('❌ メールアドレス入力欄が見つかりません');
            }
            
            // パスワード入力
            const passwordInput = await page.$('input[type="password"], input[name="password"]');
            if (passwordInput) {
                await passwordInput.type('demo');
                console.log('✅ パスワード入力: demo');
            } else {
                console.log('❌ パスワード入力欄が見つかりません');
            }
            
            // ログインボタンをクリック
            await page.evaluate(() => {
                const buttons = Array.from(document.querySelectorAll('button'));
                const submitBtn = buttons.find(btn => 
                    btn.textContent.includes('ログイン') && 
                    !btn.textContent.includes('新規')
                );
                if (submitBtn) {
                    console.log('🔘 ログインボタンクリック');
                    submitBtn.click();
                }
            });
            
            console.log('🔄 ログイン処理待機中...');
            await page.waitForTimeout(3000);
            
            // 現在のURL確認
            const currentUrl = page.url();
            console.log('📍 現在のURL:', currentUrl);
            
            if (currentUrl.includes('dashboard')) {
                console.log('✅ ダッシュボードにリダイレクト成功\n');
                
                console.log('【4】ダッシュボード表示確認');
                await page.waitForTimeout(2000);
                
                // ページの内容を確認
                const dashboardContent = await page.evaluate(() => {
                    const body = document.body.textContent;
                    return {
                        hasContent: body.length > 100,
                        isWhiteScreen: body.trim().length < 50,
                        bodyLength: body.length,
                        title: document.title
                    };
                });
                
                console.log('📊 ダッシュボード状態:');
                console.log('  - コンテンツあり:', dashboardContent.hasContent);
                console.log('  - 白画面:', dashboardContent.isWhiteScreen);
                console.log('  - コンテンツ長:', dashboardContent.bodyLength, 'chars');
                
                if (dashboardContent.isWhiteScreen) {
                    console.log('\n❌ 白画面問題が発生しています！');
                    
                    // スクリーンショットを撮る
                    await page.screenshot({ path: '/home/user/webapp/dashboard-error.png' });
                    console.log('📸 スクリーンショット保存: dashboard-error.png');
                } else {
                    console.log('\n✅ ダッシュボードが正常に表示されています');
                }
                
                console.log('\n【5】チケットタブテスト');
                // チケットタブをクリック
                const ticketsClicked = await page.evaluate(() => {
                    const buttons = Array.from(document.querySelectorAll('button, a'));
                    const ticketsBtn = buttons.find(btn => 
                        btn.textContent.includes('チケット')
                    );
                    if (ticketsBtn) {
                        ticketsBtn.click();
                        return true;
                    }
                    return false;
                });
                
                if (ticketsClicked) {
                    console.log('✅ チケットタブクリック');
                    await page.waitForTimeout(2000);
                    
                    const ticketsContent = await page.evaluate(() => {
                        const body = document.body.textContent;
                        return {
                            hasTicketsText: body.includes('チケット'),
                            isEmpty: body.includes('購入していません') || body.includes('がありません'),
                            hasError: body.includes('エラー') || body.includes('失敗'),
                            isWhite: body.trim().length < 50
                        };
                    });
                    
                    console.log('📊 チケットタブ状態:');
                    console.log('  - チケット表示:', ticketsContent.hasTicketsText);
                    console.log('  - 空状態メッセージ:', ticketsContent.isEmpty);
                    console.log('  - エラー:', ticketsContent.hasError);
                    console.log('  - 白画面:', ticketsContent.isWhite);
                } else {
                    console.log('⚠️  チケットタブボタンが見つかりません');
                }
                
                console.log('\n【6】決済履歴タブテスト');
                // 決済履歴タブをクリック
                const paymentsClicked = await page.evaluate(() => {
                    const buttons = Array.from(document.querySelectorAll('button, a'));
                    const paymentsBtn = buttons.find(btn => 
                        btn.textContent.includes('決済') || btn.textContent.includes('支払')
                    );
                    if (paymentsBtn) {
                        paymentsBtn.click();
                        return true;
                    }
                    return false;
                });
                
                if (paymentsClicked) {
                    console.log('✅ 決済履歴タブクリック');
                    await page.waitForTimeout(2000);
                    
                    const paymentsContent = await page.evaluate(() => {
                        const body = document.body.textContent;
                        return {
                            hasPaymentsText: body.includes('決済') || body.includes('支払'),
                            isEmpty: body.includes('がありません'),
                            hasError: body.includes('エラー') || body.includes('失敗'),
                            isWhite: body.trim().length < 50
                        };
                    });
                    
                    console.log('📊 決済履歴タブ状態:');
                    console.log('  - 決済履歴表示:', paymentsContent.hasPaymentsText);
                    console.log('  - 空状態メッセージ:', paymentsContent.isEmpty);
                    console.log('  - エラー:', paymentsContent.hasError);
                    console.log('  - 白画面:', paymentsContent.isWhite);
                } else {
                    console.log('⚠️  決済履歴タブボタンが見つかりません');
                }
                
            } else {
                console.log('❌ ダッシュボードにリダイレクトされませんでした');
                console.log('   ログインに失敗した可能性があります');
            }
            
        } else {
            console.log('❌ ログインボタンが見つかりません');
        }
        
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ テスト完了');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        
    } catch (error) {
        console.error('\n❌ テスト中にエラーが発生:', error.message);
        await page.screenshot({ path: '/home/user/webapp/error-screenshot.png' });
        console.log('📸 エラースクリーンショット: error-screenshot.png');
    } finally {
        await browser.close();
    }
})();
